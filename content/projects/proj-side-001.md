## 專案動機

在工作中接觸 DDD 後，想透過一個完整的練習專案加深理解。以「忍者世界」作為業務場景（有村莊、忍者、任務、技能），讓業務邏輯有足夠的複雜度，又不會太抽象。

## 架構設計

採用 DDD 標準四層架構：

- **Domain Layer**：定義 Entity（忍者、村莊）、Value Object（忍術等級）、Aggregate Root、Repository Interface
- **Application Layer**：Use Case 的協調層，不含業務邏輯
- **Infrastructure Layer**：Repository 實作、資料庫操作
- **Interface Layer**：REST Controller

## 主要實作內容

- Aggregate 設計：`Ninja` 為 Aggregate Root，包含技能清單與等級計算邏輯
- Value Object：`JutsuLevel`、`Village` 以不可變物件設計
- Domain Event：任務完成後觸發 `MissionCompletedEvent`，解耦後續流程
- Repository Pattern：依賴反轉，Domain 層只依賴介面，不依賴 JPA 實作

## 心得

DDD 最難的地方不是技術，而是「如何找到正確的業務邊界」。忍者世界看似簡單，但設計過程中仍然面臨「忍術應該屬於哪個 Aggregate」這類困惑，反而讓我更理解為什麼 DDD 要求深入的業務理解。

GitHub：[mister33221/ninja-ddd-practice](https://github.com/mister33221/ninja-ddd-practice)
