---
title: "Redis 基礎與 Spring Boot 整合實作"
date: "2022-07-31"
category: "Backend"
tags: ["Redis", "Spring Boot", "Docker", "Cache", "Java"]
summary: "從 Redis 資料結構、持久化機制到 Spring Boot 整合實作，以及 Docker Compose 快速建立本地 Redis 環境，包含完整程式碼範例。"
published: true
---

## Redis 是什麼

Redis 是一種基於記憶體（RAM）的資料結構儲存系統，提供極高速的讀寫效能。與 MySQL、PostgreSQL 這類基於磁碟的資料庫不同，Redis 犧牲了部分持久性換取速度。

### 支援的資料結構

| 類型 | 說明 |
|------|------|
| Strings | 最基本的型別，可存任何字串、整數、浮點數 |
| Lists | 有序字串集合，支援頭尾插入 |
| Sets | 無序不重複集合 |
| Sorted Sets | 帶分數的有序集合，依分數排序 |
| Hashes | key-value mapping，適合儲存物件 |
| Streams | 類似 append-only 日誌，按事件順序記錄 |
| Geospatial | 地理空間索引，支援範圍查詢 |

### 持久化機制

**RDB（Redis Database）**
- 定時對記憶體做快照存到磁碟
- 優點：恢復速度快
- 缺點：快照間隔期間的資料若 Redis 當機會遺失

**AOF（Append Only File）**
- 將每一條寫入指令記錄到日誌檔
- 優點：資料更可靠
- 缺點：日誌檔較大，恢復速度較慢

### 常見應用場景

- **快取**：加速 API 回應，減輕資料庫壓力
- **任務隊列**：利用 List 或 Sorted Set 實作
- **發布/訂閱**：即時訊息系統
- **計數器**：利用 `INCR` / `DECR` 指令

---

## Docker 快速建立 Redis 環境

使用 Docker Compose 同時啟動 Redis 與 RedisInsight（GUI 工具）：

```yaml
# docker-compose.yml
version: '3.8'

services:
  redis:
    image: redis
    container_name: my-redis
    ports:
      - "6379:6379"

  redisinsight:
    image: redis/redisinsight:latest
    container_name: my-redisinsight
    ports:
      - "5540:5540"
    depends_on:
      - redis
```

```bash
docker-compose up -d
```

啟動後：
- Redis：`localhost:6379`
- RedisInsight GUI：`http://localhost:5540`

> **注意**：若 Redis 和 RedisInsight 都在 Docker 中，RedisInsight 連線 Redis 時 host 要填 `host.docker.internal`，而非 `localhost`。

---

## Spring Boot 整合 Redis

### 1. 建立專案

至 [Spring Initializr](https://start.spring.io/) 建立專案，加入以下依賴：
- Spring Web
- Spring Data Redis
- Spring Boot DevTools
- Lombok

在 `pom.xml` 加入 Swagger（方便測試 API）：

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.0.2</version>
</dependency>
```

### 2. 設定連線

```properties
# application.properties
spring.redis.host=localhost
spring.redis.port=6379
```

### 3. Service 注入 RedisTemplate

```java
@Service
public class MyService {

    private final StringRedisTemplate redisTemplate;

    public MyService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    // 存入
    public void save(String key, String value) {
        redisTemplate.opsForValue().set(key, value);
    }

    // 取出
    public String get(String key) {
        return redisTemplate.opsForValue().get(key);
    }

    // 刪除
    public void delete(String key) {
        redisTemplate.delete(key);
    }

    // 設定過期時間（10 分鐘）
    public void saveWithExpiry(String key, String value) {
        redisTemplate.opsForValue().set(key, value, 10, TimeUnit.MINUTES);
    }
}
```

### 4. Controller

```java
@RestController
public class MyController {

    private final MyService service;

    public MyController(MyService service) {
        this.service = service;
    }

    @GetMapping("/save")
    public void save(@RequestParam String key, @RequestParam String value) {
        service.save(key, value);
    }

    @GetMapping("/get")
    public String get(@RequestParam String key) {
        return service.get(key);
    }

    @GetMapping("/delete")
    public void delete(@RequestParam String key) {
        service.delete(key);
    }
}
```

---

## List 操作範例

```java
// 加入 List（左側推入）
redisTemplate.opsForList().leftPush("myList", "value1");
redisTemplate.opsForList().leftPush("myList", "value2");

// 取得 List 所有元素
List<String> list = redisTemplate.opsForList().range("myList", 0, -1);

// 取出並移除（右側彈出）
String val = redisTemplate.opsForList().rightPop("myList");
```

## Hash 操作範例（適合存物件）

```java
// 存入 Hash
redisTemplate.opsForHash().put("user:1", "name", "Kai");
redisTemplate.opsForHash().put("user:1", "age", "30");

// 取得單一欄位
String name = (String) redisTemplate.opsForHash().get("user:1", "name");

// 取得全部欄位
Map<Object, Object> user = redisTemplate.opsForHash().entries("user:1");
```

---

## @Cacheable 快取注解（進階）

Spring Boot 也提供注解式快取，更簡潔：

```java
@Configuration
@EnableCaching
public class RedisConfig {
    // 啟用 Spring Cache
}

@Service
public class UserService {

    @Cacheable(value = "users", key = "#id")
    public User findById(Long id) {
        // 第一次呼叫會執行此方法並快取結果
        // 後續相同 id 直接從 Redis 取得
        return userRepository.findById(id).orElseThrow();
    }

    @CacheEvict(value = "users", key = "#id")
    public void deleteById(Long id) {
        // 刪除資料時同步清除快取
        userRepository.deleteById(id);
    }
}
```

---

## 參考資料

- [Redis 官方文件（英文）](https://redis.io/docs/latest/develop/data-types/)
- [Redis 官方文件（中文）](https://redis.dev.org.tw/docs/data-types/)
- [Spring Data Redis 文件](https://spring.io/projects/spring-data-redis)
- [RedisInsight 安裝](https://redis.io/docs/latest/operate/redisinsight/install/)
