# CLAUDE.md — 個人網站 AI 協作規範

> 這份檔案是這個 repo 的 AI 協作合約。每次對話開始前請先讀完。

---

**溝通規則：**

- **必須用繁體中文**，不用簡體，不用英文回答（程式碼、技術詞彙、專有名詞除外）
- 說話直接、不繞圈子，但可以帶一點輕鬆的語氣
- 偶爾（不是每次）可以用電影、音樂、登山來做比喻，讓說明更生動
- 遇到需要確認的事情，不要自己猜——直接問
- 回答要精準，不要為了顯示努力而說一大堆廢話
- 遇到使用者說的話有點模糊時，可以小小吐槽一下再追問，但要友善

---

## 🗂 專案快速導覽

### 這是什麼

個人作品集 + 技術部落格，靜態網站，部署在 GitHub Pages。

| 項目 | 說明 |
|------|------|
| 框架 | Next.js 14.2.5（App Router，靜態 export） |
| 語言 | TypeScript |
| 樣式 | CSS Modules + Design Token |
| 主題 | 深色系（暗炭背景、ember 橙、稻草黃） |
| 部署 | GitHub Pages（`output: 'export'`） |

---

## 📁 關鍵檔案位置

### 內容資料

| 路徑 | 說明 |
|------|------|
| `content/posts/*.md` | 技術部落格文章（Markdown + YAML frontmatter） |
| `content/culture/*.md` | 文化隨筆（電影、音樂、書籍等） |
| `content/projects/*.md` | 專案詳細說明頁 |
| `content/bio.md` | 個人簡介內文 |
| `data/resume.json` | 工作經歷、學歷、技能、語言 |
| `data/projects.json` | 專案索引（卡片資訊、技術標籤、連結） |
| `data/profile.json` | 個人基本資料（供 profile 頁使用） |

### 程式碼

| 路徑 | 說明 |
|------|------|
| `src/app/layout.tsx` | Root layout，SEO metadata 在這裡設 |
| `src/app/globals.css` | Design tokens、全域樣式 |
| `src/app/icon.svg` | Favicon（Next.js App Router 自動抓取） |
| `src/lib/posts.ts` | 讀取部落格文章的所有邏輯 |
| `src/lib/markdown.ts` | Markdown 渲染（highlight.js + TOC 抽取） |
| `src/lib/culture.ts` | 讀取文化隨筆的邏輯 |
| `src/lib/projects.ts` | 讀取專案資料的邏輯 |
| `next.config.mjs` | Next.js 設定（靜態 export、base path） |

### 路由對應

| URL | 對應檔案 |
|-----|----------|
| `/` | `src/app/page.tsx` |
| `/blog` | `src/app/blog/page.tsx` |
| `/blog/[slug]` | `src/app/blog/[slug]/page.tsx` |
| `/culture` | `src/app/culture/page.tsx` |
| `/culture/[slug]` | `src/app/culture/[slug]/page.tsx` |
| `/projects` | `src/app/projects/page.tsx` |
| `/profile` | `src/app/profile/page.tsx` |
| `/resume` | `src/app/resume/page.tsx` |

### 元件

| 路徑 | 說明 |
|------|------|
| `src/components/layout/` | Navbar、Footer |
| `src/components/blog/` | ArticleContent、PostCard、TOC、BlogListClient |
| `src/components/culture/` | CultureCard、RatingStars、CultureListClient |
| `src/components/projects/` | ProjectsClient（含篩選邏輯） |
| `src/components/particles/` | EmberParticles（視覺效果） |
| `src/components/ui/` | Tag、GiscusComments、PrintButton |

---

## ✍️ 常見任務怎麼做

### 新增一篇部落格文章

1. 在 `content/posts/` 建立 `{slug}.md`
2. 填入 frontmatter：

```yaml
---
title: "文章標題"
date: "YYYY-MM-DD"
category: "Backend"          # Backend / Architecture / Performance / Notes
tags: ["Spring Boot", "Java"]
summary: "一句話摘要"
published: true
---
```

3. `published: false` 可以先存草稿不上線

**slug 命名規則：** 可以用英文描述性名稱（如 `spring-boot-redis-cache`），或隨機 ID 都可以。

### 新增一篇文化隨筆

和 blog 一樣，放到 `content/culture/`，frontmatter 欄位請參考現有文章。

### 更新工作經歷

編輯 `data/resume.json` 中的 `experience[].points` 陣列，字串格式，直接寫中文。

### 新增專案

1. 在 `data/projects.json` 新增一筆物件（參考現有格式）
2. 如果需要詳細說明頁，在 `content/projects/` 建立對應 `.md`

---

## 🎨 設計系統速查

### 顏色（CSS Variables）

| 變數 | 色值 | 用途 |
|------|------|------|
| `--bg-primary` | `#0f1210` | 頁面背景 |
| `--bg-secondary` | `#1a1a18` | 次要背景 |
| `--bg-card` | `#1e1e1b` | 卡片背景 |
| `--text-primary` | `#e2ddd4` | 主要文字 |
| `--text-secondary` | `#7a7870` | 次要文字 |
| `--accent-1` | `#b5a07a` | 稻草黃（強調） |
| `--accent-2` | `#c4622d` | ember 橙（互動） |
| `--accent-3` | `#8f4a2a` | 焦糖棕 |
| `--moss` | `#5a6b4f` | 苔蘚綠（Culture 專用） |
| `--border` | `#2a2a26` | 邊框 |

### 字型

| 變數 | 字型 | 用途 |
|------|------|------|
| `--font-display` | Cormorant Garamond | 標題、Logo |
| `--font-serif` | Noto Serif TC | 內文標題 |
| `--font-sans` | Noto Sans TC | 一般內文 |
| `--font-mono` | JetBrains Mono | 程式碼 |

---

## ⚠️ 注意事項

- **不要動 `next.config.mjs`** 的 `output: 'export'`，這是靜態部署必要設定
- CSS 樣式一律用 **CSS Modules**（`*.module.css`），不要用 inline style 或全域 class
- 圖片放 `public/images/`，引用時用相對路徑 `/images/xxx.jpg`
- 新增 `Client Component` 時，記得在檔案最上方加 `'use client'`
- Markdown 檔案的 `published: false` 不會出現在網站上，可以安心存草稿
- `data/projects.json` 的 `description` 欄位是指向 `content/projects/` 的路徑，不是直接寫文字

---

## 🚀 開發指令

```bash
npm run dev     # 本地開發（http://localhost:3000）
npm run build   # 靜態 build（輸出到 out/）
```

部署是 push 到 `main` 分支後由 GitHub Actions 自動處理。

---

## 📝 開發規範

- 改東西前先讀過現有程式碼，不要自己發明新模式
- 不要多加「你沒說要的」功能
- 不要新增不必要的套件
- 樣式改動要用 CSS Modules，不要汙染全域 class
- 程式碼可以不加 comment，除非邏輯真的不直觀
