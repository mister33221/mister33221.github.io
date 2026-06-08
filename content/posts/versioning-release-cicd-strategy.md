---
title: "版本管理策略 — Versioning、Release、SNAPSHOT 與 CI/CD 分支規範"
date: "2026-06-08"
category: "Architecture"
tags: ["Versioning", "Release", "SNAPSHOT", "CI/CD", "Git", "Branching", "Team Lead"]
summary: "從 Team Lead 視角建立可落地的版本管理規範：語義化版本、SNAPSHOT vs RELEASE、Git Flow 分支策略、CI/CD Pipeline 設計、Multi-Repo + Nexus 實戰到 Hotfix 流程。"
published: true
---

# 版本管理策略 — Versioning、Release、SNAPSHOT 與 CI/CD 分支規範

## 問題背景

最近負責一個 POC 的開發，是個前後端分離、又外部團隊、multirepo 的專案，起初直接開始規劃與開發，但開發到一個階段，覺的版本號、分支管理等等的好像很亂，所以想特別研究一下

這篇筆記的目標：從 Team Lead / SD 的視角，建立一套可落地的版本管理思維與規範。

---

## 一、語義化版本（Semantic Versioning）

**標準格式：** `MAJOR.MINOR.PATCH`，例如 `2.4.1`

| 部分 | 何時遞增 | 例子 |
|---|---|---|
| `MAJOR` | 有**不相容的 breaking change** | API 改介面、資料結構不向下相容 |
| `MINOR` | 加入新功能，**向下相容** | 新增一個 endpoint、新增 feature |
| `PATCH` | Bug fix，**向下相容** | 修正某個邏輯錯誤、安全性修補 |

**延伸格式（Pre-release / Build Metadata）：**

```
1.0.0-alpha        # 早期開發，API 可能大幅變動
1.0.0-beta.1       # 功能完整，還在測試
1.0.0-rc.1         # Release Candidate，準備正式發布
1.0.0              # 正式版
1.0.0+build.20260608  # 加上 build metadata（不影響版本比較）
```

**重要規則：**
- `0.y.z` 版本代表初期開發，任何東西都可能隨時改變
- 一旦發布 `1.0.0`，就進入穩定 API 承諾期
- 版本號一旦發布就**不能修改**（immutable），有問題要發新版本

---

## 二、SNAPSHOT vs RELEASE

這是 Java / Maven 生態的術語，但概念適用於所有語言。

### SNAPSHOT

```
1.2.0-SNAPSHOT
```

- 代表**開發中、尚未穩定**的版本
- 每次 build 都可能覆蓋同一個 artifact（內容會變動）
- 適合在 CI 環境、開發環境、功能測試中使用
- **不應該部署到 staging 或 production**

### RELEASE

```
1.2.0
```

- 代表**正式發布、不可變**的版本
- 同一個版本號只會有一個對應的 artifact（build once, deploy many）
- 一旦發布到 artifact repository（如 Nexus / JFrog / GitHub Packages），就**不能覆蓋**
- 部署到 staging、production 的版本**必須是 RELEASE**

### 版本生命週期

```
feature/xxx → develop → 1.2.0-SNAPSHOT（CI build）
develop → release/1.2.0 → 測試通過 → 移除 SNAPSHOT → 1.2.0（RELEASE tag）
release/1.2.0 → main → 部署 production
```

> **一句話記憶：**  
> `develop` = SNAPSHOT（開發中、會變）  
> `release branch / main / production` = RELEASE（穩定、不可變）

---

## 三、分支策略

### 3.1 Git Flow（適合有明確 release 節奏的產品）

```
main          ──────●──────────────────────●──── (production)
                   ↑                       ↑
release/1.2.0  ────┤───fix───────────tag──┤
                   ↑
develop       ─────●──────●──────●──────────── (integration)
                   ↑      ↑      ↑
feature/A    ──────┘   feature/B feature/C
```

**各分支職責：**

| 分支 | 版本類型 | 說明 |
|---|---|---|
| `main` / `master` | RELEASE tag | 永遠是最新的穩定正式版本；只有 release 分支或 hotfix 可以 merge 進來 |
| `develop` | `x.y.z-SNAPSHOT` | 整合所有 feature；每次 CI build 產出 SNAPSHOT artifact |
| `feature/xxx` | 無版本號 | 個人功能開發，只 merge 進 develop |
| `release/x.y.z` | 從 SNAPSHOT → RELEASE | 從 develop 切出，進行最終測試、bug fix，不加新功能；完成後 merge 進 main 和 develop |
| `hotfix/x.y.z` | PATCH 版本 | 從 main 切出，修正 production 緊急 bug；完成後 merge 回 main 和 develop |

### 3.2 GitHub Flow（適合持續部署、小型團隊）

```
main      ──────●──────●──────●──── (隨時可部署)
                ↑      ↑      ↑
feature/A ──────┘  feature/B  feature/C
```

- 只有一條長生命分支 `main`
- 所有開發都從 main 切出 feature branch
- 透過 PR review 後 merge 回 main
- merge 後立即觸發 CI/CD 部署
- 版本號用 Git tag 或 build number 標記

**適合情境：** Web service、SaaS 產品、有自動測試保護的服務

### 3.3 Trunk-based Development（適合高成熟度團隊）

- 所有人直接推到 `main`（或透過短暫的 feature branch，最多 1-2 天）
- 依賴 Feature Flag 控制功能開關
- 需要高度的自動化測試覆蓋率（Unit + Integration + E2E）
- CI 每次 push 都跑完整測試並部署

---

## 四、分支 ↔ 版本號 ↔ 環境 對應規範

以 Git Flow 為例的完整對應：

| 分支 | 版本格式 | 部署環境 | Artifact 是否可覆蓋 |
|---|---|---|---|
| `feature/xxx` | 無（或 feature build number） | 不部署（或 feature env） | 可 |
| `develop` | `x.y.z-SNAPSHOT` | Dev / Feature Testing | 可（每次 build 覆蓋） |
| `release/x.y.z` | `x.y.z-RC.n` 或 `x.y.z-SNAPSHOT` | Staging / UAT | 不可（RC 後 immutable） |
| `main`（tag `x.y.z`） | `x.y.z`（RELEASE） | Production | 不可 |
| `hotfix/x.y.z+1` | `x.y.(z+1)` | 緊急修補後直上 Production | 不可 |

---

## 五、CI/CD Pipeline 設計

### 5.1 Pipeline 觸發規則

```yaml
# 範例：GitHub Actions trigger 規則
on:
  push:
    branches:
      - develop          # 推送到 develop → 觸發 SNAPSHOT build + Dev 部署
      - 'release/**'     # 推送到 release/* → 觸發 RC build + Staging 部署
      - main             # 推送到 main → 觸發 Production 部署
  pull_request:
    branches:
      - develop
      - main             # PR 時跑完整測試但不部署
  workflow_dispatch:     # 手動觸發（緊急修補）
```

### 5.2 Build 版本號自動化

**方式一：從 Git tag 取版本（推薦）**

```bash
# 從最近的 tag 推導版本號
VERSION=$(git describe --tags --abbrev=0)
# 如果 HEAD 不在 tag 上，加上 commit hash
VERSION=$(git describe --tags)
# 輸出：1.2.0-3-g1a2b3c4（距離 tag 3 個 commit）
```

**方式二：Maven Release Plugin（Spring Boot 後端）**

Maven Release Plugin 是 Java 生態中專門處理「把 SNAPSHOT 版本升級為 RELEASE 版本」的工具，一個指令自動完成三件事：

1. 把 `pom.xml` 的版本從 `1.2.0-SNAPSHOT` 改成 `1.2.0`
2. 在 Git 上打一個 tag `v1.2.0`
3. 把版本號往前推到下一個 SNAPSHOT：`1.2.1-SNAPSHOT`

```xml
<!-- pom.xml -->
<version>1.2.0-SNAPSHOT</version>

<!-- 加入 plugin -->
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-release-plugin</artifactId>
</plugin>
```

```bash
# 執行 release（會自動改版本、tag、推進 SNAPSHOT）
mvn release:prepare release:perform
```

**方式三：Angular 版本管理（npm 生態）**

Angular（npm 生態）沒有「SNAPSHOT」這個概念，但有對應的工具鏈：

| Maven 生態 | Angular/npm 等效 |
|---|---|
| SNAPSHOT | `x.y.z-beta.0` / `x.y.z-rc.0`，或直接用 commit hash |
| RELEASE | 正式的 `x.y.z` tag |
| Maven Release Plugin | **`standard-version`** 或 **`semantic-release`** |
| CHANGELOG 自動生成 | `conventional-changelog` |

```bash
# 安裝 standard-version（Angular 專案常用）
npm install -D standard-version

# 根據 commit message 自動決定版本號升級幅度
npx standard-version
# 等效操作：
#   1. 更新 package.json 的 version
#   2. 更新 CHANGELOG.md
#   3. 打 Git tag
```

```bash
# semantic-release（更自動化，常用於 CI 環境）
npx semantic-release
# 從 commit message 判斷要 bump MAJOR / MINOR / PATCH
# feat: → MINOR bump（1.1.0 → 1.2.0）
# fix:  → PATCH bump（1.2.0 → 1.2.1）
# BREAKING CHANGE: → MAJOR bump（1.2.1 → 2.0.0）
```

### 5.3 名詞解釋

**Staging 環境是什麼？**  
軟體開發通常有多個環境，依照接近 production 的程度由低到高：

| 環境 | 用途 | 誰用 |
|---|---|---|
| **Local** | 開發者本機跑的 | 開發者個人 |
| **Dev** | 整合後的開發環境，跑 SNAPSHOT | 開發者、自動化 CI |
| **Staging** | 高度模擬 production 的環境，跑 RC / RELEASE | QA、PM、UAT |
| **Production** | 真實使用者的環境，跑正式 RELEASE | 使用者 |

Staging「stage」的原意就是「舞台」——像舞台彩排，正式演出前的最後一次完整驗證。  
Staging 的資料、設定盡量與 production 相同（或匿名化後的 production dump），才能提前發現問題。

---

### 5.4 Spring Boot + Angular 完整 Pipeline 流程

這個專案是：後端 Spring Boot（Maven）+ 前端 Angular（npm），兩個 repo 或 monorepo 都適用。

```
【開發階段】
開發者 push feature/PROJ-123-xxx
  └─ PR → Code Review → Merge to develop
            ↓
  後端 CI（Spring Boot）：
    mvn test                      # Unit + Integration Test
    mvn package -DSNAPSHOT        # build: backend-1.2.0-SNAPSHOT.jar
    docker build → 推送 ECR/GHCR  # image tag: 1.2.0-SNAPSHOT
            ↓
  前端 CI（Angular）：
    npm test                      # Jest / Karma unit test
    npm run build -- --configuration=dev
    # 產出 dist/，artifact 版本：package.json 的 "1.2.0-dev"
            ↓
  Deploy to Dev Environment
    後端：deploy backend-1.2.0-SNAPSHOT
    前端：deploy Angular dist 1.2.0-dev

【Release 準備階段】（QA 通過 Dev，準備進 Staging）
  切出 release/1.2.0 分支：
    git checkout develop
    git checkout -b release/1.2.0
            ↓
  後端：移除 SNAPSHOT
    pom.xml: 1.2.0-SNAPSHOT → 1.2.0-RC.1
    或直接用 Maven Release Plugin: mvn release:prepare
            ↓
  前端：更新版本號
    package.json: "version": "1.2.0-rc.1"
    npx standard-version --prerelease rc
            ↓
  Build & Deploy to Staging:
    後端：backend-1.2.0-RC.1.jar → deploy to staging
    前端：npm run build -- --configuration=staging → deploy to staging

【UAT + 驗收階段】
  Staging 上跑 E2E 測試（Cypress / Playwright）
  PM / Client 做 UAT
  Performance Test（JMeter / k6）

【正式發布】（UAT 通過）
  後端：
    pom.xml: 1.2.0-RC.1 → 1.2.0（移除 RC）
    mvn release:perform（自動打 tag v1.2.0，版本推進 1.2.1-SNAPSHOT）
            ↓
  前端：
    package.json: "version": "1.2.0"
    npx standard-version（更新 CHANGELOG，打 tag v1.2.0）
            ↓
  merge release/1.2.0 → main
  merge release/1.2.0 → develop（帶回 release 期間的 bug fix）
            ↓
  Build RELEASE artifact:
    後端：backend-1.2.0.jar / docker image:1.2.0
    前端：npm run build -- --configuration=production
            ↓
  Deploy to Production（Blue/Green 或 Canary）
            ↓
  Smoke Test on Production
            ↓
  🎉 Release 1.2.0 complete
```

---

## 六、Migration Guide 是什麼？

Migration Guide（遷移指南）是當版本升級**有 breaking change**（`MAJOR` 版本遞增）時，寫給使用者 / 其他開發者的說明文件，告訴他們：

- 哪些東西**不能向下相容**了（API 改名、參數刪除、行為變更）
- **如何把舊的用法改成新的用法**（step by step）
- 升級過程中需要執行哪些操作（資料庫 migration script、設定檔修改等）

**Spring Boot 後端範例：**
```markdown
## Migration Guide: v1.x → v2.0

### Breaking Changes

#### 1. UserController API 路徑變更
- 舊：POST /api/user/create
- 新：POST /api/v2/users
- 說明：統一改為 RESTful 命名規範

#### 2. JWT Token 格式變更
- 舊：token payload 包含 userId（int）
- 新：token payload 包含 userId（UUID 字串）
- 影響：所有呼叫方需重新登入取得新 token

### Migration Steps
1. 執行資料庫腳本：`db/migrations/v2.0.0__user_id_to_uuid.sql`
2. 更新前端 API 呼叫路徑（見下方前端 Migration Guide）
3. 清除所有現有 session / token，要求使用者重新登入
```

**Angular 前端範例：**
```markdown
## Migration Guide: v1.x → v2.0

### 1. UserService API 呼叫路徑更新
舊：
  this.userService.createUser(data)  // POST /api/user/create
新：
  this.userService.createUser(data)  // POST /api/v2/users（Service 內部已更新）

### 2. User Model 型別變更
舊：interface User { id: number }
新：interface User { id: string }  // UUID

需全域搜尋 userId 型別宣告並更新。
```

> **什麼時候必須寫 Migration Guide？**  
> - `MAJOR` 版本 bump（`1.x.x → 2.0.0`）時**必寫**  
> - 有對外 API 的 `MINOR` 版本若有重要行為改變，也建議寫  
> - 純 `PATCH`（bug fix）通常不需要

---

## 七、作為 Team Lead / SD 的規範設計

### 7.1 定義前先問這些問題

- **部署頻率**：每天多次？每週一次？有排程視窗？→ 影響你選 Git Flow 還是 Trunk-based
- **團隊規模**：2 人？15 人？→ 影響分支複雜度，小團隊過度設計反而是負擔
- **有無 SLA**：是否有不可停機要求？→ 影響 Blue/Green、Canary、Rollback 策略
- **語言生態**：Maven / Gradle / npm / pip → 版本管理工具不同
- **現有 CI/CD 工具**：Jenkins / GitHub Actions / GitLab CI / Azure DevOps

### 7.2 Team Lead 應文件化的最低規範

建議在 `CONTRIBUTING.md` 或 `docs/branching-strategy.md` 中寫清楚：

```markdown
## 分支命名規則
- feature/[ticket-id]-short-description  （例：feature/PROJ-123-add-login）
- bugfix/[ticket-id]-short-description
- hotfix/x.y.z
- release/x.y.z

## 版本號規則
- develop 分支永遠是 x.y.z-SNAPSHOT
- release 分支完成後移除 SNAPSHOT
- 每次 MAJOR bump 要寫 Migration Guide
- Hotfix 只改 PATCH 號

## PR 規則
- 每個 PR 至少 1 個 reviewer approve
- 必須通過所有 CI check 才能 merge
- squash merge 到 develop；merge commit 到 main
  # squash merge：把整個 feature branch 的多個 commit 壓成一個 commit 再 merge
  # 好處：develop 的 git log 整潔，每個 feature 是一條記錄
  # merge commit：保留所有 commit 歷史，並加一個「Merge branch xxx」commit
  # main 用 merge commit 是為了保留完整的 release 歷史軌跡

## Commit Message 規範（Conventional Commits）
feat: 新功能
fix: Bug 修正
docs: 只改文件
chore: 建構流程、依賴更新
BREAKING CHANGE: footer 寫 breaking change 說明
```

### 7.3 版本發布 Checklist（Release Checklist）

```markdown
## Release Checklist v{VERSION}

### 準備階段
- [ ] 從 develop 切出 release/{VERSION} 分支
- [ ] 更新 CHANGELOG.md
- [ ] 移除版本號中的 SNAPSHOT
- [ ] 確認所有 ticket 都已關閉或移至下一 sprint

### 測試階段
- [ ] CI 全部 green（Unit / Integration / E2E）
- [ ] Staging 部署完成
- [ ] UAT 簽核
- [ ] Performance Baseline 未退化

### 發布階段
- [ ] merge release/{VERSION} → main
- [ ] 打 tag v{VERSION}
- [ ] merge release/{VERSION} → develop（帶回 bug fix）
- [ ] 刪除 release branch

### 發布後
- [ ] Production Smoke Test
- [ ] 通知 Stakeholders
- [ ] 更新 develop 版本號至下一個 SNAPSHOT
```

### 7.4 Hotfix 流程

```bash
# 1. 從 main 切出
git checkout main
git checkout -b hotfix/2.3.1

# 2. 修 bug，版本號從 2.3.0 → 2.3.1

# 3. 跑測試，CI green

# 4. merge 回 main 並 tag
git checkout main
git merge --no-ff hotfix/2.3.1
git tag -a v2.3.1 -m "Hotfix: fix critical payment bug"

# 5. 同步回 develop（確保 fix 不被下次 release 遺漏）
git checkout develop
git merge --no-ff hotfix/2.3.1

# 6. 刪分支
git branch -d hotfix/2.3.1
```

---

## 八、常見陷阱

| 陷阱 | 問題 | 解法 |
|---|---|---|
| Production 部署 SNAPSHOT | 不知道確切是哪個 commit 的 build | 只允許 RELEASE 版本部署到 production |
| 版本號沒人維護 | 大家都不改，永遠是 `1.0.0` | CI pipeline 加驗證：develop push 要有 SNAPSHOT，release tag 要是 RELEASE |
| 多個 branch 同時改版本號 | merge 時發生衝突 | 版本號統一由 `release/x.y.z` 分支負責修改（見下方說明）|
| Hotfix 沒有 merge 回 develop | 下次 release 又出現同個 bug | Hotfix 完成後強制規定要同時 merge 回 main 和 develop |
| tag 打錯刪掉重打 | 已推到 remote 的 tag 被改 | `git tag` 打錯後要明確通知所有人，避免有人已用舊 tag build |
| CHANGELOG 沒人維護 | 上線了不知道改了什麼 | 用 `conventional-changelog` 自動從 commit message 生成 |

---

### 補充：「版本號統一由 release 分支負責修改」是什麼意思？

**release 分支** 就是 `release/x.y.z`，它是從 `develop` 切出來的一條短生命分支，專門用來準備這個版本的正式發布。

**為什麼版本號改動要集中在這裡？**  
如果 feature branch 各自改版本號，再 merge 進 develop，每次都會衝突：
```
# 衝突情境（不好的做法）
feature/A：pom.xml version = 1.2.0-SNAPSHOT  ← 改過
feature/B：pom.xml version = 1.3.0-SNAPSHOT  ← 也改過
merge 時就衝突了
```

**正確做法：**
- `feature/*` 分支不改版本號
- `develop` 的版本號由 **Team Lead** 在 sprint 開始時統一設定（例如：`1.2.0-SNAPSHOT`）
- 等 feature 都 merge 進 develop、QA 通過後，才切出 `release/1.2.0`
- **在 `release/1.2.0` 分支上**把版本號從 `1.2.0-SNAPSHOT` 改成 `1.2.0`（移除 SNAPSHOT）
- 這樣版本號變更只發生在一個地方，不會有衝突

```
誰負責改版本號？

分支             誰改               改成什麼
feature/*       不改               （維持 develop 的版本）
develop         Team Lead 設定     x.y.z-SNAPSHOT
release/x.y.z   Release Manager    x.y.z-RC.n → x.y.z
main            自動（CI/CD）       打 tag x.y.z
```

---

## 九、實戰場景：Multi-Repo + GitLab + Nexus

> **背景：**  
> - 一個 `platform` repo（整合所有 feature）  
> - 多個 `feature-xxx` repo（各自有後端 Spring Boot + 前端 Angular）  
> - GitLab 管理 source code 與 CI/CD  
> - Nexus 作為 artifact repository（Maven JAR + npm package）  
> - Feature repo 把自己的 artifact 發布到 Nexus；Platform repo 宣告對 feature 的依賴

---

### 9.1 整體架構

```
┌─────────────────────────────────────────────────────────┐
│                    GitLab Group                         │
│                                                         │
│  platform/          feature-auth/     feature-payment/  │
│  ├─ backend/        ├─ backend/       ├─ backend/       │
│  │  pom.xml         │  pom.xml        │  pom.xml        │
│  └─ frontend/       └─ frontend/      └─ frontend/      │
│     package.json       package.json     package.json    │
└─────────────────────────────────────────────────────────┘
                              │
                              │ publish artifact
                              ▼
┌─────────────────────────────────────────────────────────┐
│                        Nexus                            │
│                                                         │
│  maven-snapshots/    maven-releases/                    │
│  ├─ feature-auth-1.2.0-SNAPSHOT.jar                     │
│  └─ ...              ├─ feature-auth-1.1.0.jar          │
│                      └─ feature-payment-2.0.0.jar       │
│                                                         │
│  npm-snapshots/      npm-releases/                      │
│  ├─ @feature/auth-1.2.0-snapshot.tgz                    │
│  └─ ...              └─ @feature/auth-1.1.0.tgz         │
└─────────────────────────────────────────────────────────┘
                              │
                              │ resolve dependency
                              ▼
┌─────────────────────────────────────────────────────────┐
│                     platform repo                       │
│  backend/pom.xml:                                       │
│    <dependency>                                         │
│      <artifactId>feature-auth</artifactId>              │
│      <version>1.2.0-SNAPSHOT</version>  ← dev 用 SNAPSHOT│
│    </dependency>                                        │
│                                                         │
│  frontend/package.json:                                 │
│    "@feature/auth": "1.2.0-snapshot"    ← dev 用 snapshot│
└─────────────────────────────────────────────────────────┘
```

---

### 9.2 Nexus 倉庫設計

Nexus 建議設兩組倉庫（Maven + npm 各一組）：

**Maven 倉庫：**

| Nexus Repo | 類型 | 用途 | 可覆蓋？ |
|---|---|---|---|
| `maven-snapshots` | hosted | 接收 SNAPSHOT artifact | ✅ 可（每次 CI 覆蓋） |
| `maven-releases` | hosted | 接收 RELEASE artifact | ❌ 不可（immutable） |
| `maven-proxy` | proxy | 代理 Maven Central（外部依賴） | — |
| `maven-group` | group | 統一入口，合併上面三個 | — |

**npm 倉庫：**

| Nexus Repo | 類型 | 用途 |
|---|---|---|
| `npm-snapshots` | hosted | 開發中的 npm package |
| `npm-releases` | hosted | 正式版 npm package |
| `npm-proxy` | proxy | 代理 npmjs.com |
| `npm-group` | group | 統一 registry 入口 |

> **在 `~/.npmrc` 或 `.npmrc` 中設定：**
> ```
> registry=https://nexus.your-company.com/repository/npm-group/
> //nexus.your-company.com/repository/npm-group/:_authToken=${NEXUS_NPM_TOKEN}
> ```

---

### 9.3 Feature Repo：版本 & 分支規範

每個 feature repo（例如 `feature-auth`）遵循 Git Flow：

```
feature/xxx → develop → release/1.2.0 → main
```

**版本號命名：**

| 分支 | 後端版本（pom.xml） | 前端版本（package.json） |
|---|---|---|
| `feature/*` | 不改（繼承 develop） | 不改 |
| `develop` | `1.2.0-SNAPSHOT` | `1.2.0-snapshot` |
| `release/1.2.0` | `1.2.0-RC.1` → `1.2.0` | `1.2.0-rc.1` → `1.2.0` |
| `main`（tag） | `1.2.0` | `1.2.0` |

> npm 不支援 `SNAPSHOT` 這個關鍵字（這是 Maven 術語），  
> npm 慣例是用 `1.2.0-snapshot.0`、`1.2.0-rc.1`、`1.2.0-beta.1` 這類 prerelease 格式。

**Feature Repo 的 `.gitlab-ci.yml`：**

```yaml
stages:
  - test
  - build
  - publish

variables:
  MAVEN_OPTS: "-Dmaven.repo.local=.m2/repository"
  NEXUS_URL: "https://nexus.your-company.com"

# ─────────────────────────────────────
# 後端（Spring Boot）
# ─────────────────────────────────────
backend:test:
  stage: test
  script:
    - cd backend
    - mvn test
  only:
    - merge_requests
    - develop
    - /^release\/.*/

backend:publish-snapshot:
  stage: publish
  script:
    - cd backend
    - mvn deploy -DskipTests
      -DaltDeploymentRepository=snapshots::default::${NEXUS_URL}/repository/maven-snapshots/
  only:
    - develop   # develop push → 自動發布 SNAPSHOT 到 Nexus

backend:publish-release:
  stage: publish
  script:
    - cd backend
    # 移除 SNAPSHOT，打 tag，發布 RELEASE 到 Nexus
    - mvn release:prepare release:perform
      -DreleaseVersion=${RELEASE_VERSION}
      -DdevelopmentVersion=${NEXT_SNAPSHOT_VERSION}
      -DaltReleaseDeploymentRepository=releases::default::${NEXUS_URL}/repository/maven-releases/
  only:
    - /^release\/.*/   # release branch push → 手動或 trigger 發布 RELEASE
  when: manual         # 避免意外觸發，需手動確認

# ─────────────────────────────────────
# 前端（Angular）
# ─────────────────────────────────────
frontend:test:
  stage: test
  script:
    - cd frontend
    - npm ci
    - npm test -- --watch=false --browsers=ChromeHeadless
  only:
    - merge_requests
    - develop
    - /^release\/.*/

frontend:publish-snapshot:
  stage: publish
  script:
    - cd frontend
    - npm ci
    - npm run build -- --configuration=production
    # 設定 snapshot 版本號（從 package.json 取版本再加 -snapshot）
    - VERSION=$(node -p "require('./package.json').version")
    - npm version ${VERSION}-snapshot.$(date +%Y%m%d%H%M%S) --no-git-tag-version
    - npm publish --registry ${NEXUS_URL}/repository/npm-snapshots/
  only:
    - develop

frontend:publish-release:
  stage: publish
  script:
    - cd frontend
    - npm ci
    - npm run build -- --configuration=production
    - npm publish --registry ${NEXUS_URL}/repository/npm-releases/
  only:
    - /^release\/.*/
  when: manual
```

---

### 9.4 Platform Repo：依賴管理

Platform repo 整合所有 feature 的依賴，本身也有自己的版本號。

**後端 `pom.xml`（Spring Boot）：**

```xml
<project>
  <groupId>com.company</groupId>
  <artifactId>platform</artifactId>
  <version>3.0.0-SNAPSHOT</version>  <!-- platform 自己的版本 -->

  <properties>
    <!-- 在這裡統一管理各 feature 的版本號 -->
    <feature-auth.version>1.2.0-SNAPSHOT</feature-auth.version>
    <feature-payment.version>2.1.0-SNAPSHOT</feature-payment.version>
  </properties>

  <dependencies>
    <dependency>
      <groupId>com.company</groupId>
      <artifactId>feature-auth-backend</artifactId>
      <version>${feature-auth.version}</version>
    </dependency>
    <dependency>
      <groupId>com.company</groupId>
      <artifactId>feature-payment-backend</artifactId>
      <version>${feature-payment.version}</version>
    </dependency>
  </dependencies>

  <repositories>
    <!-- 從 Nexus group 取得依賴（含 SNAPSHOT + RELEASE + proxy） -->
    <repository>
      <id>nexus-group</id>
      <url>https://nexus.your-company.com/repository/maven-group/</url>
      <snapshots><enabled>true</enabled></snapshots>
      <releases><enabled>true</enabled></releases>
    </repository>
  </repositories>
</project>
```

**前端 `package.json`（Angular）：**

```json
{
  "name": "@company/platform-frontend",
  "version": "3.0.0-snapshot",
  "dependencies": {
    "@feature/auth-frontend": "1.2.0-snapshot.20260608120000",
    "@feature/payment-frontend": "2.1.0-snapshot.20260607090000"
  }
}
```

> **前端 snapshot 版本號較難「浮動」**，npm 沒有 Maven 那種「永遠拉最新 SNAPSHOT」的機制，  
> 建議：在 CI 自動更新到最新 snapshot tag，或用 `1.2.0-snapshot.x` 配合 `npm update`。

---

### 9.5 Release 時的跨 Repo 協調流程

這是 Multi-Repo 最麻煩的地方：**feature repo 必須先 release，platform repo 才能 release**。

```
【Sprint 結束，準備 Release】

Step 1：各 Feature Repo 各自 release
  ┌──────────────────────────────────────────┐
  │ feature-auth: develop → release/1.2.0    │
  │   ├─ pom.xml: 1.2.0-SNAPSHOT → 1.2.0    │
  │   ├─ package.json: 1.2.0-snapshot → 1.2.0│
  │   ├─ CI 跑測試                           │
  │   ├─ 發布 1.2.0 到 Nexus maven-releases  │
  │   ├─ 發布 1.2.0 到 Nexus npm-releases    │
  │   └─ merge to main, tag v1.2.0           │
  │                                          │
  │ feature-payment: 同上流程 → v2.1.0       │
  └──────────────────────────────────────────┘
              ↓
Step 2：Platform Repo 更新依賴版本，進行 Release
  ┌──────────────────────────────────────────┐
  │ platform: develop → release/3.0.0        │
  │   ├─ pom.xml: feature-auth 改為 1.2.0    │
  │   │  （從 SNAPSHOT 改為 RELEASE）         │
  │   ├─ package.json: @feature/auth 改為 1.2.0│
  │   ├─ CI 重跑完整整合測試                  │
  │   ├─ Deploy to Staging                   │
  │   ├─ UAT 通過後，platform 版本改 3.0.0   │
  │   ├─ 發布 platform 3.0.0 artifacts       │
  │   └─ merge to main, tag v3.0.0           │
  └──────────────────────────────────────────┘
              ↓
Step 3：Deploy to Production
  platform 3.0.0 → Production
```

**關鍵原則：**
> 部署到 Staging 或 Production 的 platform，其所有 feature 依賴**必須是 RELEASE 版本**，不可有任何 SNAPSHOT。

可在 Maven 加入這個 CI 驗證：

```xml
<!-- 在 CI pipeline 加一個驗證 job，發現 SNAPSHOT 依賴就 fail -->
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-enforcer-plugin</artifactId>
  <executions>
    <execution>
      <id>no-snapshots-in-release</id>
      <goals><goal>enforce</goal></goals>
      <configuration>
        <rules>
          <requireReleaseDeps>
            <onlyWhenRelease>true</onlyWhenRelease>
            <message>Release build 不允許 SNAPSHOT 依賴！</message>
          </requireReleaseDeps>
        </rules>
      </configuration>
    </execution>
  </executions>
</plugin>
```

---

### 9.6 版本依賴矩陣（Compatibility Matrix）

當 feature repo 越來越多，需要維護一張「哪個 platform 版本對應哪些 feature 版本」的表：

| Platform | feature-auth | feature-payment | feature-report |
|---|---|---|---|
| 3.0.0 | 1.2.0 | 2.1.0 | 1.0.0 |
| 2.5.0 | 1.1.0 | 2.0.0 | — |
| 2.0.0 | 1.0.0 | 1.5.0 | — |

建議把這張表維護在：
- Platform repo 的 `CHANGELOG.md` 或 `docs/compatibility.md`
- 或用 GitLab Wiki

---

### 9.7 常見跨 Repo 問題與解法

| 問題 | 情境 | 解法 |
|---|---|---|
| Platform 拉到過期 SNAPSHOT | feature-auth 的 SNAPSHOT 被覆蓋，platform 拉到的是半小時前的舊 build | CI pipeline 固定 SNAPSHOT 版本加上時間戳（`1.2.0-snapshot.20260608120000`），確保可追溯 |
| Feature 改了 API，Platform 還沒更新 | feature-auth 2.0.0 有 breaking change，platform 還在用 1.x | Feature repo 發布 MAJOR 版本時**必須通知** platform team，並附 Migration Guide |
| Release 順序搞錯 | Platform 先 release，feature 還在 SNAPSHOT | CI 加入 SNAPSHOT 依賴檢查（上面的 enforcer plugin），有 SNAPSHOT 就不讓 release pipeline 跑 |
| 哪個 feature 版本是哪個 commit | SNAPSHOT 不好追 | 每個 SNAPSHOT build 在 Nexus 的 metadata 裡加上 `git.commit.id`（用 `git-commit-id-maven-plugin`） |
| 同時有多個 feature 在開發，platform 整合爆炸 | 多個 feature SNAPSHOT 互相影響 | 每個 feature 的 SNAPSHOT 只在**各自的整合環境**測試，platform develop 的整合測試排在最後 |

---

### 9.8 GitLab Pipeline 整體觸發關係

```
feature-auth repo
  develop push
    → CI: test + build
    → publish feature-auth-1.2.0-SNAPSHOT.jar to Nexus
    → trigger platform repo pipeline（可選）

feature-auth repo
  release/1.2.0 merge to main
    → CI: test + build
    → publish feature-auth-1.2.0.jar to Nexus
    → 自動開 GitLab Issue / 通知 platform team：「auth 1.2.0 已 release，請更新依賴」

platform repo
  develop push（開發者手動更新依賴版本後）
    → CI: mvn dependency:resolve（確認 Nexus 上的依賴存在）
    → 整合測試
    → Deploy to Dev

platform repo
  release/3.0.0（所有 feature 都 release 後）
    → 驗證無 SNAPSHOT 依賴（enforcer plugin）
    → CI: 完整測試
    → Deploy to Staging → UAT → Deploy to Production
```

在 GitLab 中可以用 **Pipeline Triggers** 或 **GitLab CI downstream pipeline** 串接：

```yaml
# feature-auth/.gitlab-ci.yml
notify-platform:
  stage: notify
  trigger:
    project: company/platform
    branch: develop
    strategy: depend   # 等待 downstream pipeline 完成
  only:
    - develop
```

---

## 疑問 / 待確認

- Monorepo 下的版本管理（Nx / Turborepo / Lerna）如何處理多個 package 的版本？
- Feature Flag 服務（LaunchDarkly / Unleash）與版本號的關係？
- Helm Chart 版本號 vs Application 版本號 如何同步？
- Container image tag 策略：用 `latest` 的風險與替代方案？
- 當 feature repo 數量很多時，Release Train（固定時間點集體 release）vs 獨立 release 哪個更適合？

## 延伸閱讀

- [Semantic Versioning 2.0.0](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Flow 原始文章](https://nvie.com/posts/a-successful-git-branching-model/)
- [GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow)
- [Trunk-based Development](https://trunkbaseddevelopment.com/)
- [Google Engineering Practices: Release Engineering](https://sre.google/sre-book/release-engineering/)
