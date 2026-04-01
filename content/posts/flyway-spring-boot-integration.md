---
title: "Flyway × Spring Boot：整合與使用指南（含版本管理觀念與實務流程）"
date: "2026-03-24"
category: "Backend"
tags: ["Spring Boot", "Logback"]
summary: "Flyway 是一套 **資料庫版本控管（Schema Migration）** 工具。"
published: true
---

# Flyway × Spring Boot：整合與使用指南（含版本管理觀念與實務流程）

Flyway 是一套 **資料庫版本控管（Schema Migration）** 工具。

你可以把它想成「DB 的 Git log + 部署腳本管理」：

* 每次 DB 結構變更（DDL）與必要資料（部分 DML）都用一個 **migration 檔**記錄
* Flyway 在啟動或部署時自動執行「尚未執行過」的 migration
* DB 內會有一張歷史表追蹤版本與 checksum，避免環境漂移

---

## 1. Flyway 解決什麼問題？

### 1.1 確保環境一致

同一套 migrations 在 dev/sit/uat/prod 跑出相同的 DB 結構（schema）。

### 1.2 變更可追蹤、可審核

每個版本變更都是一個檔案，可 code review、可回溯原因。

### 1.3 部署更可靠

部署時只要跑 Flyway，就能把 DB 從「目前版本」補到「最新版本」。

> Flyway 的設計偏向 **forward-only**：用新版本修正問題，而不是自由切換版本。

---

## 2. Flyway 版本管理核心概念

### 2.1 Migration 檔 = DB 版本

* `V1__init.sql`
* `V2__add_user_table.sql`
* `V3__add_index_on_user.sql`

命名規則（最常用的版本化 migration）：

```
V<版本號>__<描述>.sql
```

### 2.2 Flyway 會在 DB 建一張歷史表

預設表名：`flyway_schema_history`

表裡會記錄：

* version / description
* installed_on
* checksum（避免你偷偷改已執行過的檔）
* success/failure

### 2.3 啟動時會不會每次都從 V1 跑？

* **第一次（全新 DB）**：會從 V1 跑到最新
* **之後每次啟動**：只跑「新加的版本」

---

## 3. 在 Spring Boot 中整合 Flyway

### 3.1 加入依賴

**Maven**

```xml
<dependency>
  <groupId>org.flywaydb</groupId>
  <artifactId>flyway-core</artifactId>
</dependency>
```

**Gradle**

```gradle
implementation 'org.flywaydb:flyway-core'
```

> 你的 JDBC driver（PostgreSQL/SQL Server/Oracle）通常本來就會有。

---

### 3.2 放置 migrations

預設路徑：

```
src/main/resources/db/migration
```

範例：

`src/main/resources/db/migration/V1__init.sql`

```sql
CREATE TABLE app_user (
  id BIGINT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL
);
```

`src/main/resources/db/migration/V2__add_last_login_at.sql`

```sql
ALTER TABLE app_user ADD last_login_at TIMESTAMP NULL;
```

---

### 3.3 application.yml 基本設定

```yaml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration
```

只要你有設定 `spring.datasource.*`，Spring Boot 會在啟動時自動跑 Flyway。

---

## 4. 常見進階設定（實務很常用）

### 4.1 舊資料庫接管（baseline）

如果你的 DB 已經有很多表，但以前不是 Flyway 管的，直接 migrate 可能被擋（schema 非空）。

```yaml
spring:
  flyway:
    baseline-on-migrate: true
    baseline-version: 1
```

含義：

* 建立 `flyway_schema_history`
* 把「現在」當作 baseline 起點
* 後續從更高版本開始管理

---

### 4.2 指定只跑到某個版本（target）

你可以控制「最多 migrate 到哪個版本」，例如只跑到 V10：

```yaml
spring:
  flyway:
    target: 10
```

使用情境：

* 分階段上線（SIT/UAT 先追新，Prod 暫時停在某版）

---

### 4.3 Repeatable migrations（R__）

適合用在 View / Stored Procedure / Function 等會反覆更新的物件。

命名：

```
R__<描述>.sql
```

例：`R__create_or_replace_views.sql`

特性：

* 內容有變（checksum 變）→ 下次 migrate 會再跑

---

### 4.4 多 schema / 自訂歷史表

```yaml
spring:
  flyway:
    schemas: app_schema
    table: flyway_schema_history
```

---

## 5. 正常團隊流程：誰要動 DB 該怎麼做？

### 5.1 DDL（建表/加欄位/索引/約束）

**一律新增 migration 檔**（不要手改正式 DB，也不要回頭改舊 migration）。

正確：新增 `V12__add_xxx.sql`

錯誤：改 `V1__init.sql` 或改已上線跑過的版本（checksum 會炸）。

---

### 5.2 DML（資料）要不要用 migration 管？

分兩類：

#### A) 測試資料 / 個人資料

* dev 手動增刪改 OK
* 但不保證別人環境也有

#### B) 系統必要資料（seed data）

例如：SYS_SETTING、權限角色、字典資料、必要參數

* 建議用 migration 管
* 否則會發生「我本機正常、SIT/UAT 缺資料爆掉」

範例：`V5__seed_sys_setting.sql`

```sql
INSERT INTO sys_setting (k, v) VALUES ('TOKEN_EXPIRE_MIN', '15');
```

---

## 6. 開發環境手動改 DB 會怎樣？（重要）

### 6.1 手動改 DDL 的風險

* 環境漂移：你本機 DB 跟別人不同
* 之後 migration 會撞到「欄位已存在」導致啟動失敗

**建議：DDL 不要手改，直接寫 migration。**

### 6.2 手動改資料的影響

* 測試資料：OK
* 必要 seed：最好寫進 migration

### 6.3 本機亂掉的最乾淨解法

* 砍掉 dev DB（或清空 schema）重建
* 讓 Flyway 從 V1 跑到最新

> 正式環境通常不允許 clean；dev 可以用「重建 DB」解決。

---

## 7. Flyway vs Hibernate ddl-auto

* `ddl-auto=create/update`：方便但不可控、難審核、容易飄移
* Flyway：可控、可審核、可重播，較適合正式環境

常見配置：

* 正式：Flyway 管 schema
* JPA：`ddl-auto=validate` 或 `none`

---

## 8. 實務建議（讓團隊跑得穩）

1. **所有 DDL 都走 migration**（禁止手改正式 DB）
2. migration 一旦進環境就不要改內容（避免 checksum 問題）
3. 需要回滾：

   * 正式環境以備份還原最可靠
   * 或新增修復 migration 往前修
4. View/SP 用 `R__*.sql` 管理
5. 必要的系統參數/字典資料用 seed migrations 管理

---

## 9. 快速檢查清單

### 9.1 基本必備

* [ ] **依賴已加入**：`org.flywaydb:flyway-core`
* [ ] **JDBC Driver 已加入**：PostgreSQL / SQL Server / Oracle 對應 driver（專案能正常連線 DB）
* [ ] **Datasource 設定正確**：`spring.datasource.url / username / password`（與環境一致）
* [ ] **migrations 路徑正確**：預設 `classpath:db/migration`（或 `spring.flyway.locations` 已正確指定）
* [ ] **檔名規則正確**：`V<版本>__<描述>.sql`（注意雙底線 `__`，版本號建議用遞增整數或語意化序列）
* [ ] **第一次啟動**：DB 會建立 `flyway_schema_history`（代表 Flyway 有在跑）
* [ ] **之後啟動**：只會執行「新增且尚未執行」的版本（不會每次從 V1 重跑）

### 9.2 團隊流程必備（避免環境漂移）

* [ ] **已跑過的 migration 檔不要修改**（避免 checksum 不一致導致啟動失敗）
* [ ] **所有 DDL 變更都用新增 migration**（不要手動改正式 DB；dev 也盡量不要手改 DDL）
* [ ] **PR/Code Review 檢查**：migration 是否可重播、是否破壞相容（例如欄位改型別、drop 欄位）
* [ ] **部署順序固定**：先跑 Flyway（migrate）→ 再部署應用程式（避免程式先上但 DB 還沒更新）

### 9.3 常見設定檢查（視情況）

* [ ] **既有 DB 接管**：若 schema 非空且之前不是 Flyway 管的，考慮：`spring.flyway.baseline-on-migrate=true`
* [ ] **分階段上線**：需要控制只跑到某版時，設定：`spring.flyway.target=<version>`
* [ ] **Repeatable**：View / SP / Function 等需要可重複更新者，用 `R__*.sql`
* [ ] **多 schema**：需要時設定 `spring.flyway.schemas=...`（並確認權限足夠）
* [ ] **禁止危險操作**：正式環境避免開 `clean`（若你有用到 Flyway 的 clean 機制）

### 9.4 與 JPA/Hibernate 搭配（建議）

* [ ] **正式環境**：`spring.jpa.hibernate.ddl-auto` 建議 `validate` 或 `none`（避免 Hibernate 直接改 schema）
* [ ] **開發環境**：仍建議 Flyway 管 schema；`ddl-auto` 只用 `validate` 輔助檢查（避免 update 自動改表造成不可控差異）
* [ ] **啟動順序**：確保 Flyway 在 JPA 初始化前完成 migrate（Spring Boot 預設通常會幫你處理）

---

如果你願意貼你的 `application.yml`（datasource + flyway + jpa），我可以幫你對照這份清單逐項檢查哪裡少了/可能踩雷。
