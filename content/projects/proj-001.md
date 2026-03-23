## 專案背景

在大型專案中，管理多個環境的設定（`.env.local`、`.env.staging`、`.env.production`）一直是一件讓人頭痛的事。

現有的工具要麼太複雜（`direnv`），要麼功能太簡單（`dotenv`）。我想要一個**輕量、快速、不需要 shell 整合的 CLI 工具**，能夠：

- 切換不同環境的設定
- 顯示目前啟用的設定
- 支援加密儲存敏感的 key

## 技術架構

使用 Rust 的理由很簡單：**啟動時間要求 < 5ms**，而且 CLI 工具的複雜度不需要 GC。

設定檔使用 TOML 格式（Rust 生態系統的標準選擇），以 `serde` 做序列化/反序列化。

```
~/.config/ember/
├── config.toml          # 全域設定
└── projects/
    ├── my-project.toml  # 專案特定設定
    └── work-app.toml
```

核心資料結構：

```rust
#[derive(Serialize, Deserialize)]
struct ProjectConfig {
    name: String,
    envs: HashMap<String, EnvSet>,
    active: Option<String>,
}

#[derive(Serialize, Deserialize)]
struct EnvSet {
    vars: HashMap<String, EnvValue>,
}

#[derive(Serialize, Deserialize)]
#[serde(untagged)]
enum EnvValue {
    Plain(String),
    Secret { encrypted: String },
}
```

## 遇到的難題

### 難題 1：跨平台的設定檔路徑

不同作業系統有不同的 config 目錄慣例。解法是使用 `dirs` crate：

```rust
fn config_dir() -> PathBuf {
    dirs::config_dir()
        .expect("無法找到設定目錄")
        .join("ember")
}
```

### 難題 2：加密儲存

使用 system keychain（Keychain on macOS, libsecret on Linux, Windows Credential Manager）透過 `keyring` crate 統一介面。

## 學到了什麼

這個專案讓我深入理解了 Rust 的 `serde` 生態系統和 CLI 開發的最佳實踐。最大的收穫是：**好的 CLI 工具應該讓最常用的 case 最簡單**，而不是試圖支援所有可能的 case。
