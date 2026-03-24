---
title: "[AI]技能下載協定（Skills Protocol）"
date: "2026-03-24"
category: "Tool"
tags: ["Git"]
summary: "以下將會以 Antigravity 為例，介紹 Skills 的概念與實踐。"
published: true
---

# [AI]技能下載協定（Skills Protocol）

## 前言

以下將會以 Antigravity 為例，介紹 Skills 的概念與實踐。
其他 AI 工具包含 Codex、Cursour、github copilot 等等也都有一樣的功能。
但是掃描 skills 的資料夾結構可能會有些微不同，要注意名稱一致，才能順利觸發。
到各官網的 DOC 網頁都有詳細說明。

## —— 以 Antigravity 為例的代理覺醒指南

> 「我需要駕駛直升機。」
>
> ——「上傳中…完成。」

在 AI 世界裡，我們總是把所有知識一次灌進模型的大腦。
當我們想要完成某一種特定任務的時候，可能會有多種方法，
但我們到底想要"怎麼完成"、"需要哪些先備知識"，這些都不確定。

而現在我們可以把這些任務的「完成方法」寫成一個個獨立的模組，當代理需要完成某個任務時，就會去下載對應的模組來執行。

不但可以規範代理的行為，還能讓它在需要時才讀取相關知識，保持大腦的輕量化。

> 還很省 token -> 省錢!

這，就是 **Skills**。

---

# 一、什麼是 Skills？

**Skill 是一個可插拔的能力模組**。

它是一個資料夾，裡面包含：

* 任務執行規則
* 最佳實踐（Best Practices）
* 可選的腳本工具
* 補充文件或範本

當代理（Agent）判斷某個任務需要特定專業能力時，它會：

1. 掃描可用 Skills 清單
2. 讀取符合任務的 Skill
3. 按照 Skill 中的規範執行

這種模式稱為：

> **Progressive Disclosure（漸進式揭露）**

代理不再需要一次承載全部知識(現階段也不可能)，而是在需要時得到對應能力。

就像尼歐學會功夫那樣。




---

# 二、Skills 解決了什麼問題？

## Skills 的核心價值總覽

| 面向 | 問題（沒有 Skills 時） | 解法（使用 Skills） |
|------|------------------------|----------------------|
| Context 控制 | 一次載入大量規範與文件，導致上下文污染與效能下降 | 僅在需要時動態載入能力（Progressive Disclosure） |
| 模組化 | 規範散落在 Prompt 中，難以維護 | 能力拆分為獨立 Skill，可版本控管與維護 |
| 成本控制 | 大量掃描定位問題，浪費 token，成本暴增 | 減少無效 Token 載入，降低費用 |
| 重複利用 | 相似 Prompt 重複撰寫 | 一個 Skill 可跨任務重複使用 |
| 團隊標準化 | 每人寫法不同，難以統一 | 透過 Skill 統一最佳實踐與格式 |

---

# 三、Skills 的實際架構

這裡先提供一個網站，其中有上萬個公開的 Skills，可以參考大家都是怎麼實作skill：

[https://skillsmp.com/](https://skillsmp.com/)

另外其中還有一個叫做 skill creator 的 skill，可以幫助你快速建立一個新的 skill，只要用自然語言告訴他想要實作的skill，就可以產生符合規格的 skill：

[skill-creator](https://skillsmp.com/skills/openclaw-openclaw-skills-skill-creator-skill-md)

---

Antigravity 支援兩種 Skill 作用範圍：

| 位置                                | 範圍   |
| --------------------------------- | ---- |
| `<workspace-root>/.agent/skills/` | 專案專屬 |
| `~/.gemini/antigravity/skills/`   | 全域技能 |

## 建立一個 Skill

資料夾結構如下：

```
.agent/skills/
└── my-skill/
    └── SKILL.md
```

最基本的 Skill 只需要一個 `SKILL.md`。

---

# 四、SKILL.md 的核心結構

每個 Skill 都需要 YAML Frontmatter：

```yaml
---
name: my-skill
description: Generates unit tests for Python code using pytest conventions.
---
```

## 欄位說明

| 欄位          | 是否必填 | 說明               |
| ----------- | ---- | ---------------- |
| name        | 否    | 技能識別名稱（預設為資料夾名稱） |
| description | 必填   | 讓代理判斷是否使用此技能     |

---

接著是詳細說明內容，例如：

```markdown
# My Skill

## When to use this skill
- Use when...

## How to use it
1. Do this
2. Do that
```

代理會在「需要時」完整讀取這段說明。

---

# 五、進階 Skill 結構

```
.agent/skills/my-skill/
├── SKILL.md
├── scripts/
├── examples/
└── resources/
```

## scripts/

放置：

* Python
* Bash
* 自動化工具

代理可以執行這些腳本。

這意味著——

> 代理不只會「說」，還會「做」。

## examples/

放置範例程式碼，讓代理參考模式。

## resources/

放置大型文件，例如：

* API 規格
* 公司內部規範
* 授權文件

代理只有在必要時才會讀取。

---

# 六、Skills 的運作流程

## 1️. Discovery

代理啟動時，只看到 Skill 名稱與 description。

## 2️. Activation

若 description 符合任務情境，代理才讀取 SKILL.md。

## 3️. Execution

代理按照 Skill 指令完成任務。

這種模式讓：

* 大腦保持輕量
* 決策更精準
* 成本更可控

---

# 七、安全性：提防史密斯探員


前面我們有說到，有開源的 Skills 市集，任何人都可以上傳技能模組。

而當我們要使用這些技能模組的時候，代理會去下載並執行裡面的腳本。

必須要非常小心，

因為這些能力模組若來自未知來源，可能暗藏：

* 惡意指令
* 機密資料外傳腳本
* 破壞性終端機操作

## 防禦機制

Antigravity 提供：

### 🔒 Request Review

所有危險操作需人工審核。

### 📜 Allow / Deny List

限制代理可使用的終端機指令。

例如：

* 禁止 `rm`
* 禁止外部上傳
* 限制網路請求

---

# 八、擺脫只是寫 prompt 的第一步

透過 Skills：

* 你的團隊最佳實踐可以模組化
* 內部 API 規範可以自動套用
* 安全政策可以強制執行

你不再只是寫 Prompt。

你是在打造「能力系統」。

---

# 九、範例

這是一個有被 skillsmp 收錄得 skill，協助產出符合 obsidian 的文件
```markdown
---
name: obsidian
description: Work with Obsidian vaults (plain Markdown notes) and automate via obsidian-cli.
homepage: https://help.obsidian.md
metadata:
  {
    "openclaw":
      {
        "emoji": "💎",
        "requires": { "bins": ["obsidian-cli"] },
        "install":
          [
            {
              "id": "brew",
              "kind": "brew",
              "formula": "yakitrak/yakitrak/obsidian-cli",
              "bins": ["obsidian-cli"],
              "label": "Install obsidian-cli (brew)",
            },
          ],
      },
  }
---

# Obsidian

Obsidian vault = a normal folder on disk.

Vault structure (typical)

- Notes: `*.md` (plain text Markdown; edit with any editor)
- Config: `.obsidian/` (workspace + plugin settings; usually don’t touch from scripts)
- Canvases: `*.canvas` (JSON)
- Attachments: whatever folder you chose in Obsidian settings (images/PDFs/etc.)

## Find the active vault(s)

Obsidian desktop tracks vaults here (source of truth):

- `~/Library/Application Support/obsidian/obsidian.json`

`obsidian-cli` resolves vaults from that file; vault name is typically the **folder name** (path suffix).

Fast “what vault is active / where are the notes?”

- If you’ve already set a default: `obsidian-cli print-default --path-only`
- Otherwise, read `~/Library/Application Support/obsidian/obsidian.json` and use the vault entry with `"open": true`.

Notes

- Multiple vaults common (iCloud vs `~/Documents`, work/personal, etc.). Don’t guess; read config.
- Avoid writing hardcoded vault paths into scripts; prefer reading the config or using `print-default`.

## obsidian-cli quick start

Pick a default vault (once):

- `obsidian-cli set-default "<vault-folder-name>"`
- `obsidian-cli print-default` / `obsidian-cli print-default --path-only`

Search

- `obsidian-cli search "query"` (note names)
- `obsidian-cli search-content "query"` (inside notes; shows snippets + lines)

Create

- `obsidian-cli create "Folder/New note" --content "..." --open`
- Requires Obsidian URI handler (`obsidian://…`) working (Obsidian installed).
- Avoid creating notes under “hidden” dot-folders (e.g. `.something/...`) via URI; Obsidian may refuse.

Move/rename (safe refactor)

- `obsidian-cli move "old/path/note" "new/path/note"`
- Updates `[[wikilinks]]` and common Markdown links across the vault (this is the main win vs `mv`).

Delete

- `obsidian-cli delete "path/note"`

Prefer direct edits when appropriate: open the `.md` file and change it; Obsidian will pick it up.
```

---

# 結語：吞下紅色藥丸

問題不是：

> AI 能做什麼？

而是：

> 你準備為它設計多少技能？

歡迎來到母體。

技能下載完成。
