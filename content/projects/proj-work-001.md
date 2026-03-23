## 專案背景

客戶為金融業，原有系統以 JSP（內含 Java 邏輯程式碼）搭配 DB2 資料庫開發，多年未更新，維護困難。此次任務是將整個系統翻新為前後端分離架構，後端改以 Spring 提供 API，前端以 Angular 10 重新實作。

## 我的角色

擔任 PG（程式設計師），專案成員組成為 PM×1、SA×2、PG×4。

主要負責：
- 閱讀並理解原有 JSP 系統的業務邏輯與資料流
- 依照 SA 設計的規格，實作後端 Spring API 與前端 Angular 頁面
- 使用 MyBatis 操作 DB2 資料庫，處理複雜 SQL 查詢

## 技術細節

- 後端：Spring Framework，以 MyBatis 作為 ORM 操作 DB2
- 前端：Angular 10，延用部分原有 JSP 的 iNet-Report 報表功能
- 開發工具：Eclipse、VSCode、DataGrip
- 系統環境：Windows Server 2012

## 心得

第一個正式參與的商業專案，最大的挑戰是讀懂沒有文件的 JSP 程式碼，從中還原業務邏輯。這個過程讓我學到如何在不完整的資訊下快速定位問題，也體會到「把程式碼寫好讓未來的人讀懂」的重要性。
