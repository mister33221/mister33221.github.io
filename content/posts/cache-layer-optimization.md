---
title: "Cache 下沉策略：為什麼我們把快取從 Service 層移到 Repository 層"
date: "2026-03-30"
category: "Performance"
tags: ["Spring Boot", "Caffeine", "Cache", "Performance", "Java"]
summary: "記錄 Query API 的快取演進過程：從 Service 層快取到下沉 Repository 層，以及為什麼這個決策能有效提升高併發場景下的命中率與可維護性。"
published: true
---

## 背景

我遇到這個問題的專案，是一個可能有大流量查詢的系統，為了達到壓測目標，決定引入 Redis 與 Caffeine 快取。

壓測目標為同時承受 SIT 50 RPS、PROD 150 RPS 的流量，平均回應時間要在 0.5 秒以內。一開始快取的演進路徑是這樣的：

1. 早期：大量 `@Cacheable` 寫在 Service / UseCase 層（常見做法）
2. 遇到效能瓶頸：發現同一底層查詢被多個 UseCase 重複快取，記憶體壓力升高，且可能出現 key 漂移問題（同一筆查詢對應多個 key）
3. 改採**快取下沉策略**：將查詢快取移到 Repository Impl 層

---

## 架構定位

```
請求
 ↓
Spring Cache (@Cacheable)
 ↓ miss
AbstractRedisAwareRepository
 ├── Redis 可用 + 資料已就緒 → 讀 Redis
 └── Redis 不可用 / 資料未就緒 → fallback DB
```

Redis 在這裡的角色是**資料來源**，類似一個高效能的 KV 資料庫，由 `AbstractRedisAwareRepository` 控制讀取路徑與 fallback 邏輯。它不是 `CacheManager` 的實作，不接入 Spring Cache。

Caffeine 才是 Spring Cache 的實作，負責短時間內的重複請求攔截。

---

## 為什麼要把快取下沉？

### 問題一：Service 層的 cache key 容易漂移

Service 和 UseCase 收到的通常是複合 DTO，如果直接拿整包物件當 key，會因為：

- 欄位順序差異
- 非關鍵欄位（如分頁參數、sort 方向）存在

導致邏輯上「同一筆查詢」對應到不同 cache key，命中率大幅下降。

### 問題二：同一底層查詢被多個 UseCase 重複快取

假設有三個 UseCase 都需要「帳戶清單」：

```
UseCase A → @Cacheable → AccountService.getAccounts(userId)
UseCase B → @Cacheable → AccountService.getAccounts(userId)
UseCase C → @Cacheable → AccountService.getAccounts(userId)
```

三個快取 entry，存的是同一份資料。浪費記憶體，也讓失效策略難以管理。

### 問題三：Service 層快取的範圍難以治理

快取規則分散在多個 Service / UseCase，key 命名沒有統一規範，隨著功能增加越來越難一眼掌握「現在系統到底快取了什麼」。

---

## 下沉後的架構

把 `@Cacheable` 統一移到 Repository Impl：

```java
// AccountRepositoryImpl.java
@Override
@Cacheable(
    value = "Query",
    key = "'findAccountsByUserId:' + #userId + ':' + #dataDate"
)
public List<Account> findAccountsByUserId(String userId, String dataDate) {
    // 實際查詢 DB 或 Redis
    return abstractRedisAwareRepository.queryOrFallback(userId, dataDate);
}
```

**key 的組成原則**：
1. 前綴 = 方法語意（直接對應查詢行為）
2. 只放「真正影響查詢結果」的條件
3. List 參數先排序再組 key，避免 `[A, B]` 和 `[B, A]` 被視為不同 key

---

## 快取配置

快取參數統一定義在各環境的 YAML，透過自訂的 `AppCacheProperties` 動態注入：

```yaml
app:
  cache:
    - name: CurrDataDate
      initial-capacity: 1
      maximum-size: 1
      expire-after-write-second: 60
    - name: RedisStatus
      initial-capacity: 1
      maximum-size: 1
      expire-after-write-second: 60
    - name: Query
      initial-capacity: 100
      maximum-size: 1000
      expire-after-write-second: 600
    - name: ErrorMessage
      initial-capacity: 50
      maximum-size: 100
      expire-after-write-second: 600
```

`Query` 是大多數查詢結果的 cache，capacity 1000、TTL 10 分鐘。日期/狀態類快取（`CurrDataDate`、`RedisStatus`）設短 TTL（60 秒），確保及時反映最新狀態。

`CacheManagerPostProcessor` 負責讀取這份設定並動態建立對應的 Caffeine cache instance，同時掛上**每日 06:00 的排程全清**，避免資料累積到隔天產生髒讀。

---

## TTL 與容量調整的先後順序

遇到效能問題時，調整順序很重要，否則容易調錯地方：

1. **先看 key 是否分散**：hit rate 低通常不是 TTL 不夠長，而是 key 組法有問題
2. **再調整容量**（`maximum-size`）：容量不足會導致頻繁淘汰
3. **最後才調 TTL**：延長 TTL 有資料新鮮度的風險，應該最後才碰

---

## 常見陷阱

### 同類別內部呼叫繞過 Spring Proxy

```java
// ❌ 這樣 @Cacheable 不會生效
@Service
public class AssetService {
    public List<Asset> getAssets(String userId) {
        return this.findAssets(userId); // 內部呼叫，繞過 AOP proxy
    }

    @Cacheable(value = "Query", key = "#userId")
    public List<Asset> findAssets(String userId) {
        // ...
    }
}
```

Spring Cache 是透過 AOP proxy 攔截方法呼叫，類別內部的直接呼叫不會經過 proxy，快取完全無效。解法：把 `@Cacheable` 的方法拆到另一個 Spring Bean，或用 `self` 注入。

### 只看平均回應時間

壓測時只看平均值容易漏掉尾延遲。一個 P99 500ms 的 API，平均可能只有 80ms，感覺很好，但每 100 個請求就有一個用戶在等半秒以上。**同時追蹤 P95 和 P99** 才能真正掌握使用者體驗。

### 多層重複快取

Service 和 Repository 同時快取同一個查詢，hit rate 的統計會失真（到底是誰命中的？），失效時也要兩層都清，維護成本翻倍。

---

## 效能驗證結果

以下是引入快取下沉後，在壓測環境的驗證結果：

| 環境 | 目標 RPS | 平均回應時間 | P95 | P99 | 是否通過 |
|------|---------|------------|-----|-----|---------|
| SIT  | 50      | ≤ 0.5s     | 通過 | 通過 | ✓ |
| PROD | 150     | ≤ 0.5s     | 通過 | 通過 | ✓ |

---

## PR 審查清單

新增或修改快取時，以下幾點是 code review 的審查重點：

- [ ] `@Cacheable` 是否位於 repository impl（而非 service / use case）
- [ ] key 命名是否可讀、不衝突，且只包含必要查詢條件
- [ ] 對應環境的 `app.cache` 是否同步調整
- [ ] 是否附上壓測前後的對比數據（avg / P95 / P99 / DB QPS）
- [ ] 是否說明失效策略（時間過期 / `@CacheEvict` / 排程清除）

---

## 小結

快取下沉的核心思想是：**讓快取盡量貼近它保護的那個操作**。Repository 層是資料查詢的執行點，在這裡加快取最直接，key 的語意最清晰，也最容易治理。

Service 層的快取並非完全不對，但如果你遇到以下症狀，就值得考慮下沉：

- 命中率低但說不清楚為什麼
- 多個 UseCase 快取了感覺一樣的資料
- 記憶體用量持續上升

這三個症狀，我們都碰到過。
