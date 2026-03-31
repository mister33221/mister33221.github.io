---
title: "Spring Boot 雙資料源配置：讓兩個 DataSource 各管各的 Repository"
date: "2026-03-30"
category: "Backend"
tags: ["Spring Boot", "JPA", "HikariCP", "Oracle", "Multi-DataSource"]
summary: "記錄在同一個 Spring Boot 服務內配置兩個獨立 DataSource（各自有 EntityManagerFactory、TransactionManager、HikariCP 連線池）的實踐，以及 @Transactional 跨資料源的邊界風險與設計原則。"
published: true
---

## 為什麼需要雙資料源

有些服務天生就需要連兩個不同的資料庫。在這個專案裡，Query-API 同時連：

1. **Primary DB**：主要業務資料庫（資產資料、帳戶資料）
2. **Secondary DB**：另一個業務系統的資料庫（特定流程的補充資料）

最簡單的做法是把兩個 DB 的查詢都丟給同一個 DataSource 配置，但這樣有幾個問題：

- 查哪個庫不透明，出錯難排查
- 連線池參數無法分開調校（兩個 DB 的負載特性不同）
- 交易邊界不清楚

正確的做法是為每個資料源獨立配置一套完整的 `DataSource → EntityManagerFactory → TransactionManager`。

---

## 完整配置結構

```
Spring Boot Application
├── PrimaryDataSourceConfig
│   ├── @Primary DataSource (primary)
│   ├── primaryEntityManagerFactory
│   ├── primaryTransactionManager
│   └── @EnableJpaRepositories(basePackages = "...repository.primary")
│
└── SecondaryDataSourceConfig
    ├── DataSource (secondary，不加 @Primary)
    ├── secondaryEntityManagerFactory
    ├── secondaryTransactionManager
    └── @EnableJpaRepositories(basePackages = "...repository.secondary")
```

### Primary DataSource 配置

```java
@Configuration
@EnableJpaRepositories(
    basePackages = {
        "com.example.query.api.adapter.out.repository.primary",
    },
    entityManagerFactoryRef = "primaryEntityManagerFactory",
    transactionManagerRef = "primaryTransactionManager"
)
public class PrimaryDataSourceConfig {

    @Primary
    @Bean
    @ConfigurationProperties(prefix = "spring.datasource.primary")
    public DataSource primaryDataSource() {
        return DataSourceBuilder.create().build();
    }

    @Primary
    @Bean
    public LocalContainerEntityManagerFactoryBean primaryEntityManagerFactory(
            @Qualifier("primaryDataSource") DataSource dataSource,
            JpaProperties jpaProperties) {
        LocalContainerEntityManagerFactoryBean factory =
            new LocalContainerEntityManagerFactoryBean();

        factory.setDataSource(dataSource);
        factory.setPackagesToScan("com.example.query.api.domain.primary");
        factory.setPersistenceUnitName("primary");

        HibernateJpaVendorAdapter adapter = new HibernateJpaVendorAdapter();
        factory.setJpaVendorAdapter(adapter);
        factory.setJpaPropertyMap(jpaProperties.getProperties());

        return factory;
    }

    @Primary
    @Bean
    public PlatformTransactionManager primaryTransactionManager(
            @Qualifier("primaryEntityManagerFactory")
            EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }
}
```

### Secondary DataSource 配置

```java
@Configuration
@EnableJpaRepositories(
    basePackages = "com.example.query.api.adapter.out.repository.secondary",
    entityManagerFactoryRef = "secondaryEntityManagerFactory",
    transactionManagerRef = "secondaryTransactionManager"
)
public class SecondaryDataSourceConfig {

    // 注意：沒有 @Primary
    @Bean
    @ConfigurationProperties(prefix = "spring.datasource.secondary")
    public DataSource secondaryDataSource() {
        return DataSourceBuilder.create().build();
    }

    @Bean
    public LocalContainerEntityManagerFactoryBean secondaryEntityManagerFactory(
            @Qualifier("secondaryDataSource") DataSource dataSource,
            JpaProperties jpaProperties) {
        LocalContainerEntityManagerFactoryBean factory =
            new LocalContainerEntityManagerFactoryBean();

        factory.setDataSource(dataSource);
        factory.setPackagesToScan("com.example.query.api.domain.secondary");
        factory.setPersistenceUnitName("secondary");

        // 和 primary 完全一樣的結構，不同的 dataSource 和 persistenceUnitName
        HibernateJpaVendorAdapter adapter = new HibernateJpaVendorAdapter();
        factory.setJpaVendorAdapter(adapter);
        factory.setJpaPropertyMap(jpaProperties.getProperties());

        return factory;
    }

    @Bean
    public PlatformTransactionManager secondaryTransactionManager(
            @Qualifier("secondaryEntityManagerFactory")
            EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }
}
```

### YAML 配置

```yaml
spring:
  datasource:
    primary:
      jdbc-url: jdbc:oracle:thin:@//primary-db:1521/PRIMARYSVC
      username: ${PRIMARY_DB_USER}
      password: ${PRIMARY_DB_PASS}
      minimum-idle: 10
      maximum-pool-size: 80        # 根據 DB 可用連線數和服務實例數計算
      connection-timeout: 30000
      idle-timeout: 300000
      connection-test-query: SELECT 1 FROM DUAL
      hikari:
        max-lifetime: 1200000
        keepalive-time: 300000

    secondary:
      jdbc-url: jdbc:oracle:thin:@//secondary-db:1521/SECONDARYSVC
      username: ${SECONDARY_DB_USER}
      password: ${SECONDARY_DB_PASS}
      minimum-idle: 5
      maximum-pool-size: 30        # 用量少，設保守一些
      connection-timeout: 30000
      idle-timeout: 300000
      connection-test-query: SELECT 1 FROM DUAL
      hikari:
        max-lifetime: 1200000
        keepalive-time: 300000
```

---

## 用 Package 切分 Repository，不是 Annotation

Repository 歸屬哪個資料源，推薦用 package 結構來決定，而不是在每個 Repository 上加 annotation：

```
adapter/out/repository/
├── primary/
│   ├── AccountRepository.java    → 自動對應 primaryEntityManagerFactory
│   ├── AssetRepository.java
│   └── BalanceRepository.java
└── secondary/
    ├── StockAssetRepository.java → 自動對應 secondaryEntityManagerFactory
    └── ProductRepository.java
```

**為什麼 package 比 annotation 好：**

| 做法 | 優點 | 缺點 |
|------|------|------|
| Package 切分（推薦） | 看位置就知道連哪個庫，新增 repository 不需要多想 | 需要維護 package 命名規範 |
| Annotation 標記 | 彈性 | 容易忘記加、容易加錯，review 時不直觀 |

---

## @Transactional 的邊界問題

雙資料源最容易踩的坑在這裡。

`@Transactional` 預設使用 `@Primary` 的 TransactionManager。如果你的 Service 同時操作兩個資料源的 Repository：

```java
@Service
public class SomeService {

    private final PrimaryRepository primaryRepo;     // 連 primary DB
    private final SecondaryRepository secondaryRepo; // 連 secondary DB

    @Transactional  // ← 只有 primaryTransactionManager 在管
    public void doSomething() {
        primaryRepo.save(data1);     // 在 primary 交易內
        secondaryRepo.save(data2);   // ❌ 不在同一個交易！

        // 如果這裡拋異常：
        // - primaryRepo.save() 會 rollback ✓
        // - secondaryRepo.save() 不會 rollback ✗
    }
}
```

**`@Transactional` 不會自動管兩個 TransactionManager**，只管你指定的那個（或 Primary）。

### 解法一：指定 transactionManager

```java
@Transactional("primaryTransactionManager")
public void primaryOperation() { ... }

@Transactional("secondaryTransactionManager")
public void secondaryOperation() { ... }
```

### 解法二：設計上避免跨資料源寫入同一交易

這是更根本的解法。如果一個業務操作需要同時寫入兩個資料庫，應該考慮：

```
正確設計：
UseCase A → 只操作 primary repository
UseCase B → 只操作 secondary repository
需要協調時 → 用 Outbox / Saga / 事件補償

❌ 不建議：
UseCase X → 同時操作兩個 repository（交易語義不清楚）
```

跨資料源要做到真正的 ACID 需要 XA Transaction（分散式兩階段提交），引入的複雜度和效能代價非常高。多數場景用最終一致性方案就夠了。

---

## 幾個容易踩的坑

### Bean 名稱衝突

```java
// ❌ 兩個 Config 都宣告同樣的 bean name，後面的會覆蓋前面的
@Bean
public DataSource dataSource() { ... }  // 兩個 Config 都有這行，壞掉

// ✅ 每個 Config 的 bean name 要唯一
@Bean(name = "primaryDataSource")
public DataSource primaryDataSource() { ... }

@Bean(name = "secondaryDataSource")
public DataSource secondaryDataSource() { ... }
```

### `@Primary` 只能有一個

如果你把兩個 DataSource 都標了 `@Primary`，Spring 啟動就會炸。只有 primary 那個標，secondary 的都不標。

### EntityManagerFactory 命名要和 @EnableJpaRepositories 一致

這個不一致會讓 repository 全部找不到 EntityManager：

```java
// @EnableJpaRepositories 裡寫的
entityManagerFactoryRef = "primaryEntityManagerFactory"

// @Bean 必須同名
@Bean(name = "primaryEntityManagerFactory")   // ← 名字要完全一致
public LocalContainerEntityManagerFactoryBean primaryEntityManagerFactory(...) { ... }
```

---

## 雙資料源的連線池要分開算

多機器環境下，HikariCP 的連線池大小計算要考慮所有服務實例：

```
假設：
- Primary DB 允許最大連線數：300
- 保留給 DBA 工具：50
- 可用連線：250
- Query-API 有 3 台實例

每台實例 primary 連線池上限 = 250 / 3 ≈ 83 → 取 80

Secondary DB 允許最大連線數：150
可用連線：120
每台實例 secondary 連線池上限 = 120 / 3 = 40
```

這個計算同樣適用於只有一個 DataSource 的情境，多機器環境時容易被忽略——每台設太大，加起來超過 DB 上限，就會出現連線被拒絕的錯誤。

---

## 啟動時的兩個常見報錯

**1. `No qualifying bean of type 'EntityManagerFactory'`**

原因通常是 `entityManagerFactoryRef` 名稱和 `@Bean(name = ...)` 不一致，或者忘記加 `@Bean`。

**2. `Repository is under multiple entity managers`**

Repository 的 package 同時落在兩個 `@EnableJpaRepositories` 的 `basePackages` 範圍內。檢查 package 路徑有沒有重疊。

---

## 設定好的好處

配置完成後，整個系統的資料源歸屬完全透明：

```
一眼就知道這個 Repository 連哪個庫：
adapter/out/repository/primary/AccountRepository.java  → Primary DB
adapter/out/repository/secondary/StockAssetRepository.java → Secondary DB

交易邊界清楚：
UserConsentLogService → @Transactional("primaryTransactionManager")
AssetStatusLogService → @Transactional("secondaryTransactionManager")

連線池各自調校：
Primary：高負載，max-pool-size: 80
Secondary：低頻查詢，max-pool-size: 30
```

對於需要長期維護的服務來說，這種明確性比靈活性更有價值。
