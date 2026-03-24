---
title: "Spring Cache 學習指南"
date: "2026-03-24"
category: "Java"
tags: ["Java", "Concurrency"]
summary: "- 快取的定義和重要性"
published: true
---

# Spring Cache 學習指南


## 1. 快取基礎概念
### 1.1 什麼是快取？
- 快取的定義和重要性
    快取(Cache)是一種位於應用程式與永久資料儲存層(如資料庫)之間的臨時資料儲存層，我們會將經常被存取的資料存在記憶體中，藉此提升應用程式的效能。     
    而它的本質就是 **以空間換取時間**，通過將資料存放在快取中，以減少存取永久資料儲存層的次數，提升應用程式的效能。
- 快取的優缺點
    - 優點
        - 提升應用程式效能
        - 減少對資料庫的存取次數
        - 降低系統負載
    - 缺點
        - 快取一致性問題
        - 快取更新策略
        - 快取佔用記憶體
- 適合使用快取的場景
    - 資料讀取頻繁，但很少更新 -> 商品資訊、用戶資訊
    - 資料量大，但使用頻率低 -> 熱門商品、熱門用戶
    - 資料計算複雜，但結果不變 -> 統計資訊、報表資訊
    - 資料存取速度慢，但讀取速度快 
    - 資料庫壓力大，但資料一致性要求不高 -> 緩存資料、歷史資料


### 1.2 快取架構與策略

#### 本地快取

本地快取是指在單個應用程式或服務上運行的快取機制。      
這種快取通常儲存在應用程式的記憶體中，或著緊密耦合的儲存介質中。        

本地快取的的特點是：
- 單體應用程式
- 小規模或中小規模的應用程式
- 需要快速且頻繁的訪問資料

於 Spring 相關的領域中，屬於本地快取的技術有：
- Caffeine
- Ehcache
- Guava Cache
- ConcurrentMapCache

#### 分散式快取

分散式快取是指在多個服務緝獲節點上分布的快取機制。      
這種快取通常儲存在獨立的快取伺服器上，並且可以被多個應用程式或服務共享。

分散式快取的特點是：
- 高可用性 : 數據分散在多個節點上，即使某個節點故障，也不會影響整個系統。
- 可擴展性 : 可以根據系統的負載情況，動態增加或減少節點。適合大規模的應用程式。
- 數據一致性 : 通過一致性協議和機制，保證數據的一致性。
- 相要於本地快取，會有較高的延遲、複雜度和成本。

於 Spring 相關的領域中，屬於分散式快取的技術有：
- Redis
- Memcached
- Hazelcast
- Apache Ignite

#### 快取一致性問題(Consistency Problem)

快取一致性問題通常是發生在分散式快取中，        
指得是當快取中的資料和其他快取節點或永久資料儲存層中的資料不一致時，導致應用程式無法正確的獲取資料。

導致的原因可能有 : 
- 快取過期
- 網路延遲
- 節點故障
- 資料更新不同步

但快取不一致就是不好的嗎?       
其實並不一定，因為如果要達到完全一致性，那就必須付出更高的成本，無論是在性能、開發成本、維護成本等方面。        
所以我們應該根據應用程式的需求，來選擇合適的一致性策略。

通常的一致性策略有 :
- 強一致性(Strong Consistency)
    強一致性是指當資料被更新後，所有的快取節點都能立即看到最新的資料。      
    可能可以透過一些同步協議來實現，例如 : Paxos、Raft等。      
    像是銀行系統、支付系統等對一致性要求較高的應用程式，通常會選擇強一致性。
- 弱一致性(Weak Consistency)
    弱一致性是指當資料被更新後，不同的快取節點可能會有不同的資料。      
    但是在一定的時間內，這些資料會逐漸趨於一致。      
    他的重點在於不同節點之間，**逐漸收斂**到一致的狀態。但
    像是社交網路、或是資料在一定時間內不會發生變化的應用程式，通常會選擇弱一致性。
- 最終一致性(Eventual Consistency)
    最終一致性是弱一致性的一種模型。        
    他保證在沒有新的更新操作的情況下，終會收斂到一致的狀態。
    而他跟弱一致性的差別在於最終一致性保證了達成一致的時間是有被規定的，**必須在一定時間內達成一致**。
    這種方法適合需要高可用、高擴展性的應用程式。

#### 快取更新策略
- Cache-Aside
    - Cache-Aside 是一種手動管理快取的策略，當應用程式需要存取資料時，會先從快取中查找，如果沒有找到，則從永久資料儲存層中讀取資料，然後將資料存入快取中。
    - 而當應用程式要寫入資料時，會先更新永久資料儲存層中的資料，然後應用程式將該資料寫入快取或是刪除快取中的資料。以保證快取中的資料是最新的。
    - 優點 : 
        - 簡單易用
        - 適合讀多寫少的場景
        - 適合需要複雜快取邏輯的場景
    - 缺點 :
        - 需要應用程式積極的管理快取，提高了開發成本
- Read-Through
    - Read-Through 是一種自動管理快取的策略，當應用程式需要存取資料時，會先從快取中查找，如果沒有找到，則由快取會自動從永久資料儲存層中讀取資料，然後將資料存入快取中。
    - Read-Through 跟 Cache-Aside 的區別在於，Read-Through 是**快取自動管理快取**，而 Cache-Aside 是應用程式**手動管理快取**。
    - 優點 :
        - 無需應用程式管理快取
        - 保證快取中的資料是最新的，相較 Cache-Aside 更加降低了快取不一致的可能性
    - 缺點 :
        - 會增加永久資料儲存層的負載
        - 會增加快取的延遲
- Write-Through
    - Write-Through 跟 Read-Through 類似，只是他是針對寫入操作的。當應用程式要寫入資料時，會先更新永久資料儲存層中的資料，然後快取會自動將該資料寫入快取中。而 Read-Through 是針對讀取操作的。
    - 簡單來說
        - Read-Through : 讀取資料時，如果快取中沒有，則自動從永久資料儲存層中讀取資料
        - Write-Through : 寫入資料時，會自動更新永久資料儲存層中的資料，然後將資料寫入快取中
    - 優點 :
        - 無需應用程式管理快取
        - 保證快取中的資料是最新的
    - 缺點 :
        - 會增加寫入操作的延遲
- Write-Behind
    - Write-Behind 是一種異步寫入快取的策略，當應用程式要寫入資料時，會先更新永久資料儲存層中的資料，然後快取會將該資料寫入快取中，但是不會立即寫入永久資料儲存層中，而是異步處理永久資料儲存層，優先更新快取中的資料。
    - 與 Write-Through 的區別在於，Write-Behind 是異步寫入永久資料儲存層中的資料，而 Write-Through 是同步寫入永久資料儲存層中的資料。
    - 優點 :
        - 減少寫入操作的延遲
        - 減少永久資料儲存層的負載
    - 缺點 :
        - 快取中的資料可能會比永久資料儲存層中的資料更舊
        - 需要定期批量寫入永久資料儲存層中，增加了系統的複雜度

---

## 2. Spring Cache 基礎
### 2.1 Spring Cache 簡介
- 框架概述與特性        
    - Spring Cache 提供了一個統一的API，允許開發者使用多種底層快取解決方案，而不需要改變業務邏輯。
    - 讓開發者可以透過簡單、快速的 Annotation 就可以實現快取功能。
    - 允許並支持定義多個快取區域(Cache Names)，方便針對不同的業務場景定義不同的快取策略。
    - 可以根據需求動態調整快取行為，例如活存時間TTL(Time to Live)、最近最少使用LRU(Least Recently Used)等。
    - 支援同步、異步快取操作，提供了更多的彈性。
- 快取抽象層與組件介紹 (Cache Manager、Cache Interface)

#### 快取管理器(Cache Manager)
- 快取管理器是 Spring Cache 的核心組件
- 負責管理應用程式中所有的 Cache 實例
- 提供 Cacje 存取的統一接口
- 可以用來整合多種快取解決方案，如 Caffeine、Ehcache、Redis 等
- 常見的快取管理器有 : 
    - SimpleCacheManager :      
        簡單的快取管理器，不提供任何自動配置或管理的公，適合需要完全控制快取行為的場景。
    - ConcurrentMapCacheManager :       
        基於 ConcurrentMap 實現的快取管理器，適合小規模的應用程式。他也不提供任何持久貨或分布式快取的支持。
    - EhCacheCacheManager :         
        基於 Ehcache 實現的快取管理器，提供了更多的配置選項，例如過期時間、淘汰策略等。他也支持持久畫與分布式快取。
    - RedisCacheManager :       
        基於 Redis 實現的快取管理器，Redis 可以提供高性能的內存 NoSQL 數據庫，支持持久化、分布式快取、高可用等特性。
    - CaffeineCacheManager :        
        基於 Caffeine 實現的快取管理器，靈感來自於 google guava 的緩存機制，提供了更高的性能和更多的配置選項。相當適合運用在需要高吞吐量、低延遲的場景。也支持多種策略，如 存活時間(TTL Time to Live)、最近最少使用(LRU Least Recently Used)、基於大小的淘汰策略等。

#### 快取介面(Cache Interface)
- 基本的快取操作介面包括 : 
    - `put(Object key, Object value)` : 將資料存入快取
    - `get(Object key)` : 從快取中獲取資料
    - `evict(Object key)` : 刪除快取中的資料
    - `clear()` : 清空快取中的所有資料
- 後面我們再來實作一個簡單的快取應用，來看看這些操作是如何使用的。


### 2.2 快取註解與配置
- 開始說明快取註解與配置之前，我們先來了解一下 SpEL 表達式。        
    - SpEL 表達式
        SpEL(Spring Expression Language) 是 Spring 框架提供的一種表達式語言，可以用於設定檔、註解、標籤等地方。        
        SpEL 表達式的語法類似於 JavaScript，可以用於訪問對象的屬性、調用對象的方法、進行算術運算、邏輯運算等。        
        例如 : 
        - 存取對象的屬性 : `#user.name`
        - 調用對象的方法 : `#user.getName()`
        - 算術運算 : `#user.age + 1`
        - 邏輯運算 : `#user.age > 18`
        - 運算符 : `#user.age > 18 ? '成年' : '未成年'`
        - 運算符 : `#user.age > 18 and #user.age < 60`
    - 用一段程式碼來作範例      
        - 當我的 code 如下         
        ```java
        @Cacheable(value = "userCache", key = "#userId")
        public User getUserById(Long userId) {
            // 方法實現
        }
        ```
        - 當我調用 `getUserById(1L)` 時，SpEL 表達式 `#userId` 會被解析為 `1L`，然後作為快取的 Key 來使用。
        - 表示緩存時的 Key 是 `1L`。
        - 而當我使用 `getUserById(2L)` 時，SpEL 表達式 `#userId` 會被解析為 `2L`，然後作為快取的 Key 來使用。這時就是會有兩個不同的 Key 的快取。
    - 當然，我們也可以使用物件，並使用物件中的 userId 來作為 Key。        
        ```java
        @Cacheable(value = "userCache", key = "#user.id")
        public User getUserById(User user) {
            // 方法實現
        }
        ```
- 常用註解：        
    - `@Cacheable`      
        用於定義方法的快取配置，可以指定快取名稱、Key 生成策略、條件式快取等。表示方法的返回值應該被緩存。當調用這個方法時，如果緩存中已經存在對應的值，則直接返回緩存中的值，而不會執行方法體內的邏輯。
        ```java
        @Cacheable(value = "userCache", key = "#userId")
        public User getUserById(Long userId) {
            // 方法實現
        }
        ```
    - `@CacheEvict`     
        用於定義方法的快取清除配置，可以指定快取名稱、Key 生成策略、條件式快取等。表示在方法執行後應該移除緩存中的某個條目。這通常用於更新或刪除操作後，確保緩存中的數據是最新的。
        ```java
        @CacheEvict(value = "userCache", key = "#userId")
        public void deleteUserById(Long userId) {
            // 方法實現
        }
        ```
    - `@CachePut`       
        用於定義方法的快取更新配置，他會先執行方法，然後將方法的返回值存入快取中。當我們要更新資料時，要一併更新快取時，就可以使用 `@CachePut` 註解。
        ```java
        @CachePut(value = "userCache", key = "#user.id")
        public User updateUser(User user) {
            // 方法實現
        }
        ```
    - `@Caching`        
        用於定義多個快取註解的組合，可以在一個方法上定義多個快取註解，方便管理。例如向以下這種寫法的意思就是，當我們要讀取資料時，先從快取中讀取，如果快取中沒有，則從資料庫中讀取，然後將資料存入快取中。`e
        ```java
        @Caching(
            cacheable = {
                @Cacheable(value = "userCache", key = "#userId")
            },
            evict = {
                @CacheEvict(value = "userCache", key = "#userId")
            }
        )
        public User getUserById(Long userId) {
            // 方法實現
        }
        ```
    - `@CacheConfig`        
        前述的幾種 annotation 都是針對方法的，而 `@CacheConfig` 是針對類別的，可以在類上定義快取的公共配置。        
        - 沒有使用 `@CacheConfig` 的情況
            ```java
            @Service
            public class UserService {

                @Cacheable(value = "userCache", key = "#userId")
                public User getUserById(Long userId) {
                    // 模擬從數據庫獲取用戶信息
                    return new User(userId, "User" + userId);
                }

                @CacheEvict(value = "userCache", key = "#userId")
                public void deleteUserById(Long userId) {
                    // 模擬刪除用戶
                }
            }
            ```
        - 使用 `@CacheConfig` 的情況
            ```java
            @Service
            @CacheConfig(cacheNames = "userCache")
            public class UserService {

                @Cacheable(key = "#userId")
                public User getUserById(Long userId) {
                    // 模擬從數據庫獲取用戶信息
                    return new User(userId, "User" + userId);
                }

                @CacheEvict(key = "#userId")
                public void deleteUserById(Long userId) {
                    // 模擬刪除用戶
                }
            }
            ```
        其中可以使用的屬性包含      
        - `cacheNames` : 定義快取名稱
        - `keyGenerator` : 定義 Key 生成策略
        - `cacheManager` : 定義快取管理器
        - `cacheResolver` : 定義快取解析器
        
- 有關配置項目的部分，我們等到實作的時候再來一起了解，這樣會比較容易理解。
  - 快取管理器設定
  - Key 生成策略
  - 過期時間設定
  - 內存的最大使用量

### 2.3 ConcurrentMapCache 快取實作搭配 H2 資料庫

- 先來說我們這個實作的目標
    - 實作一個簡單的快取應用，用來練習 Spring Cache 的使用
    - 要可以讓我分辨出快取是否有生效
    - 使用 H2 資料庫來模擬資料庫的存取
    - 假設 10 秒鐘後資料會過期，cache 會清空，就必須重新從資料庫取得資料
    - 設定要實作的策略包含 Read-Through 及 TTL(Time to Live)

1. 先使用 Spring Initializr 建立一個新的專案，我使用的依賴如下
```xml
	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-cache</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-data-jpa</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-devtools</artifactId>
			<scope>runtime</scope>
			<optional>true</optional>
		</dependency>
		<dependency>
			<groupId>com.h2database</groupId>
			<artifactId>h2</artifactId>
			<scope>runtime</scope>
		</dependency>
		<dependency>
			<groupId>org.projectlombok</groupId>
			<artifactId>lombok</artifactId>
			<version>1.18.30</version>
			<scope>provided</scope>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
		</dependency>
		<!--swagger-->
		<dependency>
			<groupId>org.springdoc</groupId>
			<artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
			<version>2.0.2</version>
		</dependency>
	</dependencies>

	<build>
		<plugins>
			<plugin>
				<groupId>org.apache.maven.plugins</groupId>
				<artifactId>maven-compiler-plugin</artifactId>
				<configuration>
					<annotationProcessorPaths>
						<path>
							<groupId>org.projectlombok</groupId>
							<artifactId>lombok</artifactId>
						</path>
					</annotationProcessorPaths>
				</configuration>
			</plugin>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
				<configuration>
					<excludes>
						<exclude>
							<groupId>org.projectlombok</groupId>
							<artifactId>lombok</artifactId>
							<version>1.18.30</version>
						</exclude>
					</excludes>
				</configuration>
			</plugin>
		</plugins>
	</build>
```
2. 把 `applicatoin.properties` 改成 `application.yml`，並加入以下設定
```yaml
spring:
  application:
    name: cache-h2-practice
  #  h2
  datasource:
    url: jdbc:h2:mem:testdb 
    driver-class-name: org.h2.Driver 
    username: sa 
    password: password 
  h2:
    console:
      enabled: true
      path: /h2-console
  jpa:
    database-platform: org.hibernate.dialect.H2Dialect
    hibernate:
      ddl-auto: create
    show-sql: true 
    open-in-view: false 
    generate-ddl: false
    defer-datasource-initialization: true

# swagger
springdoc:
  swagger-ui:
    path: /swagger-ui.html
```
3. 建立 CacheConfig，使用最簡單的 ConcurrentMapCache 來實作
```java
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager() {
            @Override
            protected ConcurrentMapCache createConcurrentMapCache(String name) {
                return new ConcurrentMapCache(name,
                        new ConcurrentHashMap<>(256),
                        false // 是否允許 null 值存入 Cache
                );
            }
        };
    }
}
```
3. 實作 TTL 的 Sechedule
```java
@Component
public class CacheEvictScheduler {

    // 每 10 秒清除一次緩存
    @Scheduled(fixedRate = 10000)
    @CacheEvict(value = "users", allEntries = true)
    public void clearUserCache() {
        System.out.println("Cache cleared");
    }
}
```
4. 實作一個 User Entity
```java
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;
}
```
5. 實作一個 UserRepository
```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
}
```
6. 實作一個 UserService
```java
@Service
@Transactional(readOnly = true)
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

//    value 為緩存名稱，key 為緩存的 key，cacheManager 為緩存管理器
//    我們可以在不同德地方藉由使用 緩存名稱 來指定使用哪個緩存，例如在 CacheEvictScheduler.java 中就指定時間到了要將緩存名稱為 users 的緩存清除
    @Cacheable(value = "users", key = "#id", cacheManager = "cacheManager")
    public User getUserById(Long id) {
        // 模擬延遲以驗證緩存效果
        // 如果沒有使用緩存，每次請求都會花費 3 秒
        // 如果使用緩存，則這個方法內的所有邏輯都不會執行，直接返回緩存中的結果
        // 藉此驗證緩存是否生效
        try {
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return userRepository.findById(id).orElse(null);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
```
7. 實作一個 UserController
```java
@RestController
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/users/{id}")
    public User getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }
}
```
8. 再來寫一個初始化資料的 CommandLineRunner
```java
@Component
public class DataInitializer implements CommandLineRunner {
    private final UserRepository userRepository;

    public DataInitializer(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        userRepository.save(User.builder().username("user1").build());
        userRepository.save(User.builder().username("user2").build());
        userRepository.save(User.builder().username("user3").build());
    }
}
```
9. 啟動專案，並使用 Swagger 來測試
    - 啟動專案，並進入 `http://localhost:8080/swagger-ui.html` 看是否有正常啟動
    - 在 console 可以看到每 10 秒會清除一次快取並印出 `Cache cleared`
    - 先用 Swagger 測試 `GET /users`，確認是否有資料
    - 再用 Swagger 測試 `GET /users/{id}`，這是第一次打這支 API，依照我們在 UserService 的設定，會花費 3 秒，然後才會回傳資料
    - 再用 Swagger 測試 `GET /users/{id}`，這是第二次打這支 API，因為有快取，當快取中已經有資料的時候，整個getUserById 方法就不會執行，直接回傳快取中的資料，這樣就證明了快取的效果

- 程式碼我放在[這裡](https://github.com/mister33221/ConcurrentMapCache-h2-practice.git)

### 2.4 Caffeine 快取搭配 H2 資料庫

- 這次來使用也很熱門的 caffeine 來實作快取，需求跟上一個範例一樣，不過增加了一些特性
    - 定義初始快取可以存放的最大數量
    - 定義最大快取數量
    - 練習使用 Caffeine expireAfterWrite、expireAfterAccess、refreshAfterWrite 等方法
    - 練習使用 Caffeine weakKeys、weakValues、softValues 等方法
    - 練習使用 Caffeine recordStats 方法來記錄快取的統計資訊
    - 以上的內容會在程式碼的註解中有詳細的說明

那我們就開始吧!

1. `pom.xml`，加入了 Caffeine 的依賴
```xml
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-cache</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-data-jpa</artifactId>
		</dependency>
		<!-- Caffeine Cache -->
		<dependency>
			<groupId>com.github.ben-manes.caffeine</groupId>
			<artifactId>caffeine</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-devtools</artifactId>
			<scope>runtime</scope>
			<optional>true</optional>
		</dependency>
		<dependency>
			<groupId>com.h2database</groupId>
			<artifactId>h2</artifactId>
			<scope>runtime</scope>
		</dependency>
		<dependency>
			<groupId>org.projectlombok</groupId>
			<artifactId>lombok</artifactId>
			<version>1.18.30</version>
			<scope>provided</scope>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
		</dependency>
		<!--swagger-->
		<dependency>
			<groupId>org.springdoc</groupId>
			<artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
			<version>2.0.2</version>
		</dependency>
```

2. `application.yml`，與前一個範例一樣就不重複了
3. `CacheConfig`，這次我們使用 Caffeine 來實作快取
```java
@Configuration
@EnableCaching  // 啟用緩存功能
public class CacheConfig {

    @Bean
    public Caffeine<Object, Object> caffeineConfig() {
        // 設定最大緩存容量為 100，緩存時間為 10 秒
        return Caffeine.newBuilder()
                .initialCapacity(100) // initial capacity for the cache, the unit is the number of entries
                .maximumSize(500) // maximum size for the cache, the unit is the number of entries
                .expireAfterWrite(10, TimeUnit.SECONDS) // After 10 seconds the entries have been written, they will be expired.
                .expireAfterAccess(10, TimeUnit.SECONDS) // After 10 seconds the entries have been accessed, they will be expired.
//                .refreshAfterWrite(10, TimeUnit.SECONDS) // the cache will be refreshed after 10 seconds without any api request.(TODO: need to be verified)
//                the refreshAfterWite need to work with cacheManager to define the cacheLoader to achieve the refresh function.
                .weakKeys() // Use weak references for keys. The values can be garbage collected if there are no other string references to the keys.
                .weakValues() // Uses weak references for keys. The keys can be garbage collected if there are no strong references to them elsewhere in the application.
//                .softValues() // When the JVM is running low on memory, the garbage collector will evict the entries from the cache based on the LRU algorithm.
                .recordStats(); // record the cache statistics
    }

    @Bean
    public CacheManager cacheManager(Caffeine<Object, Object> caffeine) {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        cacheManager.setCaffeine(caffeine);
        return cacheManager;

//        If we want to use the refreshAfterWrite function, we need to define the cacheLoader in the cacheManager.
//        CaffeineCacheManager cacheManager = new CaffeineCacheManager("users");
//        cacheManager.setCacheLoader(new CacheLoader<Object, Object>() {
//            @Override
//            public Object load(Object key) throws Exception {
//                // 在這裡定義如何從數據來源讀取資料
//                return fetchFromDatabase((Long) key);
//            }
//        });
    }

//    private User fetchFromDatabase(Long id) {
//        // 模擬從資料庫獲取資料的邏輯
//        System.out.println("Fetching data from the database...");
//        return productRepository.findById(id).orElse(null);
//    }
}
```
4. `CacheEvictScheduler`，一樣
5. `User`，也一樣
6. `UserRepository`，也一樣
7. `UserService`，稍微修改了 `@Cacheable` 的格式，並加入了印出快取統計資訊的方法
```java
@Service
@Transactional(readOnly = true)
public class UserService {
    private final UserRepository userRepository;
    private CacheManager cacheManager;
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    public UserService(UserRepository userRepository, CacheManager cacheManager) {
        this.userRepository = userRepository;
        this.cacheManager = cacheManager;
    }

//    value 為緩存名稱，key 為緩存的 key，cacheManager 為緩存管理器
//    我們可以在不同德地方藉由使用 緩存名稱 來指定使用哪個緩存，例如在 CacheEvictScheduler.java 中就指定時間到了要將緩存名稱為 users 的緩存清除
    @Cacheable(value = "users", key = "#id")
    public User getUserById(Long id) {
        // 模擬延遲以驗證緩存效果
        // 如果沒有使用緩存，每次請求都會花費 3 秒
        // 如果使用緩存，則這個方法內的所有邏輯都不會執行，直接返回緩存中的結果
        // 藉此驗證緩存是否生效
        try {
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return userRepository.findById(id).orElse(null);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void printCacheStats() {
        CacheStats stats = getCacheStatistics();
        logger.info("Cache Hit Count: " + stats.hitCount());
        logger.info("Cache Miss Count: " + stats.missCount());
        logger.info("Cache Load Success Count: " + stats.loadSuccessCount());
        logger.info("Cache Load Failure Count: " + stats.loadFailureCount());
        logger.info("Cache Hit Rate: " + stats.hitRate());
        logger.info("Cache Eviction Count: " + stats.evictionCount());
    }

    public CacheStats getCacheStatistics() {
        // 取得緩存區 products
        CaffeineCache cache = (CaffeineCache) cacheManager.getCache("users");
        if (cache != null) {
            Cache<Object, Object> nativeCache = cache.getNativeCache();
            return nativeCache.stats();  // 返回 CacheStats
        }
        throw new IllegalStateException("Cache 'products' not found!");
    }
}
```
8. `UserController`，來加入印出快取統計資訊的 API
```java
@RestController
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/users/{id}")
    public User getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @GetMapping("/users/printCacheStats")
    public void printCacheStats() {
        userService.printCacheStats();
    }
}
```
9. `DataInitializer`，也是一樣的

- 程式碼我放在[這裡](https://github.com/mister33221/caffeine-h2-practice.git)
- 有興趣的就載來啟動，使用 Swagger 來玩玩看吧


### 2.5 實作搭配 Redis 快取

- 這次我們來使用 Redis 來實作快取，需求跟前面的邏輯都是一樣的
- Redis 的部分就使用 Docker 來啟動，這樣比較方便

1. `pom.xml`，加入了 Redis 的依賴
```xml
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-data-jpa</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-cache</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-data-redis</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-devtools</artifactId>
			<scope>runtime</scope>
			<optional>true</optional>
		</dependency>
		<dependency>
			<groupId>com.h2database</groupId>
			<artifactId>h2</artifactId>
			<scope>runtime</scope>
		</dependency>
		<dependency>
			<groupId>org.projectlombok</groupId>
			<artifactId>lombok</artifactId>
			<version>1.18.30</version>
			<scope>provided</scope>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
		</dependency>
		<!--swagger-->
		<dependency>
			<groupId>org.springdoc</groupId>
			<artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
			<version>2.0.2</version>
		</dependency>
```
2. `application.yml`，這次我們要加入 Redis 的設定
```yaml
spring:
  application:
    name: redis-cache-practice
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
    username: sa
    password: password
  h2:
    console:
      enabled: true
      path: /h2-console
  jpa:
    database-platform: org.hibernate.dialect.H2Dialect
    hibernate:
      ddl-auto: create
    show-sql: true
  data:
    redis:
      host: localhost
      port: 6379
      timeout: 6000

# swagger
springdoc:
  swagger-ui:
    path: /swagger-ui.html
```
3. 建立 docker compose 檔案 `docker-compose.yml`
```yaml
version: '3.8'
services:
  redis:
    image: redis:latest  # 使用官方 Redis 鏡像
    container_name: redis-container
    ports:
      - "6379:6379"  # 對映本機 6379 埠
    command: redis-server --appendonly yes  # 啟用 Redis 持久化
  redisinsight:
    image: redis/redisinsight:latest
    container_name: my-redisinsight
    ports:
      - "5540:5540"
    depends_on:
      - redis
```
4. 啟動 Redis
    - 在專案的根目錄下執行 `docker-compose up -d` 來啟動 Redis
    - 啟動 Redis Insight，可以在 `http://localhost:5540` 看到 Redis Insight 的介面，用法可以參考[這裡](https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/SkQtZ-us5)，重點主要是要連線的時候，因為我們是使用 docker 同時啟動 redis 和 redis insight，所以要連線的時候要用 `host.docker.internal` 來連線
5. `CacheConfig`，這次我們使用 Redis 來實作快取
```java
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory redisConnectionFactory) {
        RedisCacheConfiguration cacheConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10))  // 設定緩存過期時間
                .disableCachingNullValues()  // 不緩存 null 值
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))  // 鍵序列化
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()));  // 值序列化

        return RedisCacheManager.builder(redisConnectionFactory)
                .cacheDefaults(cacheConfig)
                .build();
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory redisConnectionFactory) {
        RedisTemplate<String, Object> redisTemplate = new RedisTemplate<>();
        redisTemplate.setConnectionFactory(redisConnectionFactory);
        redisTemplate.setKeySerializer(new StringRedisSerializer());
        redisTemplate.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        return redisTemplate;
    }
}
```
6. `CacheEvictScheduler`，一樣
7. `User`，也一樣
8. `UserRepository`，也一樣
9. `UserService`，稍微修改了一點點
```java
@Service
@Transactional(readOnly = true)
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Cacheable(value = "users", key = "#id")
    public User getUserById(Long id) {
        try {
            Thread.sleep(3000);  // 模擬延遲
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return userRepository.findById(id).orElse(null);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

}
```
10. `UserController`
```java
@RestController
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/users/{id}")
    public User getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }
}
```
11. `DataInitializer`，也是一樣的

- 程式碼我放在[這裡](https://github.com/mister33221/redis-cache-h2-practice.git)

### 2.6 使用 Caffeine 快取配合 Redis 快取實作多層快取

- 我們想要達到的目標如下
    - 如果本地 Caffeine 快取中有資料，則直接從本地快取中取得資料
    - 如果本地 Caffeine 快取中沒有資料，則從 Redis 快取中取得資料
    - 如果 Redis 快取中沒有資料，則從資料庫中取得資料
    - 如果資料庫中有資料，則將資料存入 Redis 快取中
    - 如果 Redis 快取中有資料，則將資料存入本地 Caffeine 快取中
    - 這樣就達到了多層快取的效果
- 但是在 Spring  所提供的 `@Cacheable` 註解中，只有非常值觀且簡單的緩存機制，無法實現多層快取的需求，如果想要達到多層級的緩存功能，有兩個方向
    - 不使用 `@Cacheable` 註解，自己在 service 層中，用 code 來實現多層快取，好處是很靈活，但是也會出現很多重複的 code
    - Override `CacheManager` 來實現多層快取，將多層級的邏輯封裝在 `CacheManager` 中，這樣就可以在 service 層中直接使用 `@Cacheable` 註解，這樣就可以達到多層快取的效果

- 我有去查了一些作法，也玩了一下，目前是沒有找到一個比較漂亮個做法
    - 把 caffeine 跟 redis 一起使用 `cacheManager` 來實作多層快取，但似乎沒有作用
    - 使用 `@Cacheable` 的 `cacheManager` 屬性來指定使用哪個快取管理器。
        - 這是很好的方式來指定要從哪個快取管理器中取得資料，但是這樣只能指定一個快取管理器，無法達到多層快取的效果
    - 在 service 層中，`@Cacheable` 先從 Caffeine 取，如果沒有再從 Redis 取，這樣就可以達到多層快取的效果
        - 這樣的方式是最簡單、最直覺的方式，就是自己寫 code 來完成邏輯
        - 但是這樣會有很多重複的 code，可能要再把重複的邏輯抽出來，獨自一個 redis service 或 util 類別來處理，會優雅一點
        - 我就不再特別寫一個範例了

---

## 3. 一些使用快取時的小技巧

### 3.1 同步快取

- 在使用 `@Cacheable` 註解時，有時候會遇到多個請求同時進來，這時候就會有一個問題，就是當第一個請求進來的時候，會去資料庫取資料，然後放入快取中，這時候其他的請求也會進來，但是這時候快取中還沒有資料，所以其他的請求也會去資料庫取資料，這樣就會造成資料庫的壓力，這時候就需要同步快取
- 使用 `@Cacheable` 的 `sync` 屬性
    - `@Cacheable(value = "users", key = "#id", sync = true)`
    - 這樣就可以達到同步快取的效果，避免多個請求同時執行查詢
    - 只有當第一個請求查詢完資料並放入快取中後，其他的請求才會直接從快取中取資料，而不會再去資料庫查詢
- 使用互斥鎖(ReentrantLock)來實現同步快取
    - 這個方法是自己寫 code 來實現同步快取，這樣就可以達到同步快取的效果
    - 這個方法比較靈活，可以自己控制同步的範圍，但是也會有一些重複的 code
    ```java
    @Service
    public class UserService {

        private final UserRepository userRepository;
        private final ReentrantLock lock = new ReentrantLock();

        public UserService(UserRepository userRepository) {
            this.userRepository = userRepository;
        }

        public User getUserByNameWithLock(String name) {
            String cacheKey = "user:" + name;
            User cachedUser = getCachedUser(cacheKey);  // 從快取中獲取
            if (cachedUser != null) {
                return cachedUser;
            }

            // 獲取鎖，防止多線程重複讀取
            lock.lock();
            try {
                // 再次檢查快取
                cachedUser = getCachedUser(cacheKey);
                if (cachedUser == null) {
                    User userFromDb = userRepository.findByName(name);
                    putUserInCache(cacheKey, userFromDb);  // 存入快取
                    return userFromDb;
                }
                return cachedUser;
            } finally {
                lock.unlock();  // 確保釋放鎖
            }
        }
    }
    ```   
- 也可以使用 `synchronized` 來實現同步快取
    ```java
    @Service
    public class UserService
    {
        private final UserRepository userRepository;

        public UserService(UserRepository userRepository) {
            this.userRepository = userRepository;
        }

        public synchronized User getUserByNameWithSync(String name) {
            String cacheKey = "user:" + name;
            User cachedUser = getCachedUser(cacheKey);  // 從快取中獲取
            if (cachedUser != null) {
                return cachedUser;
            }

            User userFromDb = userRepository.findByName(name);
            putUserInCache(cacheKey, userFromDb);  // 存入快取
            return userFromDb;
        }
    }
    ``` 

### 3.2 預熱快取(Cache warm up)

- 預熱快取是指在應用啟動時，就將資料預先放入快取中，這樣可以避免在第一次請求時，因為快取中沒有資料，而需要去資料庫查詢，這樣可以提高應用的性能
- 預熱就是個概念，所以有很多中可以達成的方式
    - 使用 `CommandLineRunner` 來實現預熱快取，這樣可以在應用啟動時，就執行預熱快取的邏輯
    ```java
    @Component
    public class CacheWarmUp implements CommandLineRunner {

        private final UserService userService;

        public CacheWarmUp(UserService userService) {
            this.userService = userService;
        }

        @Override
        public void run(String... args) {
            List<User> users = userService.getAllUsers();
            for (User user : users) {
                userService.getUserById(user.getId());
            }
        }
    }
    ```
    - 使用 `@PostConstruct` 來實現預熱快取，這樣可以在 bean 初始化完成後，就執行預熱快取的邏輯
    ```java
    @Service
    public class UserService {

        private final UserRepository userRepository;

        public UserService(UserRepository userRepository) {
            this.userRepository = userRepository;
        }

        @PostConstruct
        public void warmUpCache() {
            List<User> users = userRepository.findAll();
            for (User user : users) {
                getUserById(user.getId());
            }
        }
    }
    ```
    我們也來比較一下 `commandLineRunner` 跟 `@PostConstruct` 的差異

    | **項目**         | **`@PostConstruct`**                                            | **`CommandLineRunner`**                                        |
    |------------------|-----------------------------------------------------------------|---------------------------------------------------------------|
    | **執行時機**     | Spring Bean 初始化完成後執行                                    | Spring Boot 應用完全啟動後執行                                |
    | **執行時序**     | 每個 Bean 初始化後分開執行                                      | 所有 Bean 初始化完成後統一執行一次                            |
    | **用途**         | 資源初始化、快取預熱、物件屬性加載                              | 應用啟動後執行批量操作、背景任務、讀取啟動參數                |
    | **接收參數**     | 無參數方法                                                      | `String... args`，可接收命令列參數                             |
    | **適用場景**     | 快取預熱、初始化物件屬性、加載配置文件、建立連接池等             | 啟動監控服務、啟動批量處理、讀取參數執行初始化任務             |
    | **實現方式**     | 方法標註 `@PostConstruct` 即可執行                              | 實作 `CommandLineRunner` 介面並覆寫 `run(String... args)` 方法 |
    | **異常處理**     | 若方法內發生異常會導致該 Bean 加載失敗，進而影響應用啟動         | 可進行異常處理且不會中斷應用啟動                               |
    | **控制執行順序** | 無法控制多個 `@PostConstruct` 方法執行順序                       | 可使用 `@Order` 註解控制多個 `CommandLineRunner` 的執行順序    |
    | **適用範圍**     | 單一 Bean 層級                                                   | 全局應用層級                                                   |
    | **優點**         | 簡單方便，適合單一 Bean 初始化時執行固定邏輯                    | 可以處理參數並進行應用級別的初始化操作                         |
    | **缺點**         | 只能在單一 Bean 上執行，且無法讀取應用參數                      | 比 `@PostConstruct` 複雜，需要實作 `run()` 方法                |


    - 使用 Sechedule 來實現預熱快取，這樣可以定時執行預熱快取的邏輯
    ```java
    @Component
    public class CacheWarmUpScheduler {

        private final UserService userService;

        public CacheWarmUpScheduler(UserService userService) {
            this.userService = userService;
        }

        @Scheduled(fixedRate = 60000)  // 每 60 秒執行一次
        public void warmUpCache() {
            List<User> users = userService.getAllUsers();
            for (User user : users) {
                userService.getUserById(user.getId());
            }
        }
    }
    ```

---

## 4. 最佳實踐
### 4.1 性能優化與常見問題處理

#### 快取擊穿

快取擊穿指的是當一個熱點數據在快取中過期時，大量的請求同時進來，這時候快取中沒有這個熱點數據，所以所有的請求都會去資料庫查詢，這樣就會導致資料庫的壓力，這時候就需要一些方法來解決快取擊穿的問題        

這個問題可以透過前面提到的同步快取來解決，當快取中沒有資料時，只允許一個請求去資料庫查詢，其他的請求等待，當第一個請求查詢完資料並放入快取中後，其他的請求就可以直接從快取中取資料，這樣就可以避免快取擊穿的問題

#### 快取穿透

快取穿透指的是當一個請求查詢一個不存在的資料時，這時候快取中沒有這個資料，所以所有的請求都會去資料庫查詢，這樣就會導致資料庫的壓力，這時候就需要一些方法來解決快取穿透的問題

解決方案
- 使用空值快取
    - 當查詢的資料不存在時，將空值放入快取中，這樣下次再查詢這個資料時，就可以直接從快取中取得空值，而不用再去資料庫查詢
    - 搭配設定較短的 TTL，避免快取中長時間存放空值
- 使用布隆過濾器
    - 使用布隆過濾器來過濾掉不存在的資料，這樣就可以避免查詢不存在的資料，進而避免快取穿透的問題
    - 有關布隆過濾器(Bloom Filter)的細節，可以參考[TODO這裡](TODO)
    ```java
    @Component
    public class BloomFilter {

        private final BloomFilter<String> bloomFilter = BloomFilter.create(Funnels.stringFunnel(Charset.defaultCharset()), 1000000, 0.01);

        public void put(String key) {
            bloomFilter.put(key);
        }

        public boolean mightContain(String key) {
            return bloomFilter.mightContain(key);
        }
    }
    ```
- 參數校驗
    - 在查詢資料之前，先對參數進行校驗，如果參數不合法，就直接返回空值，這樣就可以避免查詢不存在的資料，進而避免快取穿透的問題

#### 快取雪崩

快取雪崩指的是當快取中的大量資料同時過期時，這時候快取中的資料都失效了，所以所有的請求都會去資料庫查詢，這樣就會導致資料庫的壓力，這時候就需要一些方法來解決快取雪崩的問題      

這個問題可能會在大量快取都設定了相同的過期時間或是在快取服務器重啟時發生。

解決方案
- 使用隨機過期時間
    - 為每個快取設定不同的過期時間，這樣就可以避免所有的快取同時過期，進而避免快取雪崩的問題
- 使用熱點數據預熱
    - 對熱點數據提前進行預熱，這樣就可以避免熱點數據同時過期，進而避免快取雪崩的問題
- 多層快取
    - 使用多層快取，將熱點數據放入本地快取中，將非熱點數據放入 Redis 快取中，這樣就可以避免所有的快取同時過期，進而避免快取雪崩的問題
- 使用限流
    - 當大量請求同時進來時，可以使用限流來控制請求的流量，這樣就可以避免資料庫的壓力，進而避免快取雪崩的問題

- 過期策略選擇與資料一致性

### 4.2 開發與測試建議

#### 快取粒度

- 快取粒度指的是將資料放入快取中的粒度，快取粒度過大會導致快取命中率降低，快取粒度過小會導致快取管理複雜，所以需要根據實際情況來選擇適當的快取粒度

| **快取粒度** | **定義** | **優點** | **缺點** |
|--------------|----------|----------|----------|
| **細粒度**   | 將每個資料單獨放入快取中 | 快取命中率高 | 快取管理複雜 |
| **粗粒度**   | 將多個資料放入同一個快取中 | 快取管理簡單 | 快取命中率低 |

---

## 6. 快取 問題排查

### 6.1 Log 記錄

- 在快取中，有時候會遇到一些問題，這時候就需要通過 log 記錄來排查問題
- 使用不同方式來實作快取，就會用不同的方式來記錄 log
- `SimpleCacheErrorHandler`，這是 Spring 提供的一個簡單的快取錯誤處理器，可以用來記錄快取的錯誤
```java
@Configuration
public class SimpleCacheErrorHandler implements CacheErrorHandler {

    private static final Logger logger = LoggerFactory.getLogger(SimpleCacheErrorHandler.class);

    @Override
    public void handleCacheGetError(RuntimeException exception, Cache cache, Object key) {
        logger.error("Cache {} get error, key: {}", cache.getName(), key, exception);
    }

    @Override
    public void handleCachePutError(RuntimeException exception, Cache cache, Object key, Object value) {
        logger.error("Cache {} put error, key: {}, value: {}", cache.getName(), key, value, exception);
    }

    @Override
    public void handleCacheEvictError(RuntimeException exception, Cache cache, Object key) {
        logger.error("Cache {} evict error, key: {}", cache.getName(), key, exception);
    }

    @Override
    public void handleCacheClearError(RuntimeException exception, Cache cache) {
        logger.error("Cache {} clear error", cache.getName(), exception);
    }
}
```
- 直接使用 `application.yml` 來設定 log 等級，這樣 Caffeine 快取的新增、刪除、查詢、過期等操作都會被記錄下來
```yaml
logging:
  level:
    org.springframework.cache: debug
```
- redis 當作快取也可以在 `application.yml` 中設定 log 等級
```yaml
logging:
  level:
    org.springframework.data.redis: debug
```
- Spring Actuator 也可以用來監控快取的狀態，可以查看快取的命中率、命中次數、未命中次數等訊息。細節有需要再去查囉
