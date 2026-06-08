# mister33221.github.io

個人作品集 + 技術部落格，靜態網站，部署於 GitHub Pages。

## 技術棧

| 項目 | 說明 |
|------|------|
| 框架 | Next.js 14（App Router，`output: 'export'` 靜態輸出） |
| 語言 | TypeScript |
| 樣式 | CSS Modules + CSS 自訂變數（Design Token） |
| 部署 | GitHub Pages（push to `main` 自動觸發 GitHub Actions） |

## 專案結構

```
├── content/
│   ├── posts/          # 技術部落格文章（Markdown）
│   ├── culture/        # 文化隨筆（電影、音樂、書籍）
│   └── projects/       # 專案詳細說明頁
├── data/
│   ├── profile.json    # 個人基本資料
│   ├── projects.json   # 專案索引
│   └── resume.json     # 工作經歷、學歷、技能
├── public/             # 靜態資源（圖片、robots.txt）
├── scripts/
│   └── sync-from-obsidian.js  # 從 Obsidian 同步文章
└── src/
    ├── app/            # Next.js App Router 路由
    ├── components/     # React 元件
    └── lib/            # 資料讀取邏輯（posts、markdown、culture、projects）
```

## 頁面路由

| URL | 說明 |
|-----|------|
| `/` | 首頁 |
| `/blog` | 技術部落格列表 |
| `/blog/[slug]` | 文章內頁 |
| `/culture` | 文化隨筆列表 |
| `/culture/[slug]` | 隨筆內頁 |
| `/projects` | 作品集 |
| `/profile` | 個人簡介 |
| `/resume` | 履歷 |

---

## 本地開發

### 前置需求

- Node.js 18+
- npm 9+

### 安裝與啟動

```bash
# 安裝依賴
npm install

# 啟動開發伺服器（http://localhost:3000）
npm run dev
```

### 靜態建置

```bash
# 建置靜態檔案，輸出到 out/
npm run build
```

---

## 新增內容

### 新增部落格文章

在 `content/posts/` 建立 `{slug}.md`，填入 frontmatter：

```yaml
---
title: "文章標題"
date: "YYYY-MM-DD"
category: "Backend"   # Backend / Architecture / Performance / Notes
tags: ["Spring Boot", "Java"]
summary: "一句話摘要"
published: true
---
```

`published: false` 可存草稿，不會出現在網站上。

### 從 Obsidian 同步文章

若使用 Obsidian 管理文章，可執行同步腳本（`published: true` 才會同步）：

```bash
npm run sync
```

> 同步來源路徑寫在 `scripts/sync-from-obsidian.js` 的 `SOURCE` 變數，請依本機路徑調整。

---

## 部署

push 到 `main` 分支後，GitHub Actions 會自動建置並部署到 GitHub Pages。

若部署於子路徑（如 `username.github.io/repo-name`），需設定環境變數：

```bash
NEXT_PUBLIC_BASE_PATH=/repo-name
```
