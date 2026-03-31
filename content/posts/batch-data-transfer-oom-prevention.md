---
title: "Oracle to Redis 大量資料轉檔：分批並行處理與 OOM 防護實踐"
date: "2026-03-30"
category: "Performance"
tags: ["Java", "Redis", "Spring Boot", "Batch Processing", "Performance", "OOM"]
summary: "記錄將數萬筆帳戶資料從 Oracle 批次轉檔至 Redis Cluster 的工程實踐，包含三層批次架構設計、Semaphore 流量控制、帳號級錯誤隔離與 OOM 防護機制，轉檔時間從 45 分鐘降至 8 分鐘。"
published: true
---

## 問題背景

批次轉檔服務需要在每日指定時間，將業務資料從 Oracle 批次轉檔到 Redis Cluster，作為查詢層的快取資料來源。

每次轉檔涉及：
- 數萬個主體（帳戶/用戶）
- 每個主體 5 種資料類型（主資料、明細資料、歷史記錄、排行資料A、排行資料B）

**初版做法（全量載入後寫入）的問題**：

```
全量查詢帳戶 → 全量查詢所有資料 → 批次寫入 Redis

問題：
- 10,000 帳戶 × 5 種資料 = 數十萬筆，一次塞進記憶體
- JVM Heap 峰值達 3.5GB，頻繁觸發 Full GC，偶發 OOM
- 執行時間 45 分鐘
- 失敗率約 5%（OOM 或超時導致）
```

---

## 架構設計：三層批次處理

```
批次分割層
    帳戶清單按 batchSize=50 切割
          ↓
並行控制層
    Semaphore 限制同時執行的批次數
    CompletableFuture + 自訂執行緒池
          ↓
資料處理層（單批次內）
    批次查詢（1 SQL 查 50 帳戶，避免 N+1）
    依帳戶分組
    逐帳戶寫入 Redis（錯誤隔離）
    明確釋放記憶體
```

---

## 核心實作

### 批次分割 + Semaphore 流量控制

```java
public long transferByBatch(int monthsBack) throws InterruptedException {

    // 1. 查詢帳戶清單
    List<AccountEntity> accounts = accountRepo.findByDateRange(dateRange);

    // 2. 初始化控制結構
    Semaphore semaphore = new Semaphore(semaphoreNumber); // 限制並行批次數
    AtomicInteger successCount = new AtomicInteger(0);
    AtomicBoolean oomDetected = new AtomicBoolean(false);
    ErrorCollector errorCollector = new ErrorCollector(maxErrorLogCount);

    List<CompletableFuture<Boolean>> futures = new ArrayList<>();

    for (int i = 0; i < accounts.size(); i += batchSize) {

        // OOM 偵測：提前終止
        if (oomDetected.get()) break;

        List<AccountEntity> batch = accounts.subList(
            i, Math.min(i + batchSize, accounts.size())
        );

        semaphore.acquire(); // 取得許可（超過上限則阻塞等待）

        CompletableFuture<Boolean> future = transferService
            .redisTransfer(batch, successCount, oomDetected, errorCollector);

        future.whenComplete((res, ex) -> semaphore.release()); // 完成後釋放許可
        futures.add(future);

        // 每 100 批次建議 GC
        if (i % (batchSize * 100) == 0) {
            System.gc();
        }
    }

    // 等待所有批次完成
    CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

    // 根據是否觸發 OOM 決定最終狀態
    if (oomDetected.get()) {
        handleOomTermination(successCount.get(), accounts.size());
    } else {
        statusService.setStatus(Status.COMPLETE);
    }

    return successCount.get();
}
```

**Semaphore 的作用**：假設帳戶 10,000 個、批次大小 50，會切成 200 個批次。若全部同時丟進執行緒池，瞬間 200 個任務搶 DB 連線和 Redis 連線，反而塞車。Semaphore 設為 10，保持最多 10 個批次同時執行，避免資源爭奪。

### 批次內的錯誤隔離

```java
@Async("accountTaskExecutor")
public CompletableFuture<Boolean> redisTransfer(
        List<AccountEntity> batch,
        AtomicInteger successCount,
        AtomicBoolean oomDetected,
        ErrorCollector errorCollector) {

    try {
        // 單批次內執行，帶帳號級錯誤隔離
        Set<String> successful = processAccountBatch(batch, errorCollector);

        successCount.addAndGet(successful.size());
        return CompletableFuture.completedFuture(true);

    } catch (Exception e) {
        // 整批失敗時回滾
        batch.forEach(this::rollbackEntity);

        if (isOomError(e)) {
            oomDetected.set(true); // 通知上層提前終止
        }

        return CompletableFuture.completedFuture(false);
    }
}
```

帳號級錯誤隔離的意義：帳號 A 的資料有問題，不應該連帶讓同批次的帳號 B-Z 也失敗。

```java
public Set<String> processAccountBatch(List<AccountEntity> accounts, ErrorCollector collector) {

    List<String> entityIdList = accounts.stream().map(AccountEntity::getEntityId).toList();
    Set<String> successful = new HashSet<>(entityIdList);
    Set<String> failed = new HashSet<>();

    // 批次查詢（1 SQL，而非 N 次）
    List<DataRecord> dataList = dataRepo.findByEntityIds(entityIdList, dataDate);

    // 依主體 ID 分組
    Map<String, List<DataRecord>> grouped = dataList.stream()
        .collect(Collectors.groupingBy(DataRecord::getEntityId));

    // 明確釋放原始清單（幫助 GC）
    dataList.clear();
    dataList = null;

    // 逐主體處理
    for (Map.Entry<String, List<DataRecord>> entry : grouped.entrySet()) {
        String entityId = entry.getKey();

        if (failed.contains(entityId)) continue; // 已在前面的階段失敗

        try {
            redisDao.save(entityId, entry.getValue());
        } catch (Exception e) {
            collector.addError(e, "data write", entityId);
            successful.remove(entityId);
            failed.add(entityId);
        } finally {
            // 每筆處理完立即清理
            entry.getValue().clear();
        }
    }

    // 回滾失敗主體
    failed.forEach(entityId -> rollbackEntityData(entityId));

    return successful;
}
```

### 執行緒池配置

```java
@Bean(name = "accountTaskExecutor")
public Executor accountTaskExecutor() {
    ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
    executor.setCorePoolSize(corePoolSize);    // 20
    executor.setMaxPoolSize(maxPoolSize);      // 50
    executor.setQueueCapacity(queueCapacity);  // 500
    executor.setThreadNamePrefix("Acct-Trans-");

    // CallerRunsPolicy：佇列滿時由呼叫者執行 → 提供自然背壓
    executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
    executor.initialize();
    return executor;
}
```

`CallerRunsPolicy` 的妙用：當執行緒池和佇列都滿了，不是直接拋異常（`AbortPolicy`），而是讓提交任務的主執行緒自己執行這個批次。主執行緒被佔用的這段時間，就自然無法繼續提交新批次，形成背壓效果。

---

## 記憶體管理技巧

### 明確置 null 幫助 GC

```java
List<DataRecord> dataList = null;
    Map<String, List<DataRecord>> grouped = null;

    try {
        dataList = dataRepo.findByEntityIds(entityIdList, dataDate);
        grouped = dataList.stream()
            .collect(Collectors.groupingBy(DataRecord::getEntityId));

        // 原始清單用完立即釋放
        dataList.clear();
        dataList = null; // 明確置 null，讓 GC 知道可以回收

    // 繼續處理 grouped...

} finally {
    if (grouped != null) {
        grouped.clear();
        grouped = null;
    }
}
```

這在高併發批次處理中特別重要。如果 20 個執行緒同時持有各自的 `dataList`，每個 10MB，就是 200MB 同時壓在 Heap 上。及早 `null` 讓 GC 有機會在下一個 Minor GC 就回收，而不是堆積到老年代觸發 Full GC。

### Redis OOM 偵測

```java
private boolean isOomError(Exception e) {
    Throwable cause = e.getCause();
    return cause instanceof RedisCommandExecutionException
        && cause.getMessage() != null
        && cause.getMessage().contains("OOM");
}
```

Redis Cluster 節點記憶體不足時，會回 `OOM command not allowed when used memory > 'maxmemory'`。偵測到這個訊號後，`oomDetected` 設為 `true`，上層批次分割迴圈看到後停止提交新批次，等現有批次完成後優雅退出，保存已成功的資料。

### JVM 參數建議

```bash
-Xms2g -Xmx4g          # 預留足夠空間
-XX:+UseG1GC            # G1 適合大 Heap + 低停頓需求
-XX:MaxGCPauseMillis=200
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/logs/heapdump.hprof
```

`HeapDumpOnOutOfMemoryError` 務必開啟。OOM 發生瞬間的 heap dump 是事後分析的唯一證據，沒有它基本上猜不到是誰吃掉記憶體。

---

## Redis 寫入重試

```java
private void executeWithRetry(Runnable operation) {
    int retryCount = 0;
    long waitMs = 500;

    while (retryCount < MAX_RETRIES) {
        try {
            operation.run();
            return;
        } catch (Exception e) {
            retryCount++;
            if (retryCount >= MAX_RETRIES) throw e;

            Thread.sleep(waitMs);
            waitMs = Math.min(waitMs * 2, 5000); // 指數退避，上限 5 秒
        }
    }
}
```

Redis Cluster 在拓撲變更（節點重平衡）時可能短暫不可用，指數退避重試比固定間隔重試更友善——前幾次快速重試，多次失敗後才慢下來，不會一直轟炸剛恢復的節點。

---

## 效能改善結果

| 指標 | Before | After | 改善 |
|------|--------|-------|------|
| 10,000 帳戶轉檔時間 | 45 分鐘 | 8 分鐘 | ↓ 82% |
| 記憶體峰值 | 3.5 GB | 2.2 GB | ↓ 37% |
| 失敗率 | ~5% | < 0.1% | ↓ 98% |
| CPU 使用率 | 20-30% | 60-70% | ↑ 2.5x |

---

## 可調整的三個核心參數

| 參數 | 預設值 | 作用 | 調整方向 |
|------|--------|------|---------|
| `batchSize` | 50 | 每批帳戶數 | 記憶體壓力大→降；速度慢→升 |
| `semaphoreNumber` | 10 | 最大並行批次數 | OOM 風險高→降；速度優先→升 |
| `corePoolSize` | 20 | 執行緒池核心數 | 依機器 CPU 核心數 × 2 |

這三個參數互相影響：提高 `semaphoreNumber` 會讓更多批次同時執行，需要更多執行緒（`corePoolSize`），同時也需要更多記憶體（`batchSize` 越大影響越明顯）。調整時建議一次改一個參數觀察效果。

---

## 適用場景

**適合**：
- 大量資料 ETL（RDBMS → NoSQL）
- 批次報表產生
- 快取預熱

**不適合**：
- 即時性要求 < 1 秒的場景
- 資料量 < 1,000 筆（過度設計）
- 需要嚴格 ACID 事務的場景（分批導致部分成功問題）
