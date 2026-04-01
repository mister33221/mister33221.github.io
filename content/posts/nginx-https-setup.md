---
title: "Nginx HTTPS 設定"
date: "2026-03-24"
category: "DevOps"
tags: ["DevOps", "Docker"]
summary: "以下是教學範例，說明如何配置 Nginx 支援 HTTPS 並進行反向代理。"
published: true
---

# Nginx HTTPS 設定

以下是教學範例，說明如何配置 Nginx 支援 HTTPS 並進行反向代理。

## 基本設定

在配置 Nginx 前，請確保以下條件已滿足：

1. 安裝 Nginx。
2. 已申請並取得有效的 SSL 憑證（`<憑證路徑>` 和 `<私鑰路徑>`）。
   - 通常我們會把憑證放在 `/etc/ssl/certs` 目錄下。
3. 確保後端服務正常運行（例如 Spring Boot）。

---

## Nginx 配置檔案

以下為範例 Nginx 配置：

```nginx
worker_processes  1;  # 工作進程數量，建議與 CPU 核心數一致。

events {
    worker_connections  1024;  # 每個工作進程的最大連接數。
}

http {
    include       mime.types;  # 載入 MIME 類型定義。
    default_type  application/octet-stream;  # 預設 MIME 類型。

    sendfile        on;  # 啟用高效文件傳輸。
    keepalive_timeout  65;  # 保持連接的超時時間（秒）。

    # HTTPS 服務設定
    server {
        listen       443 ssl;  # 啟用 HTTPS，監聽 443 端口。
        server_name  <你的域名>;  # 定義服務器的域名。

        # SSL 憑證路徑
        ssl_certificate      <憑證路徑>;  # 替換為你的 SSL 憑證路徑。
        ssl_certificate_key  <私鑰路徑>;  # 替換為你的 SSL 私鑰路徑。

        # SSL 配置
        # TLSv1.2 1.0
        ssl_session_timeout  5m;  # SSL 會話超時時間（分鐘）。
        ssl_protocols TLSv1.2 TLSv1.3;  # TLS(Transport Layer Security) 協議版本，
        ssl_ciphers  HIGH:!aNULL:!MD5;  # 定義安全加密套件。
        ssl_prefer_server_ciphers  on;  # 優先使用服務器的加密套件。

        # 靜態網站設定
        location / {
            root   <靜態文件路徑>;  # 替換為你的網站文件路徑。
            index  index.html index.htm;  # 設定預設首頁文件。
            try_files $uri /index.html;  # 若找不到文件則回退到 index.html。
        }

        # API 反向代理
        location /api/ {
            proxy_pass http://<後端服務地址>:<端口>/;  # 替換為後端服務地址。要注意這樣的設定是指 http://<後端服務地址>:<端口>/api/ 被代理到 http://<後端服務地址>:<端口>/。就沒有 /api/ 這個路徑了。
            proxy_set_header Host $host; # 將原始請求的 Host 標頭傳遞給後端服務。
            proxy_set_header X-Real-IP $remote_addr; # 客戶端的真實 IP 地址傳遞給後端服務，設置在 X-Real-IP 標頭中。
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; # 傳遞所有代理的 IP 地址鏈。
            proxy_set_header X-Forwarded-Proto $scheme; # 設置 X-Forwarded-Proto 標頭，傳遞請求的協議（HTTP 或 HTTPS）。scheme 就是協議名稱，http 或 https。
        }

        # 自訂錯誤頁面(Optional)
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   <錯誤頁文件路徑>;  # 替換為你的錯誤頁文件路徑。
        }
    }
}
```

> TLS 1.0：  
> 發布於 1999 年，是 SSL 3.0 的升級版本。  
> 已知存在多個安全漏洞，如 POODLE 攻擊。  
> 不再被認為是安全的，應避免使用。
>
> TLS 1.1：  
> 發布於 2006 年，對 TLS 1.0 進行了小幅改進。  
> 增加了對 CBC (Cipher Block Chaining) 模式的防護。  
> 仍然存在一些已知的安全問題，逐漸被淘汰。
>
> TLS 1.2：  
> 發布於 2008 年，是目前最廣泛使用的版本。  
> 支持更強的加密算法和更安全的哈希函數。  
> 增加了 AEAD (Authenticated Encryption with Associated Data)支持，如 GCM (Galois/Counter Mode)。  
> 被認為是安全的，並且大多數現代應用程序都支持。
>
> TLS 1.3：  
> 發布於 2018 年，是最新的版本。  
> 簡化了握手過程，減少了延遲。  
> 移除了不安全的加密算法和協議，如 RC4 和 CBC。  
> 提供了更強的安全性和更好的性能。  
> 推薦使用，特別是在需要高安全性和性能的應用中。

## 設定步驟

1. **配置域名與 SSL 憑證**

   - 將 `<你的域名>` 替換為實際的域名。
   - 確保憑證 (`<憑證路徑>`) 和私鑰 (`<私鑰路徑>`) 路徑正確。

2. **配置靜態文件與後端服務**

   - 確保靜態文件存放於 `<靜態文件路徑>`，並存在 `index.html`。
   - 將 `<後端服務地址>` 和 `<端口>` 替換為後端服務的實際地址。

3. **配置完 Nginx config 重啟 Nginx**

   - 重啟 Nginx 服務。

   ```bash
   ./nginx -s quit # 關閉 Nginx 服務
   ./nginx -c /usr/local/nginx/nginx.conf # 使用指定配置文件啟動 Nginx
   ```

4. **測試 HTTPS 服務**  
   使用瀏覽器訪問 `https://<你的域名>`，檢查是否能正常連線。
