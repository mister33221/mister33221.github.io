## 專案動機

在銀行資產總覽系統專案中需要做壓力測試，發現自己對 JMeter 的了解非常有限。這個 repo 是我系統性學習 JMeter 的實戰筆記，附帶一個 Spring Boot 後端服務作為測試目標。

## 學習內容

### 基礎設定
- Thread Group、Sampler、Listener 的組合使用
- 設定 Ramp-Up Period 模擬流量漸增的情境

### 測試情境設計
- 模擬 100 / 500 / 1000 個並發用戶對 REST API 的請求
- 測試不同快取策略下的回應時間差異（無快取 vs Caffeine vs Redis）

### 報表分析
- Summary Report、Aggregate Report 的解讀
- 找出 Throughput、Average Response Time、Error Rate 的瓶頸

### 實際發現
- 快取命中率對 P99 延遲影響極大
- 資料庫連線池大小是常見瓶頸之一
- JMeter 本身的 Thread 設定也可能成為測試結果的干擾因素

## 心得

壓力測試不只是「跑一下看有沒有掛」，更重要的是設計有意義的測試情境，以及能看懂報表數字背後的意義。這個專案讓我在後續的正式壓測工作中更有信心。

GitHub：[mister33221/jmeter-learning-project](https://github.com/mister33221/jmeter-learning-project)
