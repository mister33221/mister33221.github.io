## 專案背景

為銀行客戶開發的資產總覽系統，整合銀行各類金融資產（存款、基金、股票、保險等），以統一介面呈現給用戶。系統透過 iframe 嵌入超過 12 種外部渠道（行動 App、網頁入口、交易平台），對可用性、效能與安全性要求極高。

## 我的角色

擔任後端工程師，參與系統架構設計與核心功能實作。負責範圍涵蓋：三層微服務架構設計、分層 JWT 認證機制、多層快取策略、批次轉檔系統、效能調校，以及 SSO 登入整合。

## 系統架構

採用三層微服務設計：

```
Web-Backend（Channel 層，Spring MVC）
    ↓ OpenFeign + JWT 轉換
Traffic-Controller（流量控制層，Spring WebFlux）
    ↓ WebClient 反向代理
Query-API（核心業務層，Spring MVC + DDD）
    ↓
Oracle + Redis Cluster
```

**Traffic-Controller 選用 WebFlux 的原因：** 反向代理屬於 I/O 密集場景，WebFlux 非阻塞模型在同等負載下執行緒數僅需 Spring MVC 的十分之一，記憶體消耗降低 50%。

**Query-API 定位為共享服務：** 不只服務資產總覽一個前端，設計為可重用的標準化資料查詢層，供多個上游系統接入。

生產環境部署：2 台 Web-Backend + 3 台 Query-API（各搭配 Traffic-Controller 同機部署）+ Oracle + Redis Cluster。

## 分層 JWT 認證

針對三層服務設計三套獨立的 JWT，各自有獨立的 Secret 和過期時間：

| 層級 | JWT 用途 | 演算法 |
|------|---------|--------|
| Web-Backend ↔ 前端 | 攜帶 UI 狀態（深色模式、渠道碼）| HS512 |
| Web-Backend → Query-API | 內部服務呼叫，只帶業務身份 | HS256 |
| 外部系統 → Query-API | 第三方直接接入的專用 Token | HS256 |

Token 在 `FeignClientInterceptor` 層自動轉換，呼叫端無感。Query-API 以 `@JwtValidation` / `@ExternalJwtValidation` 區分兩種入口，Annotation 驅動讓信任模型一眼可見。

## SSO 登入整合（iframe + postMessage）

外部平台以 iframe 嵌入，透過 POST 請求傳遞 AES 加密的使用者身份，Backend 解密後進行 SSO 中台二次驗證（僅生產環境），重新簽發 JWT 並回傳自動跳轉 HTML。

- 雙層加密保護：AES（傳輸）+ JWT（狀態傳遞）
- `@PostConstruct` fail-fast 檢查：生產環境若 SSO 驗證開關未啟用，服務啟動即失敗
- MDC 補入 Transaction ID，讓外部入口的 log 也可追蹤

## 快取策略

**架構澄清：** Caffeine 是 Spring Cache 的主角，Redis 是資料來源（存放每日批次轉入的快取資料），兩者角色不同。

快取下沉至 Repository 層，避免 Service 層 cache key 漂移、多個 UseCase 重複快取同一底層查詢等問題。以 YAML 統一管理各 cache 的容量和 TTL，每日 06:00 排程全清防止髒讀。

**快取命中率 78%，DB 查詢減少 78%。**

## 批次資料轉檔

每日定時將數萬筆帳戶資料從 Oracle 批次寫入 Redis Cluster。設計三層架構：

1. **分割層**：帳戶清單按 batchSize=50 切割
2. **並行控制層**：`Semaphore` 限制同時執行批次數，`CallerRunsPolicy` 形成自然背壓
3. **處理層**：批次查詢（避免 N+1）、帳號級錯誤隔離、明確 null 釋放幫助 GC

Redis OOM 偵測到訊號後優雅退出，保存已成功資料。

**結果：轉檔時間 45 分鐘 → 8 分鐘（-82%），失敗率 5% → < 0.1%。**

## 外部 Token 預取（非同步 + Double-Checked Locking）

整合 8 個外部 API 平台，各自有 10 分鐘有效期的認證 Token。

- **DCL（Double-Checked Locking）+ ConcurrentHashMap**：Token 過期瞬間 100 個並發請求，只觸發 1 次外部 API 呼叫
- **CAS（AtomicBoolean）防重複預取**：Token 剩餘 180 秒時背景更新，主請求不阻塞
- 自訂 FixedThreadPool + 自定義 ThreadFactory（daemon thread，可命名）

**結果：後續請求響應時間 800ms → 8ms，API 呼叫頻率降低 83%。**

## 效能調校（JMeter 壓測）

初始狀態：TPS 80、P95 2.1 秒、錯誤率 3%。

主要調校策略（共 8 項）：

1. **SQL N+1 修復**：批次查詢替換迴圈查詢，DB 往返次數減少 80%
2. **HikariCP 多機器計算**：Oracle 可用連線 250 / 3 台 = 每台 80（避免超過 DB 上限導致連線拒絕）
3. **Tomcat 執行緒池**：max-threads 200 → 300，執行緒:連線池比例維持 3-4:1
4. **加鎖反而讓效能提升**：對快取熱點加 `synchronized` 削峰，避免快取 miss 時大量請求打穿到 DB
5. **G1GC 調校**：`Xms=Xmx=4g` 固定堆大小，`InitiatingHeapOccupancyPercent=45` 避免 Full GC
6. **日誌優化**：生產環境移除 DEBUG 日誌，日誌 I/O 減少 60%

**最終：TPS 450（+463%）、P95 450ms（-79%）、錯誤率 0.05%（-98%）。**

## DDD 架構

Query-API 採用六角架構（Hexagonal Architecture）實作：

- **Ports & Adapters** 嚴格分層：Domain 不依賴任何框架
- 資料存取分兩組資料源（Primary / Secondary），各自有獨立 EntityManagerFactory 和 TransactionManager
- Repository 以 package 路徑切分，杜絕誤用錯誤資料源

## 心得

這是我參與過技術複雜度最高的專案。幾個印象深刻的設計洞察：

**加鎖反而讓效能提升**——這個反直覺的現象讓我真正理解「Thundering Herd（雷擊效應）」，也讓我意識到效能問題往往不是在最慢的那條路徑上，而是在最多人同時走的那條路徑上。

**快取架構的層次**——把 Caffeine 和 Redis 的職責分清楚，避免把兩個東西混為一談，是整個快取策略能正確運作的前提。

**分層 JWT 不是過度設計**——三層 Token 的代價是配置複雜度，換來的是每一層邊界的獨立演進能力和風險隔離。在一個對安全要求很高的金融系統裡，這個代價值得。
