---
title: "前後端多 Repo 架構實戰：Module Federation 組裝前端，FeignClient 打通模組化單體後端"
date: "2026-06-17"
category: "Architecture"
tags: ["Spring Boot", "OpenFeign", "Module Federation", "Angular", "Microservices", "CI/CD"]
summary: "記錄一次多 Repo 架構 POC：前端用 Webpack 5 Module Federation 在 runtime 組裝多個 Angular app，後端用 Modular Monolith + Spring Cloud OpenFeign 解決模組間循環依賴，最終仍交付單一 fat JAR。"
published: true
---

## 為什麼要拆多 Repo

專案要跟外部團隊合作，對方只能看到、用到特定範圍的程式碼，不能把整個專案暴露出去，所以後端、前端都必須拆成多個獨立 repo。但交付端的要求沒變：後端最終要組裝成單一 fat JAR 部署，前端則是多包靜態資源丟在同一個 Nginx 上。開發期間也希望前端能跨 repo 直接整合測試，不用每次都等別人發版。

這帶出三個核心挑戰：

- 前端多個 Angular app 要共享元件、共享狀態，但各自獨立部署
- 後端多個 Spring Boot 服務要互相呼叫，但不能用 Maven compile-time dependency 直接引入（會循環依賴）
- 跨服務的請求要能串起來追蹤，方便 debug

**先講結論：這次選的 Modular Monolith 不是過渡到微服務的中間站，是要長期用下去的目標架構。** 唯一的理由是交付時就只能有一個 JAR——FeignClient 模式順便保留了「以後真要拆成微服務，業務邏輯零改動」的彈性，但那只是附帶好處，不是現在的路線圖。

```
GitLab Group
  shell（組裝層）：backend/（JWT 認證、模組組裝、CORS）＋ frontend/（Host, 4200）
  feature-a：backend/（domain 邏輯，發布 JAR 到 Nexus）＋ frontend/（Remote, 4201）
  feature-b：backend/（domain 邏輯，發布 JAR 到 Nexus）＋ frontend/（Remote, 4202）
  shared：backend/ → 共用 DTO（JAR）／frontend/ → 共用元件（Angular library）
        ↓ 依賴 / import
      Nexus（maven-snapshots/releases、npm-group/registry）
        ↓
shell fat JAR（單一部署單位，port 8080）
  ├── feature-a module → Controller → GET /api/v1/xxx ←──┐ HTTP（localhost）
  └── feature-b module → XxxClient（@FeignClient）────────┘
前端 Host（4200）動態載入 feature-a remote（4201）+ feature-b remote（4202）
```

每個 feature repo 內部同時放 `backend/` 跟 `frontend/`，因為團隊是全端制、按功能垂直切分，不是前後端分組。

---

## 前端多 Repo：Webpack 5 Module Federation

Module Federation 是 Webpack 5 的原生功能，讓多個獨立打包的應用在 **runtime** 動態載入彼此的模組，不需要在 build time 就把所有東西打包在一起。

角色分三種：

- **Host**：主應用，負責載入其他模組
- **Remote**：子應用，把自己的模組暴露給 Host 用
- **Shared**：雙方共用的套件（如 Angular core），避免重複打包

```javascript
// webpack.config.js（Remote 端）
new ModuleFederationPlugin({
  name: 'remoteApp',
  filename: 'remoteEntry.js',
  exposes: {
    './Component': './src/app/some/component',
  },
  shared: {
    '@angular/core': { singleton: true }, // Host/Remote 間只會有一個實例
    '@angular/common': { singleton: true },
  },
})

// webpack.config.js（Host 端）
new ModuleFederationPlugin({
  remotes: {
    remoteApp: 'remoteApp@http://localhost:4201/remoteEntry.js',
  },
  shared: { ... },
})
```

`singleton: true` 對 Angular 是必要設定，不然 Host 和 Remote 各自跑一份 Angular，DI 系統直接壞掉。Remote URL 在不同環境會換成實際部署位址，抽到 `environment.ts`，Host 端透過 `DefinePlugin` 注入。

**還沒解決的問題**：多個 Feature Team 各自獨立發布 Remote 時，Host 跟所有 Remote 的 Angular 版本相容性要有人盯著——目前靠前後端都各自維護的 `shared` library 統一版本定義，但「consumer 有沒有真的升級」還是人工決定，沒有強制機制。

---

## 後端多 Repo：為什麼選 Modular Monolith

想到後端要多 repo，第一直覺是拆成微服務加 API Gateway。但交付要求是單一 fat JAR，所以這次先不拆真微服務，改用 **Modular Monolith**：每個後端模組仍是獨立 repo、獨立開發、獨立 CI，但最終組裝成一個 fat JAR 共同部署，模組之間透過 FeignClient 打 HTTP（同一個 JVM 內的 `localhost` 呼叫，仍會走 DispatcherServlet），不是直接 inject Java bean。

| 架構 | 核心概念 | 這次為什麼沒選 / 選了 |
|---|---|---|
| 傳統單體 | 所有功能綁一個專案部署 | 模組邊界會混在一起，多團隊協作不適合 |
| **模組化單體** | 邏輯上拆模組，部署仍是一個服務 | **選了**——滿足單一 JAR 的交付要求，同時保留模組獨立開發 |
| 微服務 | 物理獨立、各自部署 | 沒有獨立部署/擴展的真實需求，維運成本不值得 |
| 事件驅動 | 透過事件非同步溝通 | 這裡是同步查詢場景，不需要 eventual consistency |
| 六角/乾淨架構 | 核心邏輯與外部技術解耦 | 不是這次要解決的分層問題 |

「REST + `@FeignClient` interface」驗證的是**通訊介面的定義方式**，不要求模組必須跑在不同 process。`@FeignClient` interface 本身就是提供方與消費方共同遵守的介面定義，可以放進共用的 contracts library，雙方都參照同一份。

**取捨：**
- 比起直接 inject Java bean，多了一層 HTTP overhead，量級在 1–5ms（這是估計值，還沒做正式 load test），一般業務場景可接受
- 比起真微服務，少了獨立部署/擴縮的彈性，換來更低的維運複雜度
- 各模組各自有獨立 repo / CI / 版本號，多 repo 開發協作模式是真的驗證到了；只有「部署」這一層收斂成單一 process

### FeignClient 基本寫法

```java
@FeignClient(name = "service-b", url = "${service-b.url}")
public interface ServiceBClient {

    @GetMapping("/api/resource/{id}")
    ResourceDto getResource(@PathVariable String id);
}
```

```java
// 使用端直接注入 interface
@Service
public class ServiceALogic {

    private final ServiceBClient serviceBClient;

    public void doSomething(String id) {
        ResourceDto resource = serviceBClient.getResource(id);
    }
}
```

設定步驟：加 `spring-cloud-starter-openfeign` dependency → 主類加 `@EnableFeignClients` → 定義 `@FeignClient` interface → `application.yml` 設定 target URL。記得搭配 Spring Cloud BOM 管理版本，錯誤處理建議用 `ErrorDecoder` 統一處理 4xx/5xx。

---

## 兩個實際踩過的坑

### 坑①：回應物件反序列化失敗

跨模組共用的回應包裝物件（例如 `ApiResponse<T>`）一開始用一般 getter/setter 寫法，FeignClient 收到回應後 Jackson 反序列化不出來。

```java
// 加上 @JsonCreator + 建構子參數的 @JsonProperty
public class ApiResponse<T> {

    private final int code;
    private final T data;

    @JsonCreator
    public ApiResponse(@JsonProperty("code") int code, @JsonProperty("data") T data) {
        this.code = code;
        this.data = data;
    }
    // getters...
}
```

明確告訴 Jackson 怎麼從 JSON 建構物件，不能依賴預設的無參建構子 + setter。

### 坑②：JWT Authorization header 沒有跟著 Feign 呼叫傳遞

原本的 JWT `Authorization` header 只存在於原始 request，FeignClient 發出的是一個全新的 HTTP request，不會自動帶上原 request 的 header，下游模組收到請求後認證失敗。

```java
@Component
public class FeignAuthInterceptor implements RequestInterceptor {

    @Override
    public void apply(RequestTemplate template) {
        ServletRequestAttributes attrs =
            (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs != null) {
            String authHeader = attrs.getRequest().getHeader("Authorization");
            if (authHeader != null) {
                template.header("Authorization", authHeader);
            }
        }
    }
}
```

從目前 request context 取出 `Authorization` header，手動加到每個 Feign 呼叫上。**目前還沒解的情境**：這個機制依賴「呼叫鏈裡有原始使用者 request」，如果呼叫是排程或非同步觸發、沒有原始 request context，目前沒有對應的服務間認證設計。

---

## 分散式追蹤：MDC + X-Correlation-ID

多個服務各自記 log，出事時無法把同一個 request 在不同服務的 log 串起來。

```java
// Filter：收到 request 時，取出或產生 Correlation ID，存入 MDC
@Component
public class CorrelationIdFilter extends OncePerRequestFilter {

    private static final String CORRELATION_ID_HEADER = "X-Correlation-ID";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String correlationId = request.getHeader(CORRELATION_ID_HEADER);
        if (correlationId == null || correlationId.isBlank()) {
            correlationId = UUID.randomUUID().toString();
        }

        MDC.put("correlationId", correlationId);
        response.setHeader(CORRELATION_ID_HEADER, correlationId);

        try {
            filterChain.doFilter(request, response);
        } finally {
            MDC.remove("correlationId");
        }
    }
}
```

```java
// FeignClient RequestInterceptor：呼叫下游服務時把 ID 帶過去
@Component
public class FeignCorrelationIdInterceptor implements RequestInterceptor {

    @Override
    public void apply(RequestTemplate template) {
        String correlationId = MDC.get("correlationId");
        if (correlationId != null) {
            template.header("X-Correlation-ID", correlationId);
        }
    }
}
```

`logback-spring.xml` 的 pattern 加上 `%X{correlationId}`，log 裡就能看到串接的 ID：

```xml
<pattern>%d{yyyy-MM-dd HH:mm:ss} [%X{correlationId}] %-5level %logger{36} - %msg%n</pattern>
```

**還沒踩到的坑**：MDC 是 thread-local，非同步（`@Async`、reactive）情境需要額外處理傳遞，目前還沒有解法。這次 POC 模組間呼叫都在同一個 fat JAR 的 in-process HTTP（localhost），還沒真正拆成多個獨立 process，所以「Correlation ID 真的需要跨網路傳遞」這個情境也還沒被驗證到。

---

## CI/CD 階段設計

後端模組 repo（library JAR，發布到 Nexus）：

```yaml
stages:
  - build
  - publish-snapshot   # develop branch → SNAPSHOT
  - publish-rc         # release/* branch → RC
  - publish-release    # production branch → RELEASE
```

組裝層 repo（fat JAR + 前端，部署到環境）：

```yaml
stages:
  - build
  - deploy-sit          # develop branch → 自動部署 SIT
  - deploy-uat          # release/* branch → 手動核准部署 UAT
  - deploy-production   # production branch → 手動核准部署 PROD
```

**老實說目前的限制**：`deploy-sit` / `deploy-uat` / `deploy-production` 的 `script` 還是 `echo` 模擬指令，原因是 **SIT/UAT/PROD 環境本身還沒建好**，不是部署機制沒設計——stage 跟 branch 觸發規則的邏輯已經能用 branch 對應規則驗證，只是還沒有真實環境可以接上去跑。

---

## 已驗證 vs 還沒驗證

| 驗證點 | 狀態 |
|---|---|
| 多 repo 各自開發、各自 CI | ✅ 已驗證 |
| 前端跨 repo 整合（Module Federation） | ✅ 已驗證 |
| 共用 library 版本管理（Nexus） | ✅ 已驗證 |
| 後端跨 repo 呼叫（FeignClient） | ⚠️ 部分驗證——同一 fat JAR 內的 HTTP，還不是真正跨 process |
| 分散式追蹤跨網路傳遞 | ❌ 還沒驗證 |
| 真實環境部署 | ❌ 還沒驗證 |
| 跨模組契約自動化防呆（如 contract testing） | ❌ 還沒做，目前靠人工同步 |

這套架構不是為了把系統切得多炫，而是在「外部團隊權限隔離」「單一 JAR 交付」「跨 repo 開發便利性」三個現實限制中找一個都顧到的解法。Modular Monolith + FeignClient 剛好卡在這個交集上：多 repo 開發體驗有了，循環依賴解了，部署複雜度沒有暴增。代價是還留了幾個沒解的坑——容錯機制（circuit breaker）、契約自動化驗證、真實多 process 部署——這些等實際排上日程再補。
