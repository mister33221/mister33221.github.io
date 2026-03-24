---
title: "產出兩個 Git 分支間的程式碼差異報告（含繁體中文 UTF-8 處理）"
date: "2026-03-24"
category: "Backend"
tags: ["Spring Boot", "Logback"]
summary: "這篇文章會教你如何使用 diff2html 工具，產生兩個 Git 分支之間的程式碼差異"
published: true
---

# 產出兩個 Git 分支間的程式碼差異報告（含繁體中文 UTF-8 處理）


這篇文章會教你如何使用 diff2html 工具，產生兩個 Git 分支之間的程式碼差異報告，並輸出成 HTML 檔案，方便查看或提供給他人（如客戶）。同時也會處理繁體中文亂碼的問題。

## 🧰 工具準備

### 1. 安裝 Node.js 與 npm

前往 https://nodejs.org 下載 LTS 版本並安裝。安裝完成後，請打開終端機（Command Prompt / Git Bash / PowerShell）確認版本：

```bash
node -v
npm -v
```

### 2. 安裝 diff2html-cli

這是將 Git 差異輸出成 HTML 格式的指令工具。

```bash
npm install -g diff2html-cli
```

安裝完成後，可執行以下指令來確認：

```bash
diff2html --version
```

## 🔄 產生兩個分支之間的差異報告

開啟 Git bash 並使用以下指令會比較兩個 Git branch 或 tag（例如 sit 與 uat），並輸出成 diff-report.html 檔案：

```bash
git diff <old-branch/tag-name> <new-branch/tag-name> | diff2html -i stdin -f html -o stdout > diff-report.html
```

產出修改的完整檔案，且包含目錄結構
```bash
git diff --name-only <old-branch/tag-name> <new-branch/tag-name> | xargs -I {} cp --parents {} /d/work/projects/RSN/formal-dev/diff-output
```

## ⚠️ 處理繁體中文亂碼（UTF-8 問題）

如果你產出的 HTML 報告裡，中文顯示為「�」或「???」，請依照以下步驟處理：

### ✅ 步驟 1：確認程式碼檔案是 UTF-8 編碼

- 使用 VS Code 開啟你的原始檔（例如 .ts, .java, .html）。
- 看右下角的檔案編碼是否為「UTF-8」。
- 若是「Big5」或「ANSI」，請點右下角 →「轉換成 UTF-8」→ 儲存。

### ✅ 步驟 2：設定 Git 支援中文輸出

在 Git bash 中使用以下指令
```bash
git config --global core.quotepath false
git config --global i18n.logOutputEncoding utf-8
```

### ✅ 步驟 3：重新產出報告

再次執行以下指令即可：

```bash
git diff sit uat | diff2html -i stdin -f html -o stdout > diff-report.html
```

## 📂 檢視報告

使用瀏覽器打開 diff-report.html，你就能看到完整的程式碼修改紀錄與 diff 差異，包含繁體中文。

也可以點選「列印為 PDF」，方便寄送或存檔。

## 📝 小結

- diff2html 是產出 Git 差異報告的好幫手
- 輸出前請確保程式碼為 UTF-8，以避免繁體中文亂碼
- 可將此流程整合成批次腳本，自動化產出報告

## 📌 延伸閱讀

- [diff2html GitHub](https://github.com/rtfpessoa/diff2html)

###### `git` `diff2html`
