## 專案動機

在工作中使用 Kafka 時，發現 Consumer 端的錯誤處理有很多眉角——什麼時候該 Retry？什麼時候要送進 DLT？這個專案是為了系統性地整理並比較各種錯誤處理策略。

## 實作的錯誤處理策略

### 1. SimpleRetryPolicy
- 設定固定次數重試
- 適合短暫性失敗（網路超時、資料庫暫時無回應）

### 2. ExponentialBackOffPolicy
- 每次重試間隔指數增長，避免短時間內打爆下游服務
- 搭配 Jitter 增加隨機性，防止 Retry Storm

### 3. Dead Letter Topic（DLT）
- 超過重試次數後，將訊息送進 DLT 而不是直接丟棄
- DLT Consumer 另外處理，記錄錯誤原因或人工介入

### 4. DefaultErrorHandler vs SeekToCurrentErrorHandler
- 比較兩種 ErrorHandler 在 Offset 處理上的行為差異
- 理解 Commit 時機對消費語意（at-least-once / at-most-once）的影響

## 環境

使用 Docker Compose 建立本地 Kafka + Zookeeper 環境，搭配 Spring Boot Consumer 應用，方便快速重現各種失敗情境。

## 心得

這個練習讓我意識到「Kafka 的錯誤處理沒有萬用解法」，每種策略都有適用情境與代價。現在遇到 Kafka 相關問題，能更快速地判斷該用哪種策略。

GitHub：[mister33221/spring-kafka-error-handling-example](https://github.com/mister33221/spring-kafka-error-handling-example)
