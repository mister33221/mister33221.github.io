## 背景

團隊的 CI/CD 流程依賴大量 Bash 腳本，散落在不同 repo 中，沒有統一的介面。新人入職時需要花 1-2 天才能理解所有腳本的用途和使用方式。

## 技術架構

用 Rust 寫了一個統一的 CLI 工具 `dev`，包含以下子命令：

```
dev setup          # 設定本地開發環境
dev env <name>     # 切換環境設定
dev build          # 構建 Docker 映像
dev deploy <env>   # 部署到指定環境
dev logs <service> # 查看服務日誌
```

所有設定統一放在根目錄的 `dev.config.toml`，由各 repo 自行定義。

## 遇到的難題

### 難題 1：跨平台支援

團隊成員使用 macOS 和 Linux，但 CI 跑在 Linux。用 GitHub Actions 的 matrix strategy 測試各個平台，並使用 `dirs` crate 處理路徑差異。

## 學到了什麼

好的內部工具文件比功能本身更重要。工具完成後，我錄了一段 5 分鐘的介紹影片，比任何文字說明都更有效地讓團隊上手。
