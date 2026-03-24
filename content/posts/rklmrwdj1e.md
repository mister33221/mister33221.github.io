---
title: "Git Tag 使用指南"
date: "2026-03-24"
category: "Tool"
tags: ["Git"]
summary: "Git Tag 用於標記特定的 commit，常用於版本發布與里程碑標記。"
published: true
---


# Git Tag 使用指南

## **1. 什麼是 Git Tag？**
Git Tag 用於標記特定的 commit，常用於版本發布與里程碑標記。

### **Git Tag 的用途**
- 標記重要的版本，例如 v1.0.0、v2.1.0
- 追蹤發布版本，方便回滾
- 配合 CI/CD，自動化部署

### **Git Tag vs. Git Branch 的差異**
| 特性 | Git Tag | Git Branch |
|------|--------|------------|
| 可變性 | 固定，標記特定 commit | 可變，可持續開發 |
| 用途 | 標記版本，作為里程碑 | 管理開發進度 |
| 刪除影響 | 不影響歷史 | 影響版本控制 |

> 可變性        
> 指的是標籤一旦被創建，它就會永久指向該 commit，不會自動變更。這與 branch（分支）不同，因為 branch 會隨著新 commit 的提交而移動 HEAD 指標，但 tag 則始終固定指向一個特定的 commit。

## **2. Git Tag 的種類**
### **輕量標籤（Lightweight Tag）**
- 只是一個指向 commit 的指標，不包含額外資訊。
- 建立方式：
  ```bash
  git tag v1.0.0
  ```

### **註釋標籤（Annotated Tag）**
- 包含標籤訊息、作者、日期等。
- 建立方式：
  ```bash
  git tag -a v1.0.0 -m "正式發布 v1.0.0"
  ```

### **簽署標籤（Signed Tag）**
- 透過 GPG 簽名來驗證標籤。
- 建立方式：
  ```bash
  git tag -s v1.0.0 -m "正式發布 v1.0.0"
  ```
- Signed tag 跟 Annotated tag 有一點點不一樣，Signed tag 是用 GPG 金鑰來簽名，通常是用在更正式的情境，如企業正式版本的發布。

### **動態標籤（Floating Tag, 軟標籤）**
- 通常是用來標記最近開發的 commit。他會隨著新的 commit 而移動。
- 通常不推送到遠端。只是用於 local 開發時的標記。
- 他沒有什麼特別的建立方法，就跟一般的標籤建立一樣，只是沒有被 push 到遠端。

## **3. 如何建立 Git Tag**
```bash
git tag -a <tagname> -m "標籤訊息"
```

## **4. 查詢與管理 Git Tag**
- 列出所有標籤：
  ```bash
  git tag
  ```
- 搜尋特定標籤：
  ```bash
  git tag -l "v1.*"
  ```
- 查看標籤資訊：
  ```bash
  git show <tagname>
  ```

## **5. 推送與刪除 Git Tag**
### **推送標籤**
```bash
# 推送特定標籤
git push origin <tagname>
# 推送所有標籤
git push origin --tags
```
### **刪除標籤**
```bash
# 刪除本地標籤
git tag -d <tagname>
# 刪除遠端標籤
git push --delete origin <tagname>
```

## **7. Git Tag 進階應用**
- 在各種環境中，可能會因為頻繁的修改，而一直不斷的部署版本，為了不要亂掉，就可以使用 tag 來標記每次部署的版本
- 這樣就可以方便的回滾到特定版本，或者查看特定版本的變更
- 我們可以用下面這樣的方法，在分支上進行紀錄

### **管理 SIT、UAT、PROD 版本**
- **SIT 版本**：
  ```bash
  git tag -a sit-1.0.0 -m "SIT 測試版本"
  git push origin sit-1.0.0
  ```
- **UAT 版本**：
  ```bash
  git tag -a uat-1.0.0 -m "UAT 測試版本"
  git push origin uat-1.0.0
  ```
- **正式版本（PROD）**：
  ```bash
  git tag -a prod-1.0.0 -m "正式上線版本"
  git push origin prod-1.0.0
  ```


## **9. Git Tag 的常見問題與解決方案**
### **為什麼 `git push --tags` 沒有推送標籤？**
- 需要先確保標籤已正確建立。
- 可以手動推送：
  ```bash
  git push origin <tagname>
  ```

### **如何修復錯誤的標籤？**
- 刪除並重新標記：
  ```bash
  git tag -d <tagname>
  git push --delete origin <tagname>
  git tag -a <tagname> -m "正確標籤"
  git push origin <tagname>
  ```

### **遠端刪除標籤後本地仍然顯示，如何同步？**
- 執行以下指令同步本地標籤：
  ```bash
  git fetch --prune --tags
  ```


###### `Git` `Tag` `版本控制` `教學` `指南` `開發` `程式設計` `版本標記` `版本發布` `里程碑` `標籤`
