---
title: "Git `rebase`、`reset`、`revert` 差異"
date: "2026-03-24"
category: "Backend"
tags: ["Spring Boot", "Logback"]
summary: "| 指令 | 作用 | 影響範圍 | 是否改變歷史 | 是否刪除 commit | 適用場景 |"
published: true
---

# Git `rebase`、`reset`、`revert` 差異

## Git `rebase`、`reset`、`revert` 差異總表

| 指令 | 作用 | 影響範圍 | 是否改變歷史 | 是否刪除 commit | 適用場景 |
|------|------|----------|--------------|--------------|----------|
| `git rebase` | **變更基底，整理提交歷史** | 影響當前分支的 commit 歷史 | ✅ 會改變 commit ID | ❌ 不刪除 commit，但會重新應用 | 讓分支與 `master` 對齊、保持整潔 |
| `git reset` | **回到指定提交，可能刪除變更** | 影響當前分支與工作區 | ✅（如果是 `--hard`） | ✅（`--hard` 會刪除 commit） | 退回錯誤提交、清除變更 |
| `git revert` | **新增反向 commit 來撤銷變更** | 影響當前分支，但保留歷史 | ❌ 不改變歷史 | ❌ 不刪除 commit，只新增還原 commit | 需要保留歷史，但又要撤銷某次變更 |

---

## 連續測試驗證方法與案例

### **初始化 Git 儲存庫**
```bash
git init test-repo
cd test-repo
echo "Initial commit" > file.txt
git add file.txt
git commit -m "Initial commit"
```

---

### 1. 測試 `git rebase`
#### **情境**
你在 `feature` 分支開發，但 `master` 有新變更，你想讓 `feature` 對齊 `master`。

#### **步驟**
```bash
git checkout -b feature
echo "Feature change" >> file.txt
git commit -am "Add feature change"

git checkout master
echo "Master update" >> file.txt
git commit -am "Update master"

git checkout feature
git rebase master
```
#### **預期結果**
- `feature` 分支的變更會重新套用到 `master` 的最新 commit 之後。
- `git log --oneline --graph` 會顯示 **線性的歷史**（沒有 merge commit）。

#### **測試方法**
- 在 `feature` 分支執行 `git log --oneline --graph`，確認歷史是否保持直線化。
- 若發生衝突，手動解決後執行 `git rebase --continue`。

#### **口語解讀**
- 當我正在 feature 上進行開發，而我現在在 feature 上使用 rebase master，那麼我就會以 master 當作基底，與而我目前分支上與最新的 master 差異的部分，就會被標記成修改的部分(可能會有衝突要修改)。而我 feature 的線，就會與master的線合併，變成一條直線。

---

### 2. 測試 `git reset`
#### **情境**
你誤提交了一個錯誤的 commit，想要撤回它。

#### **步驟**
```bash
echo "Wrong change" >> file.txt
git commit -am "Wrong commit"

git reset --soft HEAD~1  # 取消最近的 commit，保留變更
git status  # 變更應該還在
```
```bash
git reset --hard HEAD~1  # 取消最近的 commit，並且丟棄變更
git status  # 變更應該消失
```
#### **預期結果**
- `--soft`：最近的 commit 會消失，但變更仍然存在。
- `--hard`：最近的 commit 和變更都消失，回到前一個 commit 的狀態。

#### **測試方法**
- 執行 `git log --oneline`，確認 commit 是否真的被移除。
- 執行 `git status`，檢查變更是否仍然存在或消失。

#### **口語解讀**
- 當我在 git 上使用 reset --soft HEAD~1，那麼我就會取消最近的 commit，但是我所做的變更，就會保留在我的工作區。
- 而當我在 git 上使用 reset --hard HEAD~1，那麼我就會取消最近的 commit，並且丟棄我所做的變更。
- 但要注意，這都是在本地端的操作，如果已經推送到遠端，那麼就要使用 git revert 來撤銷 commit。

---

### 3. 測試 `git revert`
#### **情境**
你已經推送了一個錯誤的 commit，但不能刪除它，只能撤銷它的變更。

#### **步驟**
```bash
echo "Bad change" >> file.txt
git commit -am "Bad commit"

git revert HEAD  # 產生一個新的 commit，撤銷最近的變更
git log --oneline  # 應該會看到一個新的 "Revert ..." commit
```
#### **預期結果**
- `git log` 會顯示一個新的「Revert」commit，而原來的 commit 仍然存在。

#### **測試方法**
- 執行 `git log --oneline`，確認 `Revert` commit 是否存在。
- 檢查檔案是否回復到原始狀態。

#### **口語解讀**
- 簡單說就是重新作一個新的修改，這個修改就是將原本的錯誤修改撤銷掉的修改，再重新 commit 上去。

## **結論**
從 `git init` 開始，你可以按步驟執行測試，來理解 `rebase`、`reset`、`revert` 的實際效果！ 🚀
