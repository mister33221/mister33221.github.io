---
title: "三層微服務的 JWT 分層認證：每個邊界都用自己的 Token"
date: "2026-03-30"
category: "Backend"
tags: ["JWT", "Spring Boot", "Security", "Microservices", "OpenFeign"]
summary: "記錄在三層微服務架構中，如何設計三套獨立的 JWT（Channel / Query-API / External API），以及為什麼 Query-API 作為共享服務必須有自己的認證機制，不能直接信任上游的 token。"
published: true
---

## 先釐清架構關係

這個系統的服務邊界：

```
Channel（Web-Backend）         ← 獨立服務，有自己的前端與業務邏輯
    ↓ 呼叫
Traffic-Controller             ┐
    ↓ 轉發                     ├── 強耦合，同機部署
Query-API                      ┘

其他上游系統 A ────────────────┐
其他上游系統 B ────────────────┤→ Traffic-Controller → Query-API
其他上游系統 C ────────────────┘
```

**Channel 是外部獨立服務**，它有自己的前端、自己的業務邏輯、自己的 JWT 機制。Query-API + Traffic-Controller 是強耦合的組合，同機部署，對外提供共享的查詢能力。

---

## 為什麼 Query-API 不能直接信任上游的 token

Query-API 被設計成**可供多個不同上游系統使用的共享查詢服務**，不是只服務 Channel 一個呼叫方。

這帶來一個根本問題：**每個上游系統都有自己的 JWT 格式和 secret**。

如果 Query-API 直接驗 Channel 的 token：
- 它就必須持有 Channel 的 JWT secret
- 當上游系統 B、C 也要接進來，Query-API 就要再持有 B、C 的 secret
- 每新增一個上游，Query-API 就要改一次驗證邏輯

這樣 Query-API 就和每個上游系統緊密耦合了，完全不符合「共享服務」的定位。

**正確的設計是**：Query-API 定義自己的 JWT 規格（`queryApiSecret`），任何想呼叫它的上游系統，都必須在呼叫前把自己的 token **轉換**成 Query-API JWT，Query-API 只驗自己認識的格式。

```
上游系統 A（用自己的 JWT）
    ↓ 轉換成 Query-API JWT
Query-API 驗 Query-API JWT ← 只要維護一套驗證邏輯

上游系統 B（用自己的 JWT）
    ↓ 轉換成 Query-API JWT
Query-API 驗 Query-API JWT ← 同一套，不需要改
```

---

## 三套 JWT 各自的角色

```
前端 / 外部平台
      ↓ Channel JWT (HS512)
Channel（Web-Backend）  ← 獨立服務，自己管自己的認證
      ↓ FeignClientInterceptor 轉換成 Query-API JWT
Traffic-Controller      ← 透傳（不驗、只 log）
      ↓
Query-API ──── 來自各上游系統 → @JwtValidation（Query-API JWT）
         └──── 外部直接呼叫  → @ExternalJwtValidation（External JWT）
```

| JWT | 用途 | 誰簽發 | 誰驗證 |
|-----|------|--------|--------|
| Channel JWT | Channel 前端 ↔ Channel Backend | Channel Backend（SSO 後簽發）| Channel Backend 入口攔截器 |
| Query-API JWT | 各上游系統 → Query-API | 各上游系統（呼叫前轉換）| Query-API 攔截器 |
| External JWT | 外部系統直接呼叫 Query-API | 外部系統 | Query-API 攔截器 |

三組 secret 獨立，Query-API 只需要維護自己的兩組（`queryApiSecret`、`externalApiSecret`）。Channel 的 secret 輪替不影響 Query-API，反之亦然。

---

## Channel 側：轉換的責任在 FeignClientInterceptor

Channel 呼叫 Query-API 之前，必須把自己的 Channel JWT 轉換成 Query-API JWT。這件事放在 `FeignClientInterceptor`，對所有 Feign 呼叫透明生效：

```java
@Override
public void apply(RequestTemplate template) {
    Optional<RequestAttributes> attrs =
        Optional.ofNullable(RequestContextHolder.getRequestAttributes());

    attrs.ifPresent(a -> {
        HttpServletRequest request = (HttpServletRequest)
            a.resolveReference(RequestAttributes.REFERENCE_REQUEST);

        String authorization = request.getHeader("Authorization");

        String data, profile;
        if (authorization != null) {
            // 從 Channel JWT 解出業務身份
            data = channelJwtUtil.extractData(authorization);
            profile = channelJwtUtil.extractProfile(authorization);
        } else {
            data = "Invalid data";
            profile = "Invalid profile";
        }

        // 用 queryApiSecret 重新簽發
        String queryApiJwt = queryApiJwtUtil.generateToken(data, profile);

        template.header("Authorization", "Bearer " + queryApiJwt);
        template.header("x-core-transactionid", UUID.randomUUID().toString());
        template.header("x-core-traceid", UUID.randomUUID().toString());
    });
}
```

Query-API JWT 只放 `data` 和 `profile`（業務身份），把 `isDarkMode`、`channelCode` 這些 Channel 的 UI 狀態去掉。Query-API 作為共享服務，不應該對某個特定 channel 的前端狀態有任何認知。

**為什麼轉換放在 Feign 層而不是 Controller/Service？**

Channel 所有對 Query-API 的呼叫都走 Feign，在 interceptor 統一處理，沒有漏網路徑，新增 API 不用額外處理。其他想接入 Query-API 的上游系統，也各自在自己的 Feign 或 HTTP client 中完成同樣的轉換，Query-API 端完全不需要感知。

---

## Channel 自己的 JWT 驗證

Channel JWT 在 SSO 登入後簽發，有效期 1 小時：

```java
// ChannelJwtUtil.java（Channel 側）
public String generateToken(String data, String profile,
                             Boolean isDarkMode, String channelCode) {
    return Jwts.builder()
        .claim("data", data)
        .claim("profile", profile)
        .claim("isDarkMode", isDarkMode)
        .claim("channelCode", channelCode)
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + channelExpiration))
        .signWith(Keys.hmacShaKeyFor(channelSecret.getBytes()), SignatureAlgorithm.HS512)
        .compact();
}
```

Channel Backend 入口攔截器驗 Channel JWT：

```java
@Override
public boolean preHandle(HttpServletRequest request,
                          HttpServletResponse response,
                          Object handler) throws Exception {
    if (handler instanceof HandlerMethod method) {
        if (method.hasMethodAnnotation(JwtValidation.class)) {
            String token = request.getHeader("Authorization");
            if (!channelJwtUtil.isValid(token)) {
                response.sendError(HttpStatus.UNAUTHORIZED.value(), "Invalid token");
                return false;
            }
        }
    }
    return true;
}
```

這層驗證完全在 Channel 服務內部，Query-API 對此毫無感知。

---

## Query-API 側：Annotation 驅動的驗證入口

Query-API 同時服務兩種呼叫方：來自各上游系統（帶 Query-API JWT）和外部系統直接呼叫（帶 External JWT）。用 annotation 標記每個 endpoint 的信任模型：

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface JwtValidation {}        // 上游服務路徑（Query-API JWT）

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface ExternalJwtValidation {}  // 外部直接呼叫路徑
```

```java
@PostMapping("/get-asset-overview/v1")
@JwtValidation                            // ← 只接受 Query-API JWT
public RestInternalResponseWrapper<GetAssetOverviewResponse> getAssetOverview(...) { ... }

@PostMapping("/external/get-asset-summary/v1")
@ExternalJwtValidation                    // ← 只接受 External JWT
public RestInternalResponseWrapper<GetAssetSummaryResponse> getAssetSummaryExternal(...) { ... }
```

```java
@Override
public boolean preHandle(HttpServletRequest request,
                          HttpServletResponse response,
                          Object handler) throws Exception {
    if (handler instanceof HandlerMethod method) {
        String token = request.getHeader("Authorization");

        if (method.hasMethodAnnotation(JwtValidation.class)) {
            if (!queryApiJwtUtil.isValid(token)) {
                response.sendError(401, "Invalid Query-API token");
                return false;
            }
        } else if (method.hasMethodAnnotation(ExternalJwtValidation.class)) {
            if (!externalApiJwtUtil.isValid(token)) {
                response.sendError(401, "Invalid External token");
                return false;
            }
        }

        enrichRequestAttributes(request, token, method);
    }
    return true;
}
```

看到 endpoint 上的 annotation，就能一眼判斷這個 API 預期的呼叫方是誰。

---

## 完整鏈路

```
前端請求 (Authorization: Bearer <channel-jwt>)
    ↓
Channel RequestInterceptor
    @JwtValidation → channelJwtUtil.isValid()
    ↓
FeignClientInterceptor（Channel 側的職責）
    channelJwtUtil.extractData/Profile()
    queryApiJwtUtil.generateToken()
    → Authorization: Bearer <query-api-jwt>
    ↓
Traffic-Controller (WebFlux)
    reactiveJwtUtil.extractData/Profile() → debug log only
    透傳 Authorization header
    ↓
Query-API RequestInterceptor
    @JwtValidation → queryApiJwtUtil.isValid()
    解析 claims → 補入 access log
```

**轉換的責任在呼叫方**（Channel）——這是關鍵設計原則。Query-API 作為被呼叫的共享服務，不應該去適配每個上游系統的 token 格式；上游系統要接入，就必須自己完成格式轉換，符合 Query-API 定義的規格。

---

## 幾個已知的不足

| 問題 | 說明 |
|------|------|
| 只驗簽名和過期 | 缺少 `iss`、`aud` 驗證，token 理論上可跨服務重放 |
| 對稱加密（HS256/HS512） | 驗證端需要持有 secret，分發壓力較高；可評估改 RS256 |
| 無主動撤銷機制 | Token 過期前無法失效，可引入 Redis Token 黑名單 |
| Feign fallback 值 | 取不到 token 時用 `"Invalid data"` 繼續走，應改為 fail-fast |
