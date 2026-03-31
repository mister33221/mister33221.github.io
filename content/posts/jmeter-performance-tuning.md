---
title: "JMeter 壓測實戰：從 TPS 80 到 450 的系統性效能調校"
date: "2026-03-30"
category: "Performance"
tags: ["JMeter", "Performance", "Spring Boot", "HikariCP", "G1GC", "Java"]
summary: "記錄一次完整的壓測調校過程：從初期 TPS 80、P95 2.1 秒，經過八個優化策略，達到 TPS 450、P95 450ms，並整理幾個反直覺的優化洞察。"
published: true
---

## 初始狀況

壓測的目標服務是 **Query-API**——整個系統的核心查詢層，直接承接來自多個上游系統的請求，並且共用同一個 Oracle。JMeter 直打 Query-API，不經過 Web-Backend，這樣才能精確定位 Query-API 本身的效能邊界。

初期數據不理想：

| 指標 | 初始值 | 目標 |
|------|--------|------|
| TPS | 80 | 150（PROD 9000 RPM） |
| 平均回應時間 | 850ms | ≤ 500ms |
| P95 | 2.1s | ≤ 500ms |
| P99 | 3.5s | — |
| CPU 使用率 | 85% | — |
| 錯誤率 | 3% | 近 0 |

部署架構：3 台 Query-API（各自搭配 Traffic-Controller 同機部署）共用單一 Oracle + Redis Cluster。所有實例共用同一個 Oracle，這個約束影響了多個優化決策，特別是連線池的計算方式。

---

## 瓶頸定位方法

優化前先定位問題，不然很可能調了一圈都在優化不是瓶頸的地方。

```
整體指標異常（TPS 低、延遲高）
      ↓
APM Trace 找慢請求
      ↓
Thread Dump 看執行緒狀態（WAITING / BLOCKED？）
      ↓
DB Slow Query Log 確認是否資料庫問題
      ↓
GC Log 看是否 Full GC 頻繁
```

這次的主要瓶頸依序是：SQL 查詢 → 連線池配置 → 快取命中率 → 執行緒池。

---

## 八個優化策略

### 策略一：SQL 查詢優化

最直接的瓶頸。N+1 查詢是最常見的問題：

```java
// 優化前：N 次查詢
for (String acctId : acctIds) {
    Balance balance = balanceRepo.findByAcctId(acctId); // 執行 N 次 SQL
}

// 優化後：1 次批次查詢
List<Balance> balances = balanceRepo.findByAcctIdIn(acctIds);
Map<String, Balance> balanceMap = balances.stream()
    .collect(Collectors.toMap(Balance::getAcctId, Function.identity()));
```

**效果**：DB 查詢時間從 120ms → 35ms（-71%），往返次數減少 80%。

另外補上缺少的索引，特別是 JOIN 欄位和 WHERE 條件的複合索引。可以透過 Oracle 的 `EXPLAIN PLAN` 確認是否走索引，還是全表掃描。

---

### 策略二：HikariCP 連線池調校（多機器環境特別注意）

這裡有個容易踩坑的地方：**連線池大小要考慮所有機器實例的總和**。

```yaml
# query-api/application-prod.yml

spring:
  datasource:
    hikari:
      # 計算方式：
      # Oracle 最大連線數：300
      # 保留給 DBA 管理工具：50
      # 可用連線：250
      # Query-API 有 3 台：250 / 3 ≈ 83，取 80 留緩衝
      maximum-pool-size: 80
      minimum-idle: 30
      connection-timeout: 20000      # 等待連線超時 20 秒
      idle-timeout: 300000           # 閒置連線超時 5 分鐘
      max-lifetime: 1200000          # 連線最大生命週期 20 分鐘
      leak-detection-threshold: 60000 # 連線洩漏偵測 60 秒
```

一開始每台設 150，3 台加起來 450，超過 Oracle 上限，直接出現連線拒絕錯誤。

`minimum-idle = 30`（約 37.5%）確保閒置期間也有常駐連線，不需要在請求突然進來時等連線建立的時間。

**效果**：連線等待時間從 450ms → 15ms，連線數穩定在 90（3 台共約 270），消除連線池耗盡錯誤。

---

### 策略三 & 四：快取 + Token 預取

快取策略詳見「[Cache 下沉策略](./cache-layer-optimization)」，Token 預取詳見「[非同步 Token 預取](./async-token-prefetch)」。

合計效果：
- 快取命中率 78%，DB 查詢減少 78%
- Token 取得時間從 250ms 移出請求關鍵路徑

---

### 策略五：Tomcat 執行緒池調整

```yaml
server:
  tomcat:
    threads:
      max: 300       # 預設 200，升到 300
      min-spare: 50  # 預留常駐執行緒
    max-connections: 1000
    accept-count: 200
```

`max-threads` 和 `maximum-pool-size` 的比例建議在 3-4:1 之間。執行緒數遠大於連線數沒意義，因為大多數執行緒最終都在等 DB 連線。

**效果**：吞吐量提升 45%，CPU 使用率降低 20%。

---

### 策略六：加鎖反而讓效能變好

這是這次調校中最有趣的發現。對某些熱點查詢加上 `synchronized` 之後，整體效能反而提升了。

```java
// DateService - 快取失效瞬間加鎖，避免重複回源
public synchronized DataDate findDataDateSynchronized() {
    // 快取未命中時，只有第一個請求查 DB
    // 其他請求等待結果，複用同一份資料
    return dateCache.get("current", () -> repo.findCurrent());
}

// ProductService - 同一個商品 key 序列化執行
@SynchronizedLock(key = "#productKey")
public ProductSet findProdSetByKey(ProductConfigKey productKey) {
    // 細粒度鎖：不同 productKey 互不影響
    return productRepo.findByKey(productKey);
}
```

**為什麼加鎖會變快？**

未加鎖時的高併發情境：
```
T=0ms：Token/快取過期，100 個請求同時到達
所有請求：快取 miss → 全部打 DB
→ DB 連線等待時間爆炸
→ 慢查詢比例急升
→ P95/P99 被拉高
```

加鎖後：
```
T=0ms：100 個請求同時到達，快取 miss
第 1 個請求取到鎖 → 查 DB
第 2-100 個請求等鎖（幾 ms）
第 1 個請求完成，更新快取，釋放鎖
第 2-100 個請求依序取鎖 → 快取命中 → 直接返回
→ DB 只被打 1 次，尖峰消除
```

**什麼情況加鎖會變慢？**
- 鎖粒度太粗（把不同 key 的請求都鎖在一起）
- 鎖範圍內做太多不必要的工作
- 原本就是低併發場景（加鎖只增加排隊成本）

這個專案用的是「同 key 細粒度鎖」，目的是削峰，不是序列化所有查詢。

---

### 策略七：G1GC 調校

```bash
JAVA_OPTS="
-Xms4g -Xmx4g                             # 固定堆大小，避免調整開銷
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200                   # 最大停頓時間目標
-XX:G1HeapRegionSize=16m                   # 適合 4GB 堆的區域大小
-XX:InitiatingHeapOccupancyPercent=45      # 較早觸發 Mixed GC，避免 Full GC
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/logs/heapdump.hprof
"
```

`Xms = Xmx` 是一個常被忽略的優化：若 Xms 小於 Xmx，JVM 在堆使用量增長時需要動態擴展，這個擴展過程本身有開銷，且會觸發額外的 GC。固定堆大小消除這個問題。

`InitiatingHeapOccupancyPercent=45`：降低觸發 Mixed GC 的閾值（預設 45%），讓 G1 更主動地回收老年代，避免累積到需要 Full GC。

**效果**：GC 停頓時間從 450ms → 120ms，Full GC 從每小時 3 次 → 0 次。

---

### 策略八：日誌優化

生產環境的 DEBUG 日誌是個隱性效能殺手：

```java
// 問題：即使不輸出，字串拼接仍然執行
logger.debug("Processing account: " + acctId + ", balance: " + balance);

// 正確：延遲求值，只在 DEBUG 開啟時才執行
if (logger.isDebugEnabled()) {
    logger.debug("Processing account: {}, balance: {}", acctId, balance);
}
```

```yaml
# 生產環境 log level
logging:
  level:
    root: INFO
    com.example.queryapi: WARN  # 業務 log 只保留 WARN 以上
```

**效果**：日誌 I/O 減少 60%，間接降低 CPU 使用率。

---

## 最終成果

| 指標 | 優化前 | 優化後 | 改善 |
|------|--------|--------|------|
| TPS | 80 | 450 | +463% |
| 平均回應時間 | 850ms | 180ms | ↓ 79% |
| P95 | 2.1s | 450ms | ↓ 79% |
| P99 | 3.5s | 820ms | ↓ 77% |
| CPU 使用率 | 85% | 55% | ↓ 35% |
| DB 連線數峰值 | 180 | 穩定 90 | ↓ 50% |
| 錯誤率 | 3% | 0.05% | ↓ 98% |

---

## 幾個壓測原則

**每次只改一個變數**：同時改多個參數，你不知道哪個起作用了。

**基準數據要保留**：每次壓測的 CSV/HTML 報告都存起來，方便前後對比。

**看 P95/P99，不只看平均**：平均 200ms 聽起來很好，但 P99 2 秒意味著每 100 個用戶有一個在等 2 秒。

**壓測環境要像生產環境**：包括機器規格、資料量、網路拓撲。在只有 1 台的環境測連線池多機器計算，得到的結果毫無意義。

**不要只看一個維度**：TPS 提升但 CPU 飆到 95%，不算優化，只是把問題移到別的地方。
