---
title: "非同步 Token 預取：用執行緒池 + Double-Checked Locking 解決 Thundering Herd"
date: "2026-03-30"
category: "Backend"
tags: ["Java", "Concurrency", "Spring Boot", "Thread Pool", "Performance"]
summary: "記錄在整合外部 API 時，如何透過 Double-Checked Locking、細粒度鎖定與非同步預取機制，解決高併發下的 Token 雷擊效應，將首次請求從 1300ms 降至 800ms，後續請求降至 8ms。"
published: true
---

## 問題背景

系統需要整合 8 個外部 API 平台（每個平台提供不同的金融資料），每個平台都有獨立的認證 Token，有效期 10 分鐘。

**傳統的同步取 Token 流程**：

```
用戶請求查詢
  ↓
呼叫業務 API
  ↓
發現 Token 不存在或已過期
  ↓
同步呼叫 /auth-token API（等待 500ms）
  ↓
取得 Token
  ↓
重新呼叫業務 API（等待 800ms）
  ↓
返回結果

總耗時：500 + 800 = 1300ms
```

這個流程在高併發下會引發 **Thundering Herd（雷擊效應）**：Token 過期時，同時進入的 N 個請求都發現 Token 不存在，全部一起去打 `/auth-token` API，造成瞬間大量重複呼叫，外部 API 開始回 429。

---

## 解決方案設計

最終採用四個機制組合：

| 機制 | 解決的問題 |
|------|-----------|
| Application-level Token 共享 | 減少 API 呼叫頻率（同一平台的所有請求共用 1 個 Token，8 個平台對應 8 個 Token） |
| Double-Checked Locking | 避免 Token 不存在時的重複呼叫 |
| 細粒度鎖定（per channelId） | 不同平台的請求互不阻塞 |
| 非同步預取 + CAS 防重複 | Token 到期前背景更新，用戶無感 |

---

## 核心實作：`getOrFetchToken`

```java
public String getOrFetchToken(String channelId, String clientSecret) {
    TokenCache cached = tokenStore.get(channelId); // volatile read（ConcurrentHashMap）

    // ========== Fast Path：無鎖，99% 的請求走這條路徑 ==========
    if (cached != null && !isTokenExpired(cached)) {
        long remaining = calculateRemainingSeconds(cached);

        // 剩餘 < 180 秒時，非同步預取（不阻塞主請求）
        if (isTokenExpiringSoon(cached)) {
            asyncRefreshToken(channelId, clientSecret);
        }

        return cached.getAccessToken();
    }

    // ========== Slow Path：Token 不存在或已過期，需要取鎖 ==========
    ReentrantLock lock = getLock(channelId); // 每個 channelId 獨立的鎖
    lock.lock();
    try {
        // 第二次檢查：其他執行緒可能已在此期間更新
        cached = tokenStore.get(channelId);
        if (cached != null && !isTokenExpired(cached)) {
            return cached.getAccessToken(); // 直接返回，不再呼叫 API
        }

        // 真正需要取得新 Token
        String newToken = fetchTokenFromExternalApi(channelId, clientSecret);
        tokenStore.put(channelId, TokenCache.builder()
                .accessToken(newToken)
                .expiresIn(defaultExpireSeconds)
                .fetchedAt(Instant.now())
                .build());
        return newToken;

    } finally {
        lock.unlock();
    }
}
```

### 為什麼需要兩次檢查？

這就是 Double-Checked Locking（DCL）的核心：

```
100 個並發請求同時到達，Token 剛好過期：

Thread 1：第一次檢查 → Token 不存在 → 取得鎖（成功）
Thread 2-100：第一次檢查 → Token 不存在 → 等待鎖（阻塞）

Thread 1 取到鎖後：
  第二次檢查 → 確認仍不存在
  呼叫 API（500ms）
  寫入快取
  釋放鎖

Thread 2 取到鎖：
  第二次檢查 → 快取存在（Thread 1 剛寫入）
  直接返回快取 Token ← 這裡就是第二次檢查的價值

Thread 3-100：同 Thread 2

結果：100 個請求，只有 1 次 API 呼叫
```

沒有第二次檢查，Thread 2 取到鎖後會再呼叫一次 API，所有等待的執行緒依序全都呼叫，問題依舊。

### 為什麼不需要 volatile？

傳統 DCL Singleton 需要 `volatile`，因為 JVM 可能將物件初始化的步驟重排序，導致其他執行緒看到一個「已分配記憶體但尚未初始化」的物件。

本實作用的是 `ConcurrentHashMap`，它的 `put` 和 `get` 內部已包含記憶體屏障（volatile write/read），可以保證 Happens-Before：

```
Thread A：tokenStore.put(channelId, newCache)   // volatile write
           ↓ happens-before
Thread B：tokenStore.get(channelId)             // volatile read
```

因此 Thread B 讀到的 TokenCache 一定是完整初始化後的物件，不需要額外加 `volatile`。

---

## 非同步預取

非同步預取是讓後續請求幾乎零延遲的關鍵：

```
Token 生命週期（10 分鐘）：

0s          360s         540s         600s
├─────────────┼─────────────┼────────────┤
新 Token      觸發背景預取   提前緩衝過期   真正失效
```

- **剩餘 < 180 秒**：觸發背景預取
- **提前 60 秒緩衝**：避免邊界時間仍在使用即將過期的 Token（考慮到 API 呼叫本身的耗時）

### CAS 防重複觸發

```java
private final AtomicBoolean refreshing = new AtomicBoolean(false);

private void asyncRefreshToken(String channelId, String clientSecret) {
    // 原子操作：只有一個執行緒能成功設為 true
    if (refreshing.compareAndSet(false, true)) {
        executor.execute(() -> {
            try {
                ReentrantLock lock = getLock(channelId);
                if (lock.tryLock()) { // 取不到鎖就跳過，不等待
                    try {
                        // 再次確認是否需要預取
                        TokenCache current = tokenStore.get(channelId);
                        if (current != null && !isTokenExpired(current)) return;

                        String newToken = fetchTokenFromExternalApi(channelId, clientSecret);
                        tokenStore.put(channelId, buildCache(newToken));
                    } finally {
                        lock.unlock();
                    }
                }
            } finally {
                refreshing.set(false); // 重置，允許下次預取
            }
        });
    }
    // compareAndSet 失敗 → 已有其他執行緒在預取，直接忽略
}
```

100 個請求同時觸發預取，只有 1 個能成功 `compareAndSet(false, true)`，其餘直接跳過。

注意非同步預取使用 `tryLock()`，取不到鎖就跳過，而主請求路徑使用 `lock.lock()` 必須等待。這是刻意的設計差異：預取是「最好有」，主請求是「一定要有」。

---

## 執行緒池設計

### 為什麼選 FixedThreadPool（5 個執行緒）？

```
任務量計算：
8 個 channelId × 每 10 分鐘 1 次預取 = 0.013 任務/秒

5 個執行緒的處理能力：
5 × (1 / 0.5 秒) = 10 任務/秒

處理速度遠大於提交速度 → 隊列不會累積
```

理論上用 `N_CPU × (1 + W/C)` 公式（W=500ms, C=50ms → 44 個執行緒），但任務量太少，5 個已完全夠用。

### 為什麼不用 `@Async`？

`@Async` 的問題：
1. 共用 Spring 預設執行緒池，可能與其他 `@Async` 任務互相影響
2. 執行緒命名不可控，`jstack` 時難以識別
3. 關閉邏輯不符合需求

自訂執行緒池的好處很直接，特別是命名：

```java
// jstack 輸出對比

// 預設命名：
"pool-1-thread-1" #12 daemon prio=5 ...  // 不知道是什麼用途

// 自訂命名：
"token-refresh-1" #12 daemon prio=5 ...  // 一眼看出是 Token 預取執行緒
```

### 自訂 ThreadFactory

```java
private static class TokenRefreshThreadFactory implements ThreadFactory {
    private final AtomicInteger threadNumber = new AtomicInteger(1);

    @Override
    public Thread newThread(Runnable r) {
        Thread t = new Thread(r, "token-refresh-" + threadNumber.getAndIncrement());
        t.setDaemon(true); // JVM 關閉時自動終止，不阻礙應用退出
        return t;
    }
}
```

`AtomicInteger` 而非 `int++`：`getAndIncrement()` 是原子操作，避免兩個執行緒同時取到相同的編號。

`setDaemon(true)`：若不設，這些執行緒是 User Thread，JVM 會等待所有 User Thread 結束才退出——`@PreDestroy` 超時後應用就掛著關不掉。

### 優雅關閉

```java
@PreDestroy
public void shutdown() {
    executor.shutdown(); // 停止接受新任務，等待現有任務完成

    try {
        if (!executor.awaitTermination(5, TimeUnit.SECONDS)) {
            List<Runnable> dropped = executor.shutdownNow(); // 超時後強制中斷
            log.warn("Executor forcefully shut down, {} tasks dropped", dropped.size());

            executor.awaitTermination(5, TimeUnit.SECONDS); // 給中斷信號一點時間
        }
    } catch (InterruptedException e) {
        executor.shutdownNow();
        Thread.currentThread().interrupt(); // 恢復中斷狀態
    }
}
```

為什麼有兩次 `awaitTermination`？第一次超時後 `shutdownNow()` 只是送出中斷信號，執行緒還需要時間處理中斷（清理資源等），第二次 `awaitTermination` 給這段時間。

---

## 效能數據

| 指標 | Before（同步） | After（非同步預取） | 改善 |
|------|--------------|-------------------|------|
| 首次請求響應時間 | 1300ms | 800ms | ↓ 38% |
| 後續請求響應時間 | 800ms | 8ms | ↓ 99% |
| API 呼叫頻率（每 10 分鐘）| 高（每次過期重複） | 2 次（1 初始 + 1 預取） | ↓ 83% |

壓測情境：100 個並發請求同時打同一個平台
- **Before**：瞬間產生 100 次 /auth-token 呼叫，外部 API 回 429，部分請求失敗
- **After**：只有 Thread 1 的 Slow Path 呼叫 1 次，其他 99 個等鎖後命中快取，0 次失敗

---

## 過期判斷的邊界處理

```java
private boolean isTokenExpired(TokenCache cache) {
    long expiresAtMillis = cache.getFetchedAt().toEpochMilli()
            + (cache.getExpiresIn() - EXPIRATION_BUFFER_SECONDS) * 1000L;
    return System.currentTimeMillis() >= expiresAtMillis;
}
```

為什麼要減 `EXPIRATION_BUFFER_SECONDS`（60 秒）？

```
沒有緩衝的邊界情境：
Token 剩餘 10 秒 → 系統判斷有效 → 發出請求
請求到達外部 API 耗時 5 秒 → Token 剩 5 秒
外部 API 處理耗時 3 秒 → Token 剩 2 秒
外部 API 驗證 Token → 可能已過期 → 回傳錯誤
```

提前 60 秒視為過期，確保 Token 到達外部 API 並被處理完畢前，都在有效期內。

---

## 監控重點

主要觀察幾個日誌訊息的比例：

```bash
# Token 快取命中（正常：佔絕大多數）
Token cache hit - ChannelId: PLATFORM_A, RemainingTime: 420s

# Slow Path 命中（少量，Token 過期瞬間）
Token was refreshed by another thread - ChannelId: PLATFORM_A

# 非同步預取觸發（每 10 分鐘一次，正常）
Scheduling async token refresh - ChannelId: PLATFORM_A

# 預取失敗（需要告警）
Async token refresh failed - ChannelId: PLATFORM_B, Error: Connection timeout
```

命中率異常下降，先查：
1. 預取是否失敗（`refresh failed` 日誌）
2. 執行緒池是否排隊（`threadpool/status` API）
3. 外部 API 是否異常（P99 延遲）

---

## 適用場景

**適合用這套機制的情境**：
- 外部 API Token 有固定有效期（5-30 分鐘）
- Token 是「平台級」而非「用戶級」（同個 channelId 可以共享）
- 高併發場景

**不適合的情境**：
- Token 是用戶級（每個用戶的 Token 不同，Application-level 共享策略失效）
- 單機低併發（見下方說明）

### 為什麼單機低併發不適合？

Thundering Herd 是純粹的「高併發 + 共享資源」問題。在低併發場景下，Token 過期瞬間同時到達的請求數量極少（例如每秒 5 個請求，Token 過期的那一毫秒頂多 1 個請求撞上），根本不會形成雷擊。

這套機制引入了以下複雜度：

```
自訂 ThreadFactory
  + FixedThreadPool 設定
  + AtomicBoolean CAS 防重複
  + ReentrantLock per channelId
  + Double-Checked Locking
  + @PreDestroy 優雅關閉
```

而 Caffeine 的 `LoadingCache` 已內建完整的原子載入語義：

```java
// Caffeine：同一 key 只有一個執行緒會執行 load，其他等待
LoadingCache<String, String> tokenCache = Caffeine.newBuilder()
    .expireAfterWrite(10, TimeUnit.MINUTES)
    .build(channelId -> fetchTokenFromExternalApi(channelId)); // 自動防重複呼叫
```

低併發下兩者效果完全相同，但 Caffeine 版本只需要 4 行。引入這套複雜機制不僅是殺雞用牛刀，還會增加維護負擔和出錯機率。
