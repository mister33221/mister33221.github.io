---
title: "三層微服務中的流量控制器：WebFlux 反向代理設計與 OpenFeign JWT 轉換"
date: "2026-03-30"
category: "Architecture"
tags: ["Spring Boot", "WebFlux", "OpenFeign", "Microservices", "JWT", "Rate Limiting", "Reactive"]
summary: "記錄在三層微服務架構中，如何以 WebFlux 實作輕量反向代理層（Traffic-Controller），搭配 OpenFeign 做服務間通訊，並透過 FeignClientInterceptor 在層與層之間轉換 JWT，形成端到端的認證鏈。"
published: true
---

## 架構背景

這個系統拆成三層：

```
Web-Backend（Channel 層）
    ↓ OpenFeign
Traffic-Controller（流量控制層）
    ↓ WebClient (reactive)
Query-API（核心業務層）
    ↓
Oracle + Redis Cluster
```

**各層職責：**

| 層級 | 技術 | 職責 |
|------|------|------|
| Web-Backend | Spring MVC | 前端介面適配、外部 API 整合、Session 管理 |
| Traffic-Controller | Spring WebFlux | JWT 驗證、限流、反向代理 |
| Query-API | Spring MVC | 核心業務邏輯、資料庫操作、Caffeine 快取 |

Query-API 的定位是**共享查詢服務**——不只服務資產總覽這一個前端，任何上游系統都可以透過 Traffic-Controller 接入，這是把它獨立出來的主要原因。

---

## 一個關鍵的部署決策

Traffic-Controller 和 Query-API **同機部署**，兩個服務跑在同一台機器上，透過 localhost 互通。

```yaml
# traffic-controller application.yml
rate-limit-proxy-webflux:
  proxy:
    host: localhost   # 同機 Query-API
    port: 8080
```

這個決策有點違反「微服務應該獨立部署」的直覺，但背後有具體權衡：

**同機部署的優點：**
- localhost 通訊，延遲接近 0
- 省掉一層網路跳躍，降低出錯機率
- 部署流程簡化（一台機器部署兩個服務）

**代價：**
- 無法獨立水平擴展（兩者必須一起擴）
- 單點故障會同時影響兩個服務

**為什麼可以接受：**
Traffic-Controller 是純轉發的輕量服務，資源消耗極低，不需要獨立彈性；Query-API 才是效能瓶頸。兩者強耦合（每個請求都必須先過 Traffic-Controller），分開部署沒有實質效益。

---

## 為什麼 Traffic-Controller 選 WebFlux

核心問題是：**反向代理是 I/O 密集操作，不是 CPU 密集操作**。

```
傳統 Spring MVC：
  一請求 → 一執行緒 → 等待下游回應（執行緒阻塞）
  400 並發請求 → 需要 400+ 執行緒

WebFlux (Netty)：
  請求到達 → 非阻塞發出，事件循環繼續接收下一個
  400 並發請求 → CPU 核心數 × 2 個工作執行緒
```

實際壓測對比（4 核 8GB 環境）：

| 指標 | Spring MVC | Spring WebFlux | 改善 |
|------|-----------|----------------|------|
| 並發處理能力 | 200 TPS | 450 TPS | +125% |
| 記憶體消耗 | 512 MB | 256 MB | -50% |
| CPU 使用率（@400 TPS） | 85% | 45% | -47% |
| 工作執行緒數 | 200+ | 16 | -92% |

跟 Query-API 同機部署的另一個好處就在這裡——WebFlux 吃的資源少，兩者共存不太搶。

---

## Traffic-Controller 核心實作

### 反應式反向代理

```java
@RestController
@RequestMapping("/api")
public class RateLimitProxyController {

    @Value("${rate-limit-proxy-webflux.proxy.host}")
    private String proxyHost;

    @Value("${rate-limit-proxy-webflux.proxy.port}")
    private int proxyPort;

    @PostMapping(value = "**")  // 萬用路由，攔截所有 /api/** 路徑
    public Mono<Object> forwardRequestWithJwt(
            ServerWebExchange exchange,
            @RequestBody Flux<Map<String, Object>> requestBody) {

        HttpHeaders originalHeaders = exchange.getRequest().getHeaders();

        // Transaction ID：優先取 header，沒有就自動生成
        Mono<String> transactionIdMono = Mono
            .justOrEmpty(originalHeaders.getFirst("x-core-transactionid"))
            .switchIfEmpty(Mono.fromSupplier(() -> UUID.randomUUID().toString()));

        Mono<String> traceIdMono = Mono
            .justOrEmpty(originalHeaders.getFirst("x-core-traceid"))
            .switchIfEmpty(Mono.fromSupplier(() -> UUID.randomUUID().toString()));

        WebClient webClient = WebClient.builder()
            .baseUrl("http://" + proxyHost + ":" + proxyPort)
            .codecs(c -> c.defaultCodecs().maxInMemorySize(16 * 1024 * 1024))
            .build();

        return Mono.zip(transactionIdMono, traceIdMono)
            .flatMap(tuple -> {
                String txId = tuple.getT1();
                String traceId = tuple.getT2();

                return requestBody.collectList()
                    .flatMap(body -> {
                        // JWT 驗證（非阻塞，與轉發請求並行執行）
                        Mono<Void> jwtValidationMono = Mono
                            .justOrEmpty(exchange.getRequest().getHeaders()
                                .getFirst("Authorization"))
                            .flatMap(token -> Mono.zip(
                                reactiveJwtUtil.extractData(token)
                                    .onErrorResume(e -> Mono.empty()),
                                reactiveJwtUtil.extractProfile(token)
                                    .onErrorResume(e -> Mono.empty())
                            ))
                            .then();

                        // 轉發請求到 Query-API
                        Mono<Object> proxyMono = webClient
                            .post()
                            .uri(exchange.getRequest().getURI().getPath())  // 原路徑不變
                            .headers(h -> {
                                h.addAll(originalHeaders);
                                h.set("x-core-transactionid", txId);
                                h.set("x-core-traceid", traceId);
                            })
                            .bodyValue(body.get(0))
                            .retrieve()
                            .bodyToMono(Object.class);

                        // JWT 驗證與代理請求並行，返回代理結果
                        return Mono.zip(jwtValidationMono, proxyMono)
                            .map(Tuple2::getT2);
                    });
            });
    }
}
```

幾個值得注意的設計：

**`@PostMapping(value = "**")`**：萬用路由，Traffic-Controller 不需要知道 Query-API 有哪些端點，一律原路徑轉發。新增 Query-API API 不需要改 Traffic-Controller。

**JWT 驗證與轉發並行**：`Mono.zip(jwtValidationMono, proxyMono)` 讓驗證和轉發同時跑。驗證失敗會觸發 error，但這裡的設計是「驗證用於 logging」，不阻斷流量——認證的責任實際上在 Query-API 那層。

### 反應式 JWT 解析的一個陷阱

JWT 解析是 CPU 密集操作，直接在 WebFlux 事件循環執行會阻塞整個 Netty 工作執行緒：

```java
@Component
public class ReactiveJwtUtil {

    // ❌ 錯誤做法：直接在 Mono 裡做 CPU 密集工作
    public Mono<String> extractData_WRONG(String token) {
        return Mono.just(parseJwt(token));  // 會阻塞事件循環
    }

    // ✅ 正確做法：切換到彈性執行緒池
    public Mono<String> extractData(String token) {
        return Mono.fromCallable(() -> {
            String jwt = token.replace("Bearer ", "");
            Claims claims = Jwts.parserBuilder()
                .setSigningKey(jwtSecret.getBytes())
                .build()
                .parseClaimsJws(jwt)
                .getBody();
            return claims.get("data", String.class);
        }).subscribeOn(Schedulers.boundedElastic());  // 在獨立執行緒池執行
    }
}
```

`Schedulers.boundedElastic()` 是 Reactor 提供的有界彈性執行緒池，專門用來包裝阻塞式操作。JWT 解析這種 CPU 工作放到這裡，事件循環繼續處理其他連線，不互相影響。

---

## 請求完整鏈路

```
Web-Backend Controller
    ↓ assetFeignClient.getAssetTrend(request)
FeignClientInterceptor.apply()
    ↓ Web-Backend JWT → Query-API JWT，補 Transaction ID
HTTP POST → localhost:8083/api/asset/query-api/...
    ↓
Traffic-Controller (WebFlux)
    ↓ 驗證 JWT，限流檢查，生成/透傳 Trace ID
WebClient POST → localhost:8080/api/asset/query-api/...
    ↓
Query-API (Spring MVC)
    ↓ 驗證 Query-API JWT
業務邏輯 → Caffeine 快取 → Redis/Oracle
    ↓
Response 沿原路返回
```

---

## 兩個實際踩過的坑

### Backpressure 問題

```
reactor.core.Exceptions$OverflowException: Could not emit tick
```

WebFlux 的 `Flux<Map<String, Object>> requestBody` 是反應式流，上游傳快了下游跟不上就溢出。

```java
// 加上緩衝區
return requestBody
    .onBackpressureBuffer(1000)
    .collectList()
    .flatMap(body -> ...);
```

### WebFlux 記憶體設定

預設 WebClient 緩衝區只有 256KB，傳大一點的回應就炸：

```
DataBufferLimitException: Exceeded limit on max bytes to buffer : 262144
```

```java
webClient = WebClient.builder()
    .codecs(c -> c.defaultCodecs().maxInMemorySize(16 * 1024 * 1024))  // 16MB
    .build();
```

同時 `application.yml` 也要配：

```yaml
spring:
  codec:
    max-in-memory-size: 16MB
```

---

## 選型總結

這個架構的技術選型思路：

| 層級 | 技術選型 | 理由 |
|------|---------|------|
| Channel 層 | Spring MVC | 有大量業務邏輯、DB 操作，阻塞式反而好維護 |
| 流量控制層 | Spring WebFlux | 純轉發，I/O 密集，非阻塞節省大量執行緒 |
| 服務間通訊 | OpenFeign（Channel→TC）| 宣告式，整合 Spring Cloud LB |
| 服務間通訊 | WebClient（TC→Core）| WebFlux 生態，非阻塞轉發 |

不是所有服務都要用同一套技術，根據服務的實際工作性質選擇更合適的框架，整體才能達到最佳效果。
