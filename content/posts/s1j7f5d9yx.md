---
title: "專案壓力測試指南"
date: "2026-03-24"
category: "Java"
tags: ["Java", "Concurrency"]
summary: "- 因為最近的專案是以 Spring boot 作為後端開發語言，所以這邊會以 Spring boot"
published: true
---

# 專案壓力測試指南

- 因為最近的專案是以 Spring boot 作為後端開發語言，所以這邊會以 Spring boot 為例子來說明。
- 測試工具則是使用 JMeter 來進行壓力測試。

## 壓力測試的目的

- 確保系統能夠在預期的使用量下，能夠正常運作。
- 找出系統的瓶頸，並進行優化。

## 壓力測試的流程

1. 需求分析
2. 規劃測試環境
3. 規劃測試案例
4. 編寫壓力測試文件
5. 依照壓力測試文件編寫 JMeter 腳本
6. 執行壓力測試
7. 分析測試結果
8. 優化系統
9. 重複步驟 6 ~ 8 至滿足需求

## 1. 需求分析

- 了解系統的使用情境
- 了解系統的使用量
- 在這邊我們假設是一個簡單的查詢系統，使用者可以透過 API 查詢資料。
- 我希望達到的 KPIs(Key Performance Indicators)如下:
    - SIT、UAT
        - Throughput(吞吐量): 50 requests per second
        - Total Throughput: > 50 request/second (每秒50次請求，等於每分鐘3000次請求)
        - Total Average Response Time: < 300ms
        - Max Response Time: 5s
        - Concurrent Users(並發用戶數): 100
        - Error Rate: 0%
        - 90th Percentile: 2s
        - 95th Percentile: 3s
        - 99th Percentile: 4s
        
        - Total test duration: > 1 minute
    - PRODUCTION
        - Throughput(吞吐量): 150 requests per second
        - Total Throughput: > 150 request/second (每秒150次請求，等於每分鐘9000次請求)
        - Total Average Response Time: < 500ms
        - Max Response Time: 3s
        - Concurrent Users(並發用戶數): 200
        - Error Rate: 0%
        - 90th Percentile: 1s
        - 95th Percentile: 2s
        - 99th Percentile: 3s
        - Total test duration: > 1 minute

## 2. 規劃測試環境

- 先將軟硬體的部分確定下來，確保軟硬體能夠支援我們的需求。
- 以下假設在不同環境(硬體及軟體規格不同)下，軟硬體的規格如下:
    - SIT、UAT
        - CPU: 4 Core
        - RAM(random access memory): 8 GB
        - Disk
            - Drive: HDD(Hard Disk Drive)
            - Size: 100 GB
        - 網路頻寬: 100 Mbps
        - OS: Ubuntu 18.04 
        - DB: Oracle 11g
        - Java: OpenJDK 17
    - PRODUCTION
        - CPU: 8 Core
        - Memory: 16 GB
        - Disk: 
            - Drive: SSD(Solid State Drive)
            - Size: 500 GB
        - 網路頻寬: 1 Gbps
        - OS: Ubuntu 18.04 (同 SIT、UAT)
        - DB: Oracle 11g (同 SIT、UAT)
        - Java: OpenJDK 17 (同 SIT、UAT)

## 3. 規劃測試案例

- 一般而言，我們在寫測試案例的時候，會針對不同的功能進行測試。例如:
    - 以 API 的角度，一支 API 一個測試案例。
    - 以功能的角度，一個功能一個測試案例。
        - 例如同一支 API，在後端可能依據 request 的參數不同，會有不同的功能，這時候我們會將這些不同的功能分開來寫測試案例。
- 在本文中，就以簡單為主，假設的專案是只有查詢功能，而這個查詢功能也就是很直接的進行查詢，沒有額外的功能。(例如 空值、錯誤反饋等)
- 所以我們只需要一個測試案例，就是進行查詢。

| 測試案例編號 | 測試案例名稱 | 前置條件 | 測試步驟 | 預期結果 | 備註 |
|-------------|-------------|---------|---------|----------|-----|
| TC-001      | 查詢 API 正常流程 | 1. 系統中已載入測試資料<br>2. 使用者已通過驗證 | 1. 發送 GET 請求至 `/api/query?keyword=test`<br>2. 等待系統回應<br>3. 驗證回應的 HTTP 狀態碼為 200<br>4. 驗證回應資料正確，且符合查詢條件<br>5. 記錄回應時間  | 1. HTTP 狀態碼 200<br>2. 回傳資料正確且符合查詢條件<br>3. 平均回應時間符合 KPI（SIT/UAT <300ms，PRODUCTION <500ms） | 單一查詢功能測試 |

## 4. 編寫壓力測試文件

- 現在需求確認了，環境也確認了，測試案例也確認了，接下來就可以開始編寫壓力測試文件，讓後續 Jmeter 腳本編寫的時候，可以按照這份文件來編寫及執行。
- 下面就來寫一個簡單的壓力測試文件範例
---
# XXX公司 XXX專案壓力測試計畫書

## 1. 文件目的
本文件旨在定義 XXX公司 XXX專案的壓力測試範圍、目標、測試環境、測試工具與腳本、測試案例以及執行與結果分析流程。透過本測試計畫，確保系統在預期負載下的穩定性，並找出潛在的性能瓶頸以便後續優化。

## 2. 測試範圍
- 測試涵蓋系統關鍵功能（例如：API 查詢、使用者認證、資料提交等）。
- 主要針對 SIT/UAT 與模擬 PRODUCTION 環境下的性能表現進行測試。

## 3. 測試目標 (KPIs)
| KPI 指標                    | SIT/UAT                                    | PRODUCTION                                    |
|-----------------------------|--------------------------------------------|-----------------------------------------------|
| 吞吐量 (Throughput)         | 50 requests/second (3000 requests/minute)  | 150 requests/second (9000 requests/minute)      |
| 平均回應時間 (Average)      | < 300ms                                    | < 500ms                                       |
| 最大回應時間 (Max)          | 5秒                                        | 3秒                                           |
| 並發用戶數 (Concurrent)     | 100                                        | 200                                           |
| 錯誤率 (Error Rate)         | 0%                                         | 0%                                            |
| 90th Percentile             | 2秒                                        | 1秒                                           |
| 95th Percentile             | 3秒                                        | 2秒                                           |
| 99th Percentile             | 4秒                                        | 3秒                                           |
| 測試持續時間 (Duration)     | > 1分鐘                                    | > 1分鐘                                       |

## 4. 測試環境
| 環境       | CPU       | RAM   | 磁碟             | 網路頻寬   | 作業系統       | 資料庫        | Java         |
|------------|-----------|-------|------------------|------------|----------------|---------------|--------------|
| SIT/UAT   | 4 Core    | 8 GB  | HDD (100 GB)     | 100 Mbps   | Ubuntu 18.04   | Oracle 11g    | OpenJDK 17   |
| PRODUCTION | 8 Core    | 16 GB | SSD (500 GB)     | 1 Gbps     | Ubuntu 18.04   | Oracle 11g    | OpenJDK 17   |

## 5. 測試工具與腳本
- **測試工具:** Apache JMeter
- **腳本編寫:**
  - 設計 Thread Group（設定使用者數、Ramp-Up 時間、迴圈次數）
  - 配置 HTTP Request Sampler（根據 API 定義請求參數與路徑）
  - 加入 Listener 以收集與展示測試數據
  - 設定 Assertions 驗證回應正確性
  - 使用 Timers 模擬用戶思考時間

## 6. 測試案例
### 6.1 查詢功能測試案例
以查詢 API 為例，制定以下測試案例：

| 測試案例編號 | 測試案例名稱         | 前置條件                                       | 測試步驟                                                                                                                                         | 預期結果                                                                                           | 備註         |
|--------------|----------------------|------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------|--------------|
| TC-001       | 查詢 API 正常流程    | 1. 系統中已載入測試資料<br>2. 使用者已通過驗證  | 1. 發送 GET 請求至 `/api/query?keyword=test`<br>2. 等待系統回應<br>3. 驗證 HTTP 狀態碼為 200<br>4. 驗證回應資料正確且符合查詢條件<br>5. 記錄回應時間  | HTTP 200、回傳資料正確且符合查詢條件，平均回應時間符合 KPI（SIT/UAT <300ms，PRODUCTION <500ms） | 單一查詢功能 |

<!-- 修改: 新增其他測試案例以提升測試覆蓋率 -->
### 6.2 其他測試案例（選用）
| 測試案例編號 | 測試案例名稱         | 前置條件         | 測試步驟                                             | 預期結果                           | 備註                         |
|--------------|----------------------|------------------|------------------------------------------------------|------------------------------------|------------------------------|
| TC-002       | 查詢 API 空值查詢    | 使用者已通過驗證 | 發送 GET 請求至 `/api/query`（不帶參數）               | 返回錯誤訊息或預設結果，HTTP 狀態碼依設計而定  | 空值處理測試                 |
| TC-003       | 查詢 API 異常參數    | 使用者已通過驗證 | 發送 GET 請求至 `/api/query?keyword=12345`（數字形式）  | 返回 HTTP 400/422，並提示參數錯誤     | 異常輸入測試                 |

## 7. 測試執行計劃
| 項目     | 內容                                                                                                                                                                                      |
|----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 測試日期 | [預計開始日期] 至 [預計結束日期]                                                                                                                                                           |
| 執行步驟 | 1. 預演測試：以低負載驗證腳本正確性<br>2. 正式壓力測試：逐步增加負載至預期使用量或更高，模擬實際使用情境<br>3. 測試數據收集：利用 JMeter 與監控工具記錄性能指標<br>4. 結果整理與分析：依 KPI 對比測試結果 |

## 8. 結果分析與報告
| 項目       | 說明                                                                                       |
|------------|--------------------------------------------------------------------------------------------|
| 數據整理   | 匯總各項 KPI 數據與錯誤日誌                                                                 |
| 圖表展示   | 使用工具生成趨勢圖、資源利用率圖表                                                         |
| 瓶頸分析   | 分析系統中 CPU、記憶體、磁碟 I/O 與網路頻寬的瓶頸                                            |
| 改進建議   | 根據測試結果提出系統優化方案                                                               |
| 報告撰寫   | 撰寫詳細測試報告，並進行評審與回饋                                               |

## 9. 風險評估與備援計畫
| 項目       | 說明                                                                                                         |
|------------|--------------------------------------------------------------------------------------------------------------|
| 潛在風險   | - 測試環境與生產環境不一致<br>- 測試數據不足<br>- 突發錯誤導致測試中斷                                        |
| 風險應對   | - 調整測試環境配置，盡量貼近生產環境<br>- 增加模擬數據量與使用者模擬<br>- 設立應急方案，確保測試中即時回復             |

## 10. 附件
| 附件項目         | 說明                                     |
|------------------|------------------------------------------|
| 測試腳本文件     | JMeter 檔案                              |
| 測試數據說明文件 | 說明測試使用的數據來源與結構               |
| 測試報告模板     | 測試報告範本                              |
| 修訂歷史記錄     | 文件修訂記錄                              |

---

*修訂日期：YYYY/MM/DD*  
*負責人：XXX*

---

## 5. 依照壓力測試文件編寫 JMeter 腳本

- 根據上面的壓力測試文件，我們可以開始編寫 JMeter 腳本了。
- 我就不演示 Jmeter 截圖該怎麼寫了。用文字描述就好。
- 我們把壓力測試文件的測試目標、測試案例中，要轉化到 JMeter GUI 對應的地方。

### 結構

```text
Test Plan (XXX公司 XXX專案壓力測試計畫書)
└── Thread Group
    ├── HTTP Request Defaults
    ├── HTTP Header Manager (選用)
    ├── CSV Data Set Config (選用)
    ├── HTTP Request Sampler
    ├── Constant Timer (或其他 Timer)
    ├── Response Assertion
    └── Listeners (例如 Summary Report、Aggregate Report、View Results Tree)
```
### 相關欄位及要填入的參數

| 元件名稱                   | 參數/設定說明                                                                              | 建議值/範例                                                                                                                                         |
|---------------------------|-------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| Test Plan                 | 測試計劃的名稱、是否啟用自動編譯腳本等                                                       | 名稱：XXX公司 XXX專案壓力測試計畫書                                                                                                                   |
| Thread Group              | 模擬並發用戶、設定 Ramp-Up 時間、循環次數                                                   | - Number of Threads (users): 100 (SIT/UAT) 或 200 (PROD)<br>- Ramp-Up Period: 60 秒（根據需求可調整）<br>- Loop Count: 可設為「Forever」並搭配 Duration 設定測試總時間，或依實際需求設置固定次數 |
| HTTP Request Defaults     | 設定所有 HTTP Request 的共用預設值（伺服器 IP/域名、埠號、協議）                             | - Server Name/IP: 如 api.example.com<br>- Port Number: 80 或 443<br>- Protocol: HTTP 或 HTTPS                                                          |
| HTTP Header Manager       | 設定通用 HTTP 請求標頭，例如 Content-Type、Accept 等（如果 API 需要特定標頭）                | - Content-Type: application/json<br>- Accept: application/json                                                                                        |
| HTTP Request Sampler      | 實際發送 API 請求，設定方法、路徑與參數                                                     | - Method: GET<br>- Path: /api/query<br>- Parameters: 新增參數 keyword，Value 設定為 test                                                             |
| Timer (Constant Timer)    | 模擬使用者操作間隔，避免請求過於集中                                                       | 建議延遲：100～300 毫秒                                                                                                                              |
| Response Assertion        | 驗證 API 回應是否正確，如 HTTP 回應碼、回應內容中是否包含特定關鍵字                          | - Field to Test: Response Code<br>- Pattern Matching Rule: Equals<br>- Pattern: 200<br>如需驗證內容，可新增另一個 Assertion 檢查回應體中的關鍵字       |
| Listeners                 | 收集與展示測試結果，便於分析性能數據與錯誤信息                                               | 建議添加：<br>- Summary Report<br>- Aggregate Report<br>- View Results Tree                                                                           |
| CSV Data Set Config (選用) | 若需模擬多組參數（例如不同的查詢條件），可透過 CSV 文件提供數據以參數化 HTTP 請求              | 設定 CSV 文件路徑、分隔符號，並配置變數名稱，例如 keyword                                                                                          |
### 具體操作步驟

### 1 建立 Test Plan
- 在 JMeter GUI 中，新建一個 Test Plan，命名為「XXX公司 XXX專案壓力測試計畫書」。

### 2 新增 Thread Group
- 在 Test Plan 下新增一個 Thread Group。
- 設定「Number of Threads」為 100（SIT/UAT 測試）或 200（PROD 模擬）。
- 設定「Ramp-Up Period」為 60 秒，表示使用者會在 60 秒內逐步啟動。
- 設定「Loop Count」：
  - 若希望持續執行超過 1 分鐘，可選擇勾選「Forever」並在 Thread Group 中設定 Duration，
  - 或依實際需求設置固定次數。

### 3 新增 HTTP Request Defaults
- 在 Thread Group 下新增「Config Element」→「HTTP Request Defaults」。
- 設定伺服器名稱、埠號、協議，這些參數將成為所有 HTTP Request 的預設值。

### 4 （選用）新增 HTTP Header Manager
- 若 API 需要特定標頭，則在 Thread Group 下新增「HTTP Header Manager」。
- 添加必要的標頭，例如：
  - Content-Type：application/json
  - Accept：application/json

### 5 （選用）新增 CSV Data Set Config
- 如需參數化測試，新增「CSV Data Set Config」。
- 配置 CSV 文件路徑、分隔符與變數名稱，例如設定變數 `keyword` 用於參數化查詢條件。

### 6 新增 HTTP Request Sampler
- 在 Thread Group 下新增一個「Sampler」→「HTTP Request」。
- 設定：
  - **Method:** GET
  - **Path:** `/api/query`
  - **Parameters:** 新增參數，Name 為 `keyword`，Value 為 `test`

### 7 新增 Timer
- 在 HTTP Request Sampler 或 Thread Group 下新增一個 Timer（例如「Constant Timer」）。
- 設定延遲時間，建議介於 100 至 300 毫秒，以模擬使用者操作間隔。

### 8 新增 Response Assertion
- 在 HTTP Request Sampler 下新增「Assertions」→「Response Assertion」。
- 設定：
  - **Field to Test:** Response Code
  - **Pattern Matching Rule:** Equals
  - **Pattern:** 200
- 如需檢查回應內容，可再新增另一個 Assertion 來驗證回應體中的關鍵字。

### 9 新增 Listeners
- 在 Test Plan 或 Thread Group 下新增 Listener 元件以收集測試結果，建議至少加入：
  - Summary Report
  - Aggregate Report
  - View Results Tree

## 6. 執行壓力測試

- 在進行 Java 專案的壓力測試前，除了專案中的邏輯及功能確認沒問題的話，也要注意 JVM 參數的調整，這會直接影響 java 程式可以使用多少記憶體，以及 GC 的效能。
- 以下是一些常見的 JVM 參數設定:
    - `-Xms`、`-Xmx`:
        - 意義: 分別為初始堆積大小與最大堆積大小，決定 Java 程式可用的記憶體上限。
        - 使用: 建議設定初始與最大值相同，避免在執行中進行動態擴展，降低 GC 的壓力。
    - `Xss`:
        - 意義:  每個執行緒的棧空間大小，若應用程式中有大量線程，預設值可能累計消耗較多記憶體。
        - 使用: 根據實際需求減少單個線程棧空間，但要注意不能設得太低以免 StackOverflow。
    - `-XX:+UseG1GC`
        - 意義: 使用 G1 垃圾回收器，這是目前較主流的 GC，能夠在多核與大記憶體環境下提供較穩定的停頓時間。
        - 使用: 直接在啟動參數中加入 -XX:+UseG1GC，針對高併發情境下有較好的效果。
    - `-XX:MaxGCPauseMillis`
        - 意義: 設定期望的 GC 停頓時間上限，GC 會盡量根據此值進行調整。
        - 使用: 根據應用程式對延遲的敏感度設定一個目標值，例如 -XX:MaxGCPauseMillis=200，表示 GC 停頓時間不超過 200 毫秒。
    - `-XX:MetaspaceSize 與 -XX:MaxMetaspaceSize`
        - 意義: 設定 Metaspace 的初始大小與最大大小，Metaspace 是用來存放類元數據的區域。
        - 使用:  當應用中存在大量動態生成的類或長時間運行時，適當調整可避免 Metaspace OOM。
    - `Xlog:gc*`
        - 意義: 啟用 GC 詳細日誌輸出，方便後續分析 GC 行為與性能瓶頸。
        - 使用: 在啟動參數中加入 `-Xlog:gc*`（Java 9 以上）或使用 `-XX:+PrintGCDetails -XX:+PrintGCTimeStamps`（Java 8）來輸出 GC 日誌。
- 使用以上這些參數的時候，要注意
    - 測試與調整：      
        這些設定僅為建議，實際數值需根據應用程式特性、負載情境與測試結果反覆調整，建議在壓力測試中先行調試確定最佳組合。        
        在壓力測試前先小規模測試，確保參數配置不會對系統造成額外負擔。
    - 環境一致性：      
        在 SIT/UAT 與 Production 測試中，盡量使 JVM 參數保持一致，或根據硬體差異適度調整，以便能夠從測試數據推估實際生產表現。
    - 監控工具：        
        搭配 JVisualVM、JConsole、Prometheus 或 Grafana 等工具，實時監控 JVM 的記憶體使用、GC 行為與 CPU 利用率，有助於及時發現與調整潛在問題。
- 範例
    - 以下是一個簡單的 Java 程式，用來模擬壓力測試，並設定了一些 JVM 參數。
    ```java
    public class PressureTest {
        public static void main(String[] args) {
            System.out.println("Start pressure test...");
            while (true) {
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }
    }
    ```
    - 啟動參數
        - `java -Xms2g -Xmx2g -Xss512k -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:MetaspaceSize=256m -XX:MaxMetaspaceSize=512m -Xlog:gc* PressureTest`
    - 這個程式會不斷地進行睡眠，模擬高併發情境下的壓力，並設定了一些 JVM 參數，以便觀察 GC 行為與記憶體使用情況。
- 根據前述的軟硬體規格，我們調整 JVM 參數的思路與策略
    - 整理考量
        - 記憶體分配        
            由於 SIT/UAT 環境只有 8GB，而 PRODUCTION 為 16GB，若資料庫（Oracle 11g）與 OS 也共用同一台主機，就必須為系統與 DB 預留足夠資源。調整時一般不建議將全部記憶體都給 Java 堆，通常保留至少 40%–50% 給 OS 與其他服務。
        - CPU 核心數        
            CPU 數量會影響垃圾回收（GC）的平行度。例如，在 4 Core 環境下，GC 平行線程數可設較低（約 2–3 線程），而在 8 Core 的 PRODUCTION 環境下，則可考慮較高的線程數（約 4–6 線程）。
        - GC 設定        
            OpenJDK 17 預設使用 G1 GC，此收集器在多核心環境下有較佳表現，同時針對大堆記憶體的情況能較平穩地進行停頓控制。如果對延遲有更嚴格要求，也可以考慮 ZGC 或 Shenandoah，但前提是應用可接受較高的調校複雜度。
    - Heap 參數(-Xms 與 -Xmx)
        - SIT/UAT 環境僅有 8GB 記憶體，建議將初始堆大小（-Xms）設為 2GB，最大堆大小（-Xmx）設為 2GB，這樣可以確保 JVM 在運行時有足夠的記憶體，同時避免過度配置。
        - PRODUCTION 環境有 16GB 記憶體，可將初始堆大小設為 8GB，最大堆大小設為 8GB，以應對更高的併發與較大的資料量。
    - GC 參數
        - Java 17 預設 G1 GC 已相當優化，但可透過調整一些參數以符合延遲要求：       
            - `-XX:MaxGCPauseMillis=200`：設定 GC 停頓目標（可根據需求縮短或放寬）
            - `-XX:InitiatingHeapOccupancyPercent=45`：提早啟動並行標記週期，避免堆太大時突發性 GC
        - 平行線程數：
            - SIT/UAT：`-XX:ParallelGCThreads=2`（大約為 CPU 核心數的一半）
            - PRODUCTION：`-XX:ParallelGCThreads=4` 至 `-XX:ParallelGCThreads=6`（視應用並行性與 GC 負載來調整）
    - GC 日誌
        - 在啟動參數中加入 `-XX:+PrintGCDetails -XX:+PrintGCDateStamps -Xloggc:/path/to/gc.log`，可以輸出 GC 詳細日誌，方便後續分析 GC 行為與性能瓶頸。
- JVM 參數的結論
    - SIT/UAT:      
        `java -Xms2G -Xmx2G -XX:MaxGCPauseMillis=200 -XX:ParallelGCThreads=2 -XX:+PrintGCDetails -XX:+PrintGCDateStamps -Xloggc:/path/to/gc.log -jar your-application.jar`
    - PRODUCTION:      
        `java -Xms8G -Xmx8G -XX:MaxGCPauseMillis=200 -XX:ParallelGCThreads=4 -XX:+PrintGCDetails -XX:+PrintGCDateStamps -Xloggc:/path/to/gc.log -jar your-application.jar`
- 使用 Jmeter 測試也有一些需要注意的地方
    - **盡量使用非 GUI 模式運行測試**  
        - GUI 模式主要用於編寫與調試測試腳本，實際壓力測試時應使用命令行（Non-GUI 模式）運行。  
        - 這樣可以減少測試工具本身對資源的消耗，避免影響測試結果。

    - **避免使用過多的 Listener**  
        - Listener（例如 View Results Tree、View Results in Table 等）在測試運行時會佔用大量記憶體和 CPU。  
        - 應盡量只在調試階段使用，正式測試時建議將結果輸出到文件中，再進行後續分析。

    -  **確保 JMeter 本身的資源配置足夠**  
        - 調整 JMeter 的 JVM 參數（例如 `-Xms` 與 `-Xmx`）以確保在高負載測試下 JMeter 本身不成為瓶頸。  
        - 如果測試涉及大量併發，可能需要在專用機器上運行 JMeter 或採用分布式測試模式。

    -  **測試環境與測試數據**  
        - 保持測試環境與實際生產環境儘量一致，避免因環境差異導致測試結果偏差。  
        - 使用真實或充分模擬的測試數據，確保測試場景能反映實際應用情況。

    -  **監控 JMeter 與被測系統的資源**  
        - 在壓力測試期間，同時監控 JMeter 的 CPU、記憶體使用情況，以及被測系統的資源使用，  確保測試結果不受測試工具本身資源瓶頸的影響。

    - **做好結果記錄與日誌管理**  
        - 壓力測試結束後，仔細分析日誌與結果報告，確認各項性能指標是否達標，並找出可能的瓶頸所在。  
        - 建議將測試結果保存成文件，避免在測試運行時過多輸出到控制台或 GUI。

## 7.8.9. 結果分析與報告 > 優化系統 > 重複執行測試並調整至符合需求

- 經過前面的各樣準備，最後藉由 Jmeter 產出的結果報告，來進行分析與報告。
- 這個部分就是根據前面的測試目標、KPIs 來進行分析，並提出改進建議。
- 再藉由這些改進建議，進行優化系統，並重複執行測試，直到符合需求為止。
- 這個部分就是一個迭代的過程，直到達到預期的性能指標為止。

## 結論

以上就是一個完整的 Java 專案壓力測試流程，從需求確認、環境規劃、測試案例規劃、壓力測試文件編寫、JMeter 腳本編寫、執行壓力測試、結果分析與報告、優化系統等步驟。這個流程可以幫助團隊確保系統在高併發情況下的穩定性與性能表現，並找出潛在的性能瓶頸進行優化。
