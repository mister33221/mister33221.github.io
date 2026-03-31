---
title: "Redis Cluster 的坑：KEYS 為什麼不能用，以及怎麼做 Pattern 刪除"
date: "2026-03-30"
category: "Backend"
tags: ["Redis", "Spring Boot", "Lettuce", "Cache", "Performance"]
summary: "記錄在 Redis Cluster 環境下操作 Pattern 刪除的策略選擇（SCAN vs KEYS），以及 Lettuce 連線池設定、拓樸自動刷新、啟動 warm-up 等讓 Cluster 操作更穩定的工程實踐。"
published: true
---

## Redis Cluster 和單機 Redis 最大的差異

用過單機 Redis 的人切換到 Cluster 模式，通常第一個踩的坑是 `KEYS` 指令。

單機 Redis 用 `KEYS user:*` 直接列出所有符合條件的 key，很方便。在 Cluster 模式下：

1. **16384 個 slot，分散在多個節點**。`KEYS` 只會查詢你連到的那個節點，其他節點上的 key 根本看不到。如果你要刪除全集群的 Key，你必須連到每個 Master 節點分別執行。
2. 就算你想辦法查完所有節點，**`KEYS` 是阻塞指令**——在 key 量大的節點上執行，整個節點的其他命令都得等。

所以如果使用 `KEYS` 來做 pattern 刪除，會有兩個問題：
- **不完整**：只能刪除當前節點上符合條件的
- **高風險**：如果某個節點上 key 量大，`KEYS` 會造成該節點完全無響應，影響整個 Cluster 的可用性。

---

## SCAN：非阻塞的替代方案

1. 非阻塞： 它每次只回傳一小部分 Key（數量由 COUNT 決定），執行完一次會釋放 CPU 給其他請求，因此不會掛起伺服器。
2. 分批處理： 你可以在程式碼中循環調用 SCAN，拿到一批 Key 就執行一次 DEL 或 UNLINK（推薦用 UNLINK 非同步刪除）。
3. 容錯性： 缺點是在迭代過程中，如果有資料變動，可能會漏掉某些 Key 或回傳重複的 Key（程式端需做重複處理）。

`SCAN` 使用游標（cursor）分批迭代，不會阻塞 Redis 處理其他命令：

```java
// AbstractRedisDaoFactory.java
public void deleteByPattern(String pattern) {
    Set<String> keys = new HashSet<>();

    Cursor<byte[]> cursor = redisTemplate
        .getConnectionFactory()
        .getConnection()
        .scan(ScanOptions.scanOptions()
            .match(pattern)
            .count(1000)   // 每次掃描約 1000 個 slot
            .build());

    try {
        while (cursor.hasNext()) {
            keys.add(new String(cursor.next()));
        }
    } finally {
        cursor.close();  // 一定要關，否則連線資源不釋放
    }

    if (!keys.isEmpty()) {
        redisTemplate.delete(keys);
    }
}
```

`count(1000)` 是提示 Redis「每次大約掃描多少個 slot」，不是硬性限制，但有助於控制每次迭代的工作量。

**Cluster 環境的額外挑戰**：Cluster 有多個節點，每個節點只管理部分 slot。要做全 Cluster 的 pattern 刪除，需要對每個節點都執行 SCAN：

```java
public void deleteByPatternInCluster(String pattern) {
    // Lettuce 的 ClusterClientOptions 支援節點遍歷
    redisTemplate.execute((RedisClusterCallback<Void>) connection -> {
        Iterable<RedisClusterNode> nodes = connection.clusterGetNodes();
        for (RedisClusterNode node : nodes) {
            if (node.isMaster()) {  // 只掃 Master，Slave 有相同資料
                Cursor<byte[]> cursor = connection
                    .getClusterCommandExecutor()
                    .executeCommandOnSingleNode(...)
                    ...
            }
        }
        return null;
    });
}
```

實務上，這個操作複雜度較高，大多數場景還是透過 Spring Data Redis 封裝處理。

---

## 三種刪除策略的選用原則

```java
// 策略一：SCAN 迭代刪除（優先使用）
public void deleteByPattern(String pattern) { ... }

// 策略二：KEYS 直接刪除（限制使用）
public void deleteByPatternKeys(String pattern) {
    Set<String> keys = redisTemplate.keys(pattern);
    if (keys != null && !keys.isEmpty()) {
        redisTemplate.delete(keys);
    }
}

// 策略三：SCAN + 白名單排除
public void deleteByPattern(String pattern, String... excludeKeys) {
    Set<String> exclude = new HashSet<>(Arrays.asList(excludeKeys));
    Set<String> keys = scanKeys(pattern);
    keys.removeAll(exclude);
    if (!keys.isEmpty()) {
        redisTemplate.delete(keys);
    }
}
```

| 策略 | 適用場景 |
|------|---------|
| SCAN | 線上環境、key 量不確定、允許最終一致 |
| KEYS | 測試環境、確認 key 量小、緊急維運排障 |
| 白名單排除 | 同一 pattern 下有不能刪的控制 key（如狀態標記） |

`KEYS` 不是完全不能用，重點是**知道自己在什麼環境、key 量是多少**。維運緊急排障時在測試環境確認過再上生產，沒什麼問題。盲目在生產環境跑就是在玩火。

---

## 常見陷阱

### 忘記關閉 Cursor

```java
// ❌ 如果中間拋異常，cursor 不會被關閉
Cursor<byte[]> cursor = connection.scan(...);
while (cursor.hasNext()) {
    keys.add(new String(cursor.next()));
}

// ✅ 用 try-finally 確保釋放
Cursor<byte[]> cursor = connection.scan(...);
try {
    while (cursor.hasNext()) {
        keys.add(new String(cursor.next()));
    }
} finally {
    cursor.close();
}
```

Cursor 對應一個 Redis 連線資源，沒關會造成連線持續被佔用，連線池最終耗盡。

### 一次收集全部 key 才刪

```java
// 問題：100 萬個 key 全塞進 Set，記憶體峰值很高
Set<String> keys = scanAllKeys(pattern);  // 可能幾百 MB
redisTemplate.delete(keys);

// 改善：scan 一批就刪一批（串流式）
List<String> batch = new ArrayList<>();
Cursor<byte[]> cursor = connection.scan(...);
try {
    while (cursor.hasNext()) {
        batch.add(new String(cursor.next()));
        if (batch.size() >= 500) {
            redisTemplate.delete(batch);
            batch.clear();
        }
    }
    if (!batch.isEmpty()) {
        redisTemplate.delete(batch);
    }
} finally {
    cursor.close();
}
```

先收集再刪的方式，遇到大量 key 時記憶體峰值很高，容易觸發 Full GC。串流式的 scan-and-delete 讓記憶體維持在低位。

---

## Lettuce 連線池設定

Spring Boot 2.x 之後預設 Redis 客戶端是 Lettuce，Cluster 模式下連線池的調整尤其重要：

```yaml
spring:
  data:
    redis:
      type: cluster
      cluster:
        nodes:
          - redis-node-1:7100
          - redis-node-1:7101
          - redis-node-2:7100
          - redis-node-2:7101
          - redis-node-3:7100
          - redis-node-3:7101
        max-redirects: 5     # MOVED 重導最多幾次
      timeout: 10000         # 指令執行超時
      connect-timeout: 15000
      lettuce:
        pool:
          max-active: 256    # 最大連線數
          max-wait: 10000    # 等待連線最長時間
          max-idle: 32
          min-idle: 8
```

`max-redirects: 5`：在 Cluster 模式下，當 key 不在當前節點時，Redis 回傳 MOVED 錯誤並附上正確節點位置，Lettuce 會自動重導。`max-redirects` 限制最多重導幾次，防止無窮迴圈。

`max-active: 256`：Cluster 有多個節點，每個節點都需要維護連線。256 是所有節點的連線總上限，不是單一節點。

---

## 拓樸自動刷新（避免 MOVED 失敗率飆升）

Redis Cluster 發生主從切換時，如果客戶端還在用舊的拓樸資訊，每個 key 都會先打到舊節點，收到 MOVED 重導，才能打到正確節點。大量 MOVED 會把延遲拉高。

Lettuce 的 Topology Refresh 可以主動偵測拓樸變化：

```java
@Configuration
@ConditionalOnProperty(name = "spring.data.redis.type", havingValue = "cluster")
public class RedisClusterConfiguration {

    @Bean
    public LettuceClientConfigurationBuilderCustomizer clusterConfigCustomizer() {
        return builder -> builder.clientOptions(
            ClusterClientOptions.builder()
                .topologyRefreshOptions(
                    ClusterTopologyRefreshOptions.builder()
                        // 觸發自動刷新的事件（MOVED、ASK、主從切換等）
                        .enableAllAdaptiveRefreshTriggers()
                        // 定期刷新，每 30 秒重新取得完整拓樸
                        .enablePeriodicRefresh(Duration.ofSeconds(30))
                        .build()
                )
                .build()
        );
    }

    @Bean
    public LettuceConnectionFactory redisConnectionFactory(
            RedisClusterConfiguration clusterConfig) {
        LettuceClientConfiguration clientConfig = LettucePoolingClientConfiguration.builder()
            .readFrom(ReadFrom.MASTER_PREFERRED)  // 優先從 Master 讀，降低主從同步延遲影響
            .poolConfig(buildPoolConfig())
            .build();

        return new LettuceConnectionFactory(clusterConfig, clientConfig);
    }
}
```

`enableAllAdaptiveRefreshTriggers()` + `enablePeriodicRefresh()`：雙保險。事件驅動的自適應刷新在主從切換瞬間觸發，定期刷新兜底確保拓樸始終最新。

---

## 啟動 Warm-up：避免第一筆交易踩雷

連線池裡的連線是懶惰初始化的，服務剛啟動時連線池是空的。如果第一筆真實業務請求才觸發連線建立，使用者會感覺到明顯的首次延遲，連線建立失敗也會直接影響業務。

```java
@Component
public class RedisClusterFactory {

    private final AtomicBoolean connectionWarmedUp = new AtomicBoolean(false);

    @EventListener(ApplicationReadyEvent.class)
    public void warmUpConnection() {
        // CAS 保證只暖機一次
        if (!connectionWarmedUp.compareAndSet(false, true)) {
            return;
        }

        RedisConnection connection = null;
        try {
            connection = redisConnectionFactory.getConnection();
            String pong = new String(connection.ping());
            log.info("Redis warm-up successful: {}", pong);
        } catch (Exception e) {
            log.error("Redis warm-up failed", e);
            connectionWarmedUp.set(false);  // 失敗要重置，下次還能重試
        } finally {
            if (connection != null) {
                connection.close();
            }
        }
    }
}
```

`ApplicationReadyEvent`：在 Spring 完全啟動後才執行暖機，不阻礙其他 Bean 初始化。

`compareAndSet(false, true)`：防止多執行緒同時觸發暖機（雖然 `@EventListener` 通常是單執行緒，加上也無妨）。

暖機失敗時把 `connectionWarmedUp` 設回 false，下次健康檢查探測時還能重試。

---

## 故障情境處理

### 主節點切換後大量 timeout

```
排查順序：
1. 看 topology refresh 日誌是否有 "Topology refreshed" 記錄
2. Redis 端確認 failover 是否完成（cluster nodes 指令）
3. 看應用端 Lettuce pool active/wait 數字是否接近上限

處置：
- 暫時降低批次任務的並發數
- 等待 topology refresh 完成（通常 3-10 秒）
- 不要立刻重啟服務，讓 Lettuce 自動恢復
```

### 批次轉檔期間 Redis 延遲飆高

這個在大量資料轉檔時容易遇到。批次操作同時打大量寫入，加上可能有 pattern 刪除在跑，Redis 單節點很容易成為瓶頸：

```
排查順序：
1. 是否同時執行 deleteByPattern（KEYS 版本）
2. 是否有熱 key 集中在同一個 slot（cluster info 看各節點 keyspace_hits）
3. Lettuce pool max-active 是否設太低，導致大量 max-wait 等待

處置：
1. 確認 deleteByPattern 使用 SCAN 版本，不要用 KEYS
2. 降低批次作業的 semaphoreNumber（參考大量資料轉檔那篇）
3. 把 pattern 刪除移到離峰時段
```

---

## Spring Data Redis 的序列化選擇

一個容易被忽略的坑：RedisTemplate 的序列化設定如果不一致，兩個服務讀同一個 key 可能讀到亂碼。

```java
@Bean
public RedisTemplate<String, Object> redisTemplate(
        RedisConnectionFactory factory) {
    RedisTemplate<String, Object> template = new RedisTemplate<>();
    template.setConnectionFactory(factory);

    // Key 用 String 序列化
    StringRedisSerializer stringSerializer = new StringRedisSerializer();
    template.setKeySerializer(stringSerializer);
    template.setHashKeySerializer(stringSerializer);

    // Value 用 JSON 序列化（可跨服務讀取）
    Jackson2JsonRedisSerializer<Object> jsonSerializer =
        new Jackson2JsonRedisSerializer<>(Object.class);
    template.setValueSerializer(jsonSerializer);
    template.setHashValueSerializer(jsonSerializer);

    template.afterPropertiesSet();
    return template;
}
```

如果用預設的 `JdkSerializationRedisSerializer`，序列化後的值是 Java 特有的二進位格式，其他語言或服務讀不了。用 JSON 才能跨服務共用。

---

## 一句話總結每個關鍵點

- **KEYS → 生產環境禁用**，改 SCAN + cursor（記得 close）
- **串流式 scan-and-delete**，不要先收集全部再刪
- **白名單排除**，預防 pattern 範圍太廣誤刪控制 key
- **Topology Refresh**，主從切換後快速收斂，減少 MOVED 失敗率
- **Warm-up**，啟動後主動 ping，讓第一筆業務請求不用等初始化
- **序列化統一用 JSON**，跨服務不踩亂碼坑
