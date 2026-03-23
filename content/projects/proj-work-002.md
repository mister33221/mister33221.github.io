## 專案背景

為一語言教學新創公司開發的線上學習平台，提供用戶瀏覽文章、購買課程、進行線上課程，以及供管理員使用的後台管理系統。

## 我的角色

擔任 PG，專案成員為 PM×1、SA×2、PG×4。

主要負責：
- 後台管理功能規劃與實現：課程上下架、會員權限控管、留言管理、文章管理
- 協助前台部分功能實作
- 後端 API 設計與串接

## 技術細節

**後端**
- Spring Boot with WebFlux（響應式架構）
- Spring Security + JWT 做認證與授權
- R2DBC 搭配 PostgreSQL 14 進行非同步資料庫操作
- Swagger 文件自動產生，Lombok 減少樣板程式碼

**前端**
- Angular 13，搭配 ngx、PrimeNG、RxJS、jQuery

**部署**
- Server：GCP Debian 11
- Web Server：Apache
- 容器化：Docker Desktop

## 心得

這是第一次使用 Spring WebFlux 的響應式架構，與傳統 MVC 的思維差異很大。最初不習慣非同步的資料流設計，但透過這個專案深入理解了 Reactor 的 Mono / Flux，以及 R2DBC 與傳統 JDBC 的根本差異。團隊成員都比較年輕，大家樂於互相討論、激盪想法，是一段很享受的開發時光。
