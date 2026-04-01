---
title: "Spring Boot Test：從基礎到實戰"
date: "2026-03-24"
category: "Backend"
tags: ["Spring Boot", "Security", "JWT"]
summary: "- 甚麼是測試?"
published: true
---

# Spring Boot Test：從基礎到實戰

## 一、Spring Boot 測試的基礎概念
### 1.1 為什麼需要自動化測試
- 甚麼是測試?
  - 通常一個需求，都會有預期想要達成的結果，而我們就可以透過測試來驗證我們所實作的功能是否符合預期。
- 為什麼要自動化測試?
  - 我們預期達到的結果可能是一種結果，也可能是多種結果，甚至在我們所實作的功能可能會跑出無法預期的結果。我們會需要想辦法驗證我們的實作是否正確。如果使用人工來驗證的話，會需要大量的時間跟人力，也可能漏掉某些狀況。
  - 那我們就透過自動化的測試，將測試也寫成程式碼，透過程式碼來驗證我們的功能是否正確。這樣的好處是，我們可以隨時隨地的執行測試，並且可以在每次的程式碼修改後，透過測試來確保我們的功能是否正確。

### 1.2 Spring Boot 測試框架介紹

#### JUnit 5（Jupiter）
- Junit 5 是目前最新的 Junit 版本，在 Java 的生態圈中算是很流行的單元測試框架。
- Junit 大致由三個部分組成
  - Junit Platform：提供了執行測試的 API，也提供了執行測試的引擎 API。
  - Junit Jupiter：引入新語法與特性，例如 Lambda、Parameterized Test、Extension Model 等。
  - Junit Vintage：提供了向後兼容的 API，讓舊版的 Junit 3、4 可以在 Junit 5 上執行。

#### Spring Boot Test Starter
- Spring Boot 提供了一個專門用來測試的 Starter，因為是 Spring Boot 的親兒子，開箱即用，也許 Spring Boot 有更好的整合性。
- 其中包含的依賴有
  - JUnit 5 : 主要的測試框架
  - Spring Test : Spring 提供的測試支援
  - AssertJ : 一個更好的斷言框架
  - Mockito : 用來模擬對象的工具
  - Hamcrest : 斷言庫，也支持自定義斷言
  - JSONassert : 用來比較 JSON 的工具
  - XmlUnit : 用來比較 XML 的工具
- 引用方式就是在 pom.xml 中加入 spring-boot-starter-test 這個依賴即可。
  ```xml
  <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-test</artifactId>
      <scope>test</scope>
  </dependency>
  ```
- 後面的章節，我們就來直接實作 Spring Boot 的測試。


### 1.3 測試種類與測試金字塔

#### 單元測試（Unit Test）
- 單元測試是針對程式中最小的可測試單元進行測試，通常是針對一個方法或一個類別進行測試。
- 單元測試追求
  - 小範圍
  - 快速
  - 獨立，不依賴其他模組
- 適合使用單元測試的場景
  - 驗證業務邏輯，如計算公式、條件判斷等
  - 驗證工具類、輔助方法，如日期轉換、加密解密等
  - 驗證單個模組的輸入與輸出是否符合預期
- 範例
  ```java
  class CalculatorTest {

      @Test
      void testAdd() {
          Calculator calculator = new Calculator();
          int result = calculator.add(2, 3);
          assertEquals(5, result);  // 驗證加法結果
      }
  }
  ```

#### 整合測試（Integration Test）
- 整合測試是針對多個模組之間的整合進行測試，通常是針對模組之間的交互作用進行測試。
- 整合測試追求
  - 中等範圍
  - 需要真實的環境
  - 需要真實的依賴
- 適合使用整合測試的場景
  - 驗證模組之間的交互作用
  - 測試資料庫操作是否符合預期
  - 模擬真實環境中的系統行為
- 範例
  ```java
  @SpringBootTest
  class UserServiceIntegrationTest {

      @Autowired
      private UserService userService;

      @Autowired
      private UserRepository userRepository;

      @Test
      void testCreateUser() {
          User user = new User("testUser", "testEmail@example.com");
          userService.createUser(user);

          User savedUser = userRepository.findByName("testUser");
          assertNotNull(savedUser);  // 驗證用戶是否成功保存
      }
  }
  ```

#### 端到端測試（End-to-End Test）
- 也就是 E2E 測試，是針對整個系統的功能進行測試，通常是針對用戶的操作流程進行測試，是最高層次的測試。
- E2E 測試追求
  - 全面性
  - 需要真實的環境
  - 需要真實的依賴
  - 模擬真實用戶行為
- 現在的 Web 專案通常是前後端分離的，前端使用 E2E 測試框架，如 Selenium、Cypress 等。而這篇文章主要是針對後端的測試，前端 Cypress 可以參考我之前的[文章](https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/S170WynZ3)。
- 所以當我們的前端搭配後端的測試，整合起來就是 E2E 測試。

### 1.5 測試切片（Slice Testing）
- 測試切片是一種測試策略
- 指專注於系統或應用程式鍾某一層或某一類組件的測試，而非整個應用程式的測試
- 藉由限制測試範圍，將問題的範圍縮小，提高測試效率，確認每一個組件的正確性
- 又分為
  - 垂直切片測試（Vertical Slice Testing）：    
    測試一個功能的所有層次    
    例如：測試一個使用者登入功能，從前端輸入到後端驗證，再到資料庫比對。
  - 水平切片測試（Horizontal Slice Testing）：    
    測試一層的所有功能    
    例如：測試所有的 Service 功能，或是所有的 Repository 功能。

## 二、測試環境搭建與配置
接下來，我們就來實作一些測試案例，並在過程中，解釋常用的測試配置與技巧。

### 2.1 添加測試相關依賴
- Maven 配置
```xml
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
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-validation</artifactId>
		</dependency>
		<dependency>
			<groupId>org.junit.platform</groupId>
			<artifactId>junit-platform-suite-api</artifactId>
			<version>1.8.2</version>
			<scope>test</scope>
		</dependency>
		<!--swagger-->
		<dependency>
			<groupId>org.springdoc</groupId>
			<artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
			<version>2.7.0</version>
		</dependency>
	</dependencies>
```
- 要注意 lombok 要寫版本，下面 plugin 也要寫，不然 IDE 可能會抓不到 lombok ，即便 import 了也沒用。
```xml
	<build>
		<plugins>
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
- Lombok 抓不到還有可能是因為 IDE Annotation Processors 的問題，要自己到 Setting > Build, Execution, Deployment > Compiler > Annotation Processors 勾選 Enable annotation processing、Obtain processors from project classpath、Module output directory，表示要從專案的 classpath 中獲取 processors，並且將 processors 的輸出目錄設置為模塊的輸出目錄。

### 2.2 application.yml 配置
```yaml
spring:
  application:
    name: test-practice

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
      ddl-auto: create-drop # 測試結束後刪除資料表
    show-sql: true
    open-in-view: false
    generate-ddl: true
    defer-datasource-initialization: true

# Swagger path: http://localhost:8080/swagger-ui/index.html
```

### 2.3 Entity
- 這個專案只會有一個 Entity，就是 User
```java
@Entity
@Table(name = "users")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    private String code;


    //    create a new user
    public static User createUser(CreateUserRequest userRequest) {
        return User.builder()
                .name(userRequest.getName())
                .email(userRequest.getEmail())
                .code("USER-" + System.currentTimeMillis())
                .build();
    }
}
```

### 2.4 RequestBody
- 用一個 RequestBody 提供給等等想要實作新增用戶的 API 使用
```java
@Data
public class CreateUserRequest {

    @NotNull(message = "Name is required")
    @NotBlank(message = "Name is required")
    @Size(min = 3, max = 50, message = "Name should be between 3 and 50 characters")
    @Schema(description = "Name of the user", example = "John Doe")
    private String name;

    @NotNull(message = "Email is required")
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Schema(description = "Email of the user", example = "johndoe@example.com")
    private String email;
}
```

### 2.5 Repository
- 新增一個方法拿來驗證 Email 是否已經存在
```java
public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmail(@NotNull @NotBlank(message = "Email is required") @Email(message = "Email should be valid") String email);
}
```

### 2.6 Service
```java
@Service
public class UserService {


    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // 獲取所有使用者
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // 創建新使用者
    public synchronized  User createUser(CreateUserRequest userRequest) {
        // 檢查 email 是否已存在
        if (userRepository.existsByEmail(userRequest.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + userRequest.getEmail());
        }

        User newUser = User.createUser(userRequest);
        return userRepository.save(newUser);
    }

    // 通過ID獲取使用者
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User with ID " + id + " not found."));
    }

}
```

### 2.7 Controller
- 我們先在 Controller 中寫三支 api
  - 由用戶 ID 取得用戶資訊
    - GET /user/{id}
  - 取得所有用戶資訊
    - GET /users
  - 新增用戶
    - POST /user
    - RequestBody
      ```json
      {
          "name": "testUser",
          "email": "test@example.com"
      }
      ```
```java
@RestController
@RequestMapping("/users")
@Tag(name = "User Management", description = "Endpoints for managing users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @Operation(summary = "Get user by ID", description = "Retrieve a specific user by their unique ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User found",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = User.class))),
            @ApiResponse(responseCode = "404", description = "User not found", content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @Operation(summary = "Get all users", description = "Retrieve a list of all users")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of users",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = User.class)))
    })
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @Operation(summary = "Create a new user", description = "Add a new user to the system")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "User created successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = User.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content)
    })
    @PostMapping
    public ResponseEntity<User> createUser(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "User to create", required = true,
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = CreateUserRequest.class)))
            @RequestBody @Valid CreateUserRequest user) {
        User createdUser = userService.createUser(user);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(createdUser.getId())
                .toUri();

        return ResponseEntity.created(location).body(createdUser);
    }
}
```

### 2.8 Exception
- 先新增一個自定義的 UserNotFoundException
```java
public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String message) {
        super(message);
    }
}
```
- 再新增一個全域的 GlobalExceptionHandler
```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 處理 UserNotFoundException
    @ExceptionHandler(UserNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleUserNotFoundException(UserNotFoundException ex) {
        return new ErrorResponse("User not found", HttpStatus.NOT_FOUND.toString(), ex.getMessage());
    }

    // 處理參數驗證失敗 (例如 @Valid 的驗證)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleValidationException(MethodArgumentNotValidException ex) {
        // 提取所有錯誤訊息
        String errorMessage = ex.getBindingResult().getAllErrors().stream()
                .map(error -> error.getDefaultMessage())
                .findFirst()
                .orElse("Validation failed");
        return new ErrorResponse("Validation failed", HttpStatus.BAD_REQUEST.toString(), errorMessage);

    }

    // 處理 IllegalArgumentException 或其他自訂業務邏輯錯誤
    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleIllegalArgumentException(IllegalArgumentException ex) {
        return new ErrorResponse("Bad request", HttpStatus.BAD_REQUEST.toString(), ex.getMessage());
    }

    // 處理其他未預期的異常
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErrorResponse handleGenericException(Exception ex) {
        return new ErrorResponse("Internal server error", HttpStatus.INTERNAL_SERVER_ERROR.toString(), ex.getMessage());
    }

    // 定義統一的錯誤響應結構
    static class ErrorResponse {
        private String error;
        private String httpStatus;
        private String message;
        private String timestamp;

        public ErrorResponse(String error, String httpStatus, String message) {
            this.error = error;
            this.httpStatus = httpStatus;
            this.message = message;
            this.timestamp = java.time.LocalDateTime.now().toString(); // 增加時間戳
        }

        public String getError() {
            return error;
        }

        public String getHttpStatus() {
            return httpStatus;
        }

        public String getMessage() {
            return message;
        }

        public String getTimestamp() {
            return timestamp;
        }
    }
}
```
- 基本上到這樣，我們就有一個簡單的 Spring Boot 專案了，可以直接執行，並使用 Swagger 來測試 API。

## 三、單元測試（Unit Test）

接下來我們直接用實戰來看看如何撰測試以及其中常用到的 annotation 及 static method。    
我就用 Controller 的部分來做測試，其他的部分也可以參考這個方式。    
基本上就是大同小異了。

### 3.1 單元測試範例
```java
@SpringBootTest // 標註這是一個 Spring Boot 測試類，啟動完整的 Spring 應用上下文進行測試，適用於整合測試和模擬環境。
@AutoConfigureMockMvc // 自動配置 MockMvc，用於模擬 HTTP 請求和回應，無需啟動真實的伺服器。
public class UserControllerUnitTest {

    @Autowired // Spring 自動注入 MockMvc 實例，用於發送模擬的 HTTP 請求。
    private MockMvc mockMvc;

//    注意
//    在同一個測試類中同時使用 @MockBean 和 @Autowired 注入同一個類型的 Bean（例如 UserService），
//    會導致 測試中的行為不一致 或 出現衝突，
//    因為 Spring Boot 測試框架會優先使用 @MockBean 替換掉 Spring Context 中的該類型 Bean。

//    @MockBean // 注意這個 Annotation 已經在 SpringBoot 3.4.0 版本中被棄用，改用 @MockitoBean
    @MockitoBean// 使用 Mockito 模擬一個 Service 層的 Bean，將其注入到 Spring 測試上下文中。
    private UserService mockUserService;

    private User mockUser; // 用於測試的模擬數據，代表一個單一的 User 實例。
    private List<User> mockUsers; // 用於測試的模擬數據列表，代表多個 User 實例。

    @BeforeEach // 在每個測試方法執行之前執行，用於初始化測試所需的數據或狀態。
    public void setUp() {
        // 初始化單個模擬使用者
        mockUser = User.builder()
                .id(1L)
                .name("John Doe")
                .email("john.doe@example.com")
                .code("123")
                .build();

        // 初始化模擬使用者列表
        mockUsers = Arrays.asList(
                mockUser,
                User.builder().id(2L).name("Jane Smith").email("jane.smith@example.com").code("456").build()
        );

        // 使用 Mockito 模擬 Service 層的行為
        Mockito.when(mockUserService.getUserById(1L)).thenReturn(mockUser);
        Mockito.when(mockUserService.getAllUsers()).thenReturn(mockUsers);
    }

    @AfterEach // 在每個測試方法執行之後執行，用於清理測試環境或重置狀態。
    public void tearDown() {
        Mockito.reset(mockUserService); // 重置模擬對象，清除所有之前的行為模擬，確保不影響其他測試。
    }

    @Test // 標註這是一個測試方法，JUnit 會執行該方法進行測試。
    public void testGetUserById() throws Exception {
        // 構造一個模擬的使用者
        User mockUser = User.builder()
                .id(1L)
                .name("John Doe")
                .email("john.doe@example.com")
                .code("123")
                .build();

        // 模擬 Service 層的行為
        Mockito.when(mockUserService.getUserById(1L)).thenReturn(mockUser);

        // 使用 MockMvc 發送 GET 請求，並驗證返回結果
        mockMvc.perform(get("/users/1")) // 模擬對 "/users/1" 的 GET 請求
                .andExpect(status().isOk()) // 驗證返回狀態碼為 200 (OK)
                .andExpect(jsonPath("$.id").value(1L)) // 驗證 JSON 回應中的 id 為 1
                .andExpect(jsonPath("$.name").value("John Doe")) // 驗證 JSON 回應中的 name 為 "John Doe"
                .andExpect(jsonPath("$.email").value("john.doe@example.com")) // 驗證 JSON 回應中的 email 為 "john.doe@example.com"
                .andExpect(jsonPath("$.code").value("123")); // 驗證 JSON 回應中的 code 為 "123"
    }

    @Test // 標註這是一個測試方法，測試創建使用者時的輸入驗證。
    public void testCreateUserValidationError() throws Exception {
        // 使用 MockMvc 發送 POST 請求，測試缺少 email 時的錯誤
        mockMvc.perform(post("/users") // 模擬對 "/users" 的 POST 請求
                        .contentType("application/json") // 設定請求內容類型為 JSON
                        .content("{\"name\": \"Invalid User\"}")) // 傳遞不完整的 JSON 請求體
                .andExpect(status().isBadRequest()) // 驗證返回狀態碼為 400 (Bad Request)
                .andExpect(jsonPath("$.error").value("Validation failed")) // 驗證錯誤訊息
                .andExpect(jsonPath("$.message").value("Email is required")); // 驗證具體的錯誤內容
    }

    @Test // 標註這是一個測試方法，用於測試獲取所有使用者的功能。
    public void testGetAllUsers() throws Exception {
        // 準備模擬的使用者列表
        List<User> mockUsers = Arrays.asList(
                User.builder().id(1L).name("John Doe").email("john.doe@example.com").code("123").build(),
                User.builder().id(2L).name("Jane Smith").email("jane.smith@example.com").code("456").build()
        );

        // 模擬 Service 層的行為
        Mockito.when(mockUserService.getAllUsers()).thenReturn(mockUsers);

        // 使用 MockMvc 發送 GET 請求，並驗證返回結果
        mockMvc.perform(get("/users")) // 模擬對 "/users" 的 GET 請求
                .andExpect(status().isOk()) // 驗證返回狀態碼為 200 (OK)
                .andExpect(jsonPath("$[0].id").value(1L)) // 驗證第一個使用者的 id 為 1
                .andExpect(jsonPath("$[0].name").value("John Doe")) // 驗證第一個使用者的 name 為 "John Doe"
                .andExpect(jsonPath("$[1].id").value(2L)) // 驗證第二個使用者的 id 為 2
                .andExpect(jsonPath("$[1].name").value("Jane Smith")); // 驗證第二個使用者的 name 為 "Jane Smith"
    }

    @Test // 標註這是一個測試方法，用於測試創建新使用者的功能。
    public void testCreateUser() throws Exception {
        // 構造請求和回應對象
        CreateUserRequest createUserRequest = new CreateUserRequest("John Doe", "john.doe@example.com");
        User mockUser = User.builder()
                .id(1L)
                .name("John Doe")
                .email("john.doe@example.com")
                .code("123")
                .build();

        // 模擬 Service 層的行為
        Mockito.when(mockUserService.createUser(Mockito.any(CreateUserRequest.class))).thenReturn(mockUser);

        // 使用 MockMvc 發送 POST 請求，並驗證返回結果
        mockMvc.perform(post("/users") // 模擬對 "/users" 的 POST 請求
                        .contentType(MediaType.APPLICATION_JSON) // 設定請求內容類型為 JSON
                        .content(new ObjectMapper().writeValueAsString(createUserRequest))) // 傳遞 JSON 請求體
                .andExpect(status().isCreated()) // 驗證返回狀態碼為 201 (Created)
                .andExpect(jsonPath("$.id").value(1L)) // 驗證 JSON 回應中的 id 為 1
                .andExpect(jsonPath("$.name").value("John Doe")) // 驗證 JSON 回應中的 name 為 "John Doe"
                .andExpect(jsonPath("$.email").value("john.doe@example.com")) // 驗證 JSON 回應中的 email 為 "john.doe@example.com"
                .andExpect(jsonPath("$.code").value("123")); // 驗證 JSON 回應中的 code 為 "123"
    }
}
```

## 四、整合測試（Integration Test） 與 E2E REST API 測試說明

- 整合測試與 E2E REST API 測試在簡單的專案中，可能會讓人感到困惑，好像寫起來都差不多的感覺，但兩者所專注的點不太一樣。
- 在這邊我們就把兩種測試寫在一起就好，但定義還是要清楚一點，這樣溝通才不會有問題。

### 4.1 **差別**

| **特徵**              | **整合測試**                                          | **E2E RESTful 測試**                                   |
|-----------------------|-----------------------------------------------------|--------------------------------------------------|
| **測試範圍**          | 驗證多層邏輯（Controller → Service → Repository）。 | 驗證 Controller 層是否正確處理 HTTP 請求和回應。 |
| **數據來源**          | 使用真實資料庫（如 H2）。                           | 使用模擬數據（通過 `@MockBean`）。               |
| **依賴的 Bean**       | 真實的 Service 和 Repository。                     | 模擬的 Service 和 Repository。                  |
| **測試目標**          | 驗證系統內部層與層之間的協作。                      | 驗證 API 的 HTTP 行為是否符合規範。              |
| **性能**             | 稍慢，需要初始化資料庫和整個應用上下文。              | 更快，因為不依賴資料庫和完整的應用上下文。        |
| **使用場景**          | 測試資料庫邏輯、業務流程的整合性。                  | 測試 API 是否符合設計（狀態碼、回應格式等）。     |

### 4.2 **相似之處**

| **特徵**              | **整合測試**            | **E2E RESTful 測試**         |
|-----------------------|-------------------------|--------------------------|
| **工具相同**          | 使用 MockMvc。           | 使用 MockMvc。            |
| **驗證 HTTP 層行為**  | 驗證請求的輸入與回應輸出。 | 驗證請求的輸入與回應輸出。 |
| **測試方法結構類似**  | 驗證 HTTP 狀態碼、JSON 格式等 | 驗證 HTTP 狀態碼、JSON 格式等 |


### 4.2 整合測試與 E2E REST API 測試範例
```java
@SpringBootTest // 標註為 Spring Boot 測試類，啟動完整的 Spring 應用上下文進行測試，適用於整合測試。
@AutoConfigureMockMvc // 自動配置 MockMvc，用於模擬 HTTP 請求和回應，無需啟動真實的伺服器。
@Sql(scripts = "/sql/test-data.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD) // 在每個測試方法之前執行 SQL 腳本，初始化測試數據。
@Sql(scripts = "/sql/cleanup.sql", executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)  // 在每個測試方法之後執行 SQL 腳本，清理測試數據。
public class UserControllerIntegrationTest {

    @Autowired // 自動注入 MockMvc 實例，用於模擬 HTTP 請求和回應。
    private MockMvc mockMvc;

    @Test // 標註這是一個測試方法，由 JUnit 運行。
    public void testCreateAndGetUsers() throws Exception {
        // 創建使用者
        mockMvc.perform(post("/users") // 模擬對 "/users" 的 POST 請求，用於創建使用者。
                        .contentType("application/json") // 設置請求內容類型為 JSON。
                        .content("{\"name\": \"Test User\", \"email\": \"test@example.com\"}")) // 提供 JSON 格式的請求體。
                .andDo(print()) // 打印請求與回應的詳細內容，用於調試。
                .andExpect(status().isCreated()); // 驗證返回的 HTTP 狀態碼是否為 201 (Created)。

        // 查詢所有使用者，驗證創建的使用者是否存在
        mockMvc.perform(get("/users")) // 模擬對 "/users" 的 GET 請求，用於查詢所有使用者。
                .andExpect(status().isOk()) // 驗證返回的 HTTP 狀態碼是否為 200 (OK)。
                .andExpect(jsonPath("$[*].name").value(org.hamcrest.Matchers.hasItem("Test User"))) // 驗證返回的 JSON 包含指定的 name。
                .andExpect(jsonPath("$[*].email").value(org.hamcrest.Matchers.hasItem("test@example.com"))); // 驗證返回的 JSON 包含指定的 email。
    }

    @ParameterizedTest // 標註這是一個參數化測試方法，允許使用多組測試數據重複執行測試。
    @MethodSource("provideCreateUserData") // 指定測試數據來自名為 "provideCreateUserData" 的靜態方法。
    public void testCreateUserWithMethodSource(String name, String email, String errorType) throws Exception {
        var request = "{\"name\": \"" + name + "\", \"email\": \"" + email + "\"}"; // 創建 JSON 格式的請求數據。

        switch (errorType) {
            case "invalid": // 測試無效數據
                mockMvc.perform(post("/users")
                                .contentType("application/json")
                                .content(request))
                        .andDo(print())
                        .andExpect(status().isBadRequest()) // 驗證返回狀態碼為 400 (Bad Request)。
                        .andExpect(jsonPath("$.error").value("Validation failed")); // 驗證錯誤訊息。
                break;

            case "duplicate": // 測試重複數據
                mockMvc.perform(post("/users")
                                .contentType("application/json")
                                .content(request))
                        .andDo(print())
                        .andExpect(status().isBadRequest()) // 驗證返回狀態碼為 400。
                        .andExpect(jsonPath("$.message").value("Email already exists: " + email)); // 驗證錯誤訊息。
                break;

            case "work": // 測試有效數據
                mockMvc.perform(post("/users")
                                .contentType("application/json")
                                .content(request))
                        .andDo(print())
                        .andExpect(status().isCreated()) // 驗證返回狀態碼為 201 (Created)。
                        .andExpect(jsonPath("$.name").value(name)) // 驗證返回的 JSON 包含指定的 name。
                        .andExpect(jsonPath("$.email").value(email)); // 驗證返回的 JSON 包含指定的 email。
                break;

            default:
                throw new IllegalArgumentException("Invalid error type: " + errorType); // 對於未定義的錯誤類型，拋出異常。
        }
    }

    private static Stream<Arguments> provideCreateUserData() {
        // 提供參數化測試數據，每組數據包含 name、email 和 errorType。
        return Stream.of(
                Arguments.of("John", "john@example.com", "work"), // 有效數據
                Arguments.of("A", "short@example.com", "invalid"), // 名字太短
                Arguments.of("John", "invalidemail@", "invalid"), // 無效 Email
                Arguments.of("John", "john.doe@example.com", "duplicate") // 重複 Email
        );
    }

    @ParameterizedTest // 標註這是一個參數化測試方法。
    @CsvSource({ // 使用 CSV 格式提供參數化測試數據。
            "John, john@example.com, work",          // 有效數據
            "A, short@example.com, invalid",         // 名字太短
            "John, invalidemail@, invalid",          // 無效 Email
            "John, john.doe@example.com, duplicate"  // 重複 Email
    })
    public void testCreateUserWithCsvSource(String name, String email, String errorType) throws Exception {
        var request = "{\"name\": \"" + name + "\", \"email\": \"" + email + "\"}"; // 創建 JSON 格式的請求數據。

        switch (errorType) {
            case "invalid": // 測試無效數據
                mockMvc.perform(post("/users")
                                .contentType("application/json")
                                .content(request))
                        .andDo(print())
                        .andExpect(status().isBadRequest()) // 驗證返回狀態碼為 400。
                        .andExpect(jsonPath("$.error").value("Validation failed")); // 驗證錯誤訊息。
                break;

            case "duplicate": // 測試重複數據
                mockMvc.perform(post("/users")
                                .contentType("application/json")
                                .content(request))
                        .andDo(print())
                        .andExpect(status().isBadRequest()) // 驗證返回狀態碼為 400。
                        .andExpect(jsonPath("$.message").value("Email already exists: " + email)); // 驗證錯誤訊息。
                break;

            case "work": // 測試有效數據
                mockMvc.perform(post("/users")
                                .contentType("application/json")
                                .content(request))
                        .andDo(print())
                        .andExpect(status().isCreated()) // 驗證返回狀態碼為 201 (Created)。
                        .andExpect(jsonPath("$.name").value(name)) // 驗證返回的 JSON 包含指定的 name。
                        .andExpect(jsonPath("$.email").value(email)); // 驗證返回的 JSON 包含指定的 email。
                break;

            default:
                throw new IllegalArgumentException("Invalid error type: " + errorType); // 對於未定義的錯誤類型，拋出異常。
        }
    }
}
```

### 4.4 Mock 與 Real Service 比較

如上面提到的，在同一個測試類中同時使用 @MockBean 和 @Autowired 注入同一個類型的 Bean（例如 UserService），會導致 測試中的行為不一致 或 出現衝突，因為 Spring Boot 測試框架會優先使用 @MockBean 替換掉 Spring Context 中的該類型 Bean。    
那我們甚麼時候要用 @MockBean 製作假的 Service，什麼時候要用 @Autowired 來注入真實的 Service 呢？

| **項目**            | **@MockBean**                                      | **@Autowired**                                   |
|---------------------|---------------------------------------------------|-------------------------------------------------|
| **適用情境**         | 單元測試，專注於測試單一層，如 Controller 或 Service | 整合測試，驗證多層邏輯（如 Controller → Service → Repository） |
| **特性與效果**       | 使用 Mockito 模擬對象替換 Spring Context 中的 Bean | 注入真實的 Spring Bean，執行真實的業務邏輯        |
| **注入的對象**       | 模擬對象，完全可控                                  | 真實對象，執行真實邏輯                            |
| **適用範圍**         | 單一層（如 Controller 或 Service）                  | 多層協作（如 Controller → Service → Repository） |
| **性能**            | 更快（不依賴資料庫或其他外部資源）                   | 較慢（需要初始化完整的應用上下文和資料庫）         |
| **控制能力**         | 可以完全控制依賴的行為（如模擬異常或返回值）          | 無法控制依賴行為，依賴真實邏輯                   |


## 六、資料庫測試的最佳實踐

### 6.1 測試資料的準備與管理
- Flyway 這個我另外再寫一篇來補吧，這邊就先簡單提一下。
- Flyway 是一個專注於資料庫版本控制的工具，提供一種簡單且高效的方式來管理資料庫結構和資料變更。在專案開發中，資料庫結構經常需要隨著功能需求的變化進行更新，而 Flyway 能夠幫助開發團隊：
  - 追蹤和管理資料庫結構的變更。
  - 保證不同環境之間資料庫結構的一致性。
  - 自動化資料庫遷移，減少人為錯誤。
- 在專案測試中，Flyway 也可以用於初始化測試資料庫，以資料庫版本管理、資料的初始化和清理等功能，幫助開發團隊更好地進行資料庫測試。

### 6.2 資料一致性與回滾策略
- 在測試的方法上面，加上 @Transactional，主要目的是為每個測試方法開啟一個新的事務，並在測試結束後，無論結果是否出現異常，都會回滾（rollback），以保證測試環境的資料庫狀態不會受到污染。
- @Transactional 可以加在整個測試類上，也可以加在單個測試方法上。
- 例如：
```java
@SpringBootTest
@Transactional
public class UserServiceIntegrationTest {
    // 測試方法
}
```

### 6.3 Testcontainers 的應用
- 這個篇幅也會不小，也是另外再寫一篇來補吧。

<!-- ## 九、Spring Security 測試
### 9.1 認證與授權邏輯測試
- 使用 @WithMockUser 模擬使用者

### 9.2 測試 OAuth2 與 JWT
- 驗證保護資源的訪問權限 -->

## 七、效能測試與自動化
### 7.1 測試覆蓋率分析
- 使用 Jacoco 生成測試覆蓋率報告
- 在 pom.xml 中加入以下設定
```xml
    <plugins>
        <!-- 其他插件 -->
        <plugin>
            <groupId>org.jacoco</groupId>
            <artifactId>jacoco-maven-plugin</artifactId>
            <version>0.8.10</version> <!-- 確保使用最新版 -->
            <executions>
                <execution>
                    <goals>
                        <goal>prepare-agent</goal>
                    </goals>
                </execution>
                <execution>
                    <id>report</id>
                    <phase>verify</phase>
                    <goals>
                        <goal>report</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
        <plugin>
            <groupId>org.jacoco</groupId>
            <artifactId>jacoco-maven-plugin</artifactId>
            <version>0.8.10</version>
            <configuration>
                <outputDirectory>${project.build.directory}/jacoco-report</outputDirectory>
            </configuration>
        </plugin>
    </plugins>
```
- 執行 `mvn clean verify` 生成測試覆蓋率報告
- 經握以上設定，跑完 `mvn clean verify` 後，會在 target > jacoco-report 資料夾下生成測試覆蓋率報告 index.html

### 7.2 測試自動化配置
- 這個相關內容也是很多，之後再寫一篇補上吧。

<!-- ## 十一、測試最佳實踐
### 11.1 測試代碼風格與命名慣例
- 提高代碼可讀性的方法

### 11.2 測試覆蓋率監控
- 常見工具與監控策略

### 11.3 測試代碼的重構與維護
- 減少技術負債的實踐

## 十二、實戰範例與優化
### 12.1 完整測試專案範例
- 真實業務場景的測試案例

### 12.2 測試報告的生成與分析
- 提供可操作的改進建議

### 12.3 測試流程的持續優化
- 持續集成與部署中的測試改進 -->

## 結語
- 相關的測試技術有有很多，之後有遇到，我再補上吧，以上就是 Spring Boot 測試常用到的東西，希望有幫助。
