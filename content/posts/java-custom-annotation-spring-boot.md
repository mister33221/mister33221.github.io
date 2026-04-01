---
title: "[Java]Customize Annotation In Spring Boot"
date: "2026-03-24"
category: "Tool"
tags: ["Git"]
summary: "平常很常使用 Spring boot 提供給我們的 Annotation，實在是有夠方便。"
published: true
---

#  [Java]Customize Annotation In Spring Boot

平常很常使用 Spring boot 提供給我們的 Annotation，實在是有夠方便。
如果也可以自己做一些 Annotation，就可以幫我做完一堆事情，感覺就很潮!
那到底該怎麼做呢?

## 情境

這邊我用 JWT 當作一個情境，
當我以下兩隻 API，

```java
@GetMapping("/generate-token")
public String generateToken() {
    return jwtUtil.generateToken("user123");
}

@GetMapping("/protected-resource")
public String protectedResource() {
    return "This is a protected resource";
}
```

而我想要產生一個 token 時，我希望不要驗證我有沒有 token (啊我就要產生，你還要驗證我幹嘛!!)，
而當我要存取 protected-resource 時，我希望我有 token 才能存取。

那麼這兩隻的 API 需求就不一樣，
如果我使用 OncePerRequestFilter 來做的話，那麼所有的 Request 都會被抓去驗證。

有沒有辦法在我需要被驗證的 API 上面加上一個特定 Annotation，他就會需要驗證 token才可以存取，而不需要被驗證的 API 不加這個特定的 Annotation 就不會被驗證。

## 測試專案

1. 先把我的 [專案](https://github.com/mister33221/customize-annotation-practice.git) clone 下來。
直接給他跑起來!

2. 然後在瀏覽器出入 `http://localhost:8080/swagger-ui.html` 來開啟我們的 Swagger UI。

3. 第一步直接點擊 `protected-resource` 這個 API，會發現我們沒有 token，所以會被拒絕存取。

4. 那我們就來使用 `generate-token` 產生一個 token，

5. 把這個 token 複製下來，然後到右上角，會看到一個 `Authorize` 的按鈕，點進去之後，把 token 貼上去，然後按下 `Authorize`。
這樣我們就會在接下來的 Request 的 Header 裡面帶上一個叫做 `Authorization` 的 Header，裡面的值就是我們剛剛貼上去的 token。

6. 接著我們就可以使用 `protected-resource` 來存取我們的資源。


## 實作

其實我在每一個 class 裡面都已經寫了非常詳細該怎麼自己製作 Annotation，所以 README 裡面我就不寫得太詳細囉!

我甚至也順便把 OpenApi Swagger 的也寫了!

有興趣的就到我的 github [專案](https://github.com/mister33221/customize-annotation-practice.git) 看看吧!

主要的程式碼如下

- RequireJwt
```java
/*
@Target註解指定了RequireJwt註解可以應用的Java元素類型。
在這個例子中，它被設置為ElementType.METHOD，
這意味著RequireJwt註解只能被應用於方法上。
ElementType是一個枚舉，它還包括了其他值，
如TYPE（可以應用於類或接口）、FIELD（可以應用於字段）等。
 */
/*
@Retention註解指定了RequireJwt註解的保留策略，
即這個註解在什麼時候有效。在這個例子中，
它被設置為RetentionPolicy.RUNTIME，
這意味著RequireJwt註解將在運行時保留，
因此可以通過反射在運行時被訪問。
其他的RetentionPolicy值包括
SOURCE（註解只在源碼中保留，並在編譯時被丟棄）和
CLASS（註解在編譯時被保留，但在運行時不可用）。
 */
/*
interface
是用來定義一個介面，裡面可以包含方法、屬性、類等等。可以實作，也可以不實作，
別的物件可以 implements 這個介面，然後實作裡面的方法。
@interface
是專門用來定義 Annotation 的，
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireJwt {
}

/*
當你在寫 Annotation 的時候，有些 Annotation 可以填入一些參數來讓使用者可以自定義某些行為。
不過在我們的範例裡面沒有用到，所以才是空白的。

我們可以定義以下這些東西來讓使用者可以自定義 Annotation 的行為：
基本類型：如int, float, boolean等。
String：字符串類型。
Class：類字面量，如MyClass.class。
枚舉：枚舉類型的值。
註解：其他註解。
以上類型的數組：例如int[], String[], MyEnum[]等。

以下是一個範例

// 定義一個枚舉類型作為註解的一部分
enum Status {
    ACTIVE, INACTIVE, PENDING
}

// 定義另一個註解類型作為註解的一部分
@interface AdditionalInfo {
    String description() default "No description";
}

// 定義ComplexAnnotation註解
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE) // 假設這個註解是用於類型上
public @interface ComplexAnnotation {
    // 基本類型
    int intValue() default 0;
    float floatValue() default 0.0f;
    boolean booleanValue() default true;

    // String
    String stringValue() default "Default";

    // Class
    Class<?> classValue() default Object.class;

    // 枚舉
    Status statusValue() default Status.ACTIVE;

    // 註解
    AdditionalInfo additionalInfo() default @AdditionalInfo;

    // 以上類型的數組
    int[] intArray() default {};
    String[] stringArray() default {};
    Status[] statusArray() default {};
    Class<?>[] classArray() default {};
}

而當別人要使用這個 Annotation 的時候，可以這樣使用：

// 假設有一個類，用於演示如何使用ComplexAnnotation註解
@ComplexAnnotation(
    intValue = 10,
    floatValue = 5.5f,
    booleanValue = true,
    stringValue = "Example",
    classValue = MyClass.class,
    statusValue = Status.ACTIVE,
    additionalInfo = @AdditionalInfo(description = "This is an example class"),
    intArray = {1, 2, 3},
    stringArray = {"one", "two", "three"},
    statusArray = {Status.ACTIVE, Status.INACTIVE},
    classArray = {MyClass.class, YourClass.class}
)
public class MyClass {
    // 類的實現細節
}
 */
```

- WebMvcConfig
```java
/*
WebMvcConfigurer 它提供了一系列的回調方法（callback methods），
允許開發者對 Spring MVC 的配置進行細微的調整和擴展，
而不需要完全替換或修改現有的配置。

配置視圖解析器 (configureViewResolvers): 允許開發者自定義視圖解析的方式，從而控制如何將視圖名稱映射到具體的視圖實現上。
添加靜態資源處理器 (addResourceHandlers): 用於指定靜態資源的位置和如何處理它們，例如圖片、CSS 和 JavaScript 文件。
添加攔截器 (addInterceptors): 提供了一種方式來添加自定義攔截器，這些攔截器可以在請求處理之前或之後執行特定的操作。
配置跨域請求 (addCorsMappings): 允許為應用配置跨源資源共享（CORS）策略，從而控制哪些跨域請求是被允許的。
配置內容協商 (configureContentNegotiation): 使開發者能夠自定義內容協商的策略，以支援不同的媒體類型。
添加格式化器和轉換器 (addFormatters): 允許添加自定義的格式化器和轉換器，用於數據綁定和類型轉換。
配置異步支持 (configureAsyncSupport): 提供了配置異步請求處理的選項，例如設置默認的超時時間或自定義 Callable 和 DeferredResult 的處理方式。
 */
@Configuration
@AllArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private JwtInterceptor jwtInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
//        把我們自製的攔截器加入到攔截器鏈中
        registry.addInterceptor(jwtInterceptor);
    }
}
```

- JwtInterceptor
```java
/*
HandlerInterceptor接口用於攔截處理器的執行。
可以在控制器（Controller）處理請求之前、之後以及完成請求處理後（即渲染視圖之後）進行自定義的操作。
這對於實現如日誌記錄、身份驗證、授權等跨切面功能非常有用。

HandlerInterceptor接口定義了三個方法：

preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)：
在控制器處理請求之前調用。如果返回true，則繼續向下執行（到下一個攔截器或處理器）；如果返回false，則中斷執行流程。
postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView)：
在控制器處理請求之後、渲染視圖之前調用。
afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex)：
在完成請求處理後調用，這時可以進行資源清理等操作。
 */
@Component
@AllArgsConstructor
public class JwtInterceptor implements HandlerInterceptor {

    private JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
/*
這邊在確認 handler Object 是否是 HandlerMethod 的 instance，
但為什麼要做這樣的確認?
因為 HandlerMethod 是一個 Spring MVC 的類別，
它包含了一個方法的所有資訊，包括方法名稱、參數、返回值等等。
如果 handler 不是 HandlerMethod 的 instance，
那就代表這個請求可能不是映射到Controller中的一個方法，
而是其他類型的請求（例如對靜態資源的請求），則直接返回true，
表示不對這類請求進行後續的攔截處理。
 */
        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }
/*
從 handlerMethod 中取得方法上的 RequireJwt annotation，
 */
        RequireJwt requireJwt = handlerMethod.getMethodAnnotation(RequireJwt.class);

        if (requireJwt != null) {
//            從 Headers 中取得 Authorization 的值
            String token = request.getHeader("Authorization");
//            如果 Authorization 的值不存在或不是以 Bearer 開頭，則回傳 401
            if (token == null || !token.startsWith("Bearer ")) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "No JWT token found in request headers");
                return false;
            }

//            取得 token 的值，去掉 Bearer 字串並對其進行各種驗證
            token = token.substring(7);
            if (!jwtUtil.validateToken(token)) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid JWT token");
                return false;
            }
        }

        return true;
    }
}
```

- ApiController
```java
@GetMapping("/protected-resource")
@RequireJwt
public String protectedResource() {
    return "This is a protected resource";
}

@GetMapping("/generate-token")
public String generateToken() {
    return jwtUtil.generateToken("user123");
}
```
