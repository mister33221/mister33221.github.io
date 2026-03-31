---
title: "iframe 嵌入場景下的 SSO 登入整合實踐"
date: "2026-03-30"
category: "Backend"
tags: ["Spring Boot", "JWT", "SSO", "iframe", "Angular", "Security"]
summary: "記錄如何讓多個外部平台透過 iframe 嵌入並完成 SSO 登入，包含雙層加密設計、中台二次驗證機制與安全防護實踐。"
published: true
---

## 背景

系統需要被整合進多個外部平台，這些平台的共同需求是：

1. 以 **iframe** 方式嵌入
2. 傳遞使用者的身份驗證資訊（SSO）
3. 同步使用者偏好設定（深色模式、渠道識別碼）
4. 確保跨域通訊安全

---

## 技術方案選擇

| 方案 | 主要問題 | 是否採用 |
|------|---------|---------|
| **iframe + postMessage** | 需要處理跨域 | **採用** |
| URL 參數直接傳遞 | 敏感資訊暴露在 URL；長度限制 | 否 |
| LocalStorage 共享 | 跨域無法共享；安全風險高 | 否 |
| Cookie + Domain | 跨主域無法使用；第三方 Cookie 限制 | 否 |

選擇 iframe + postMessage 的理由：可驗證訊息來源（origin）、雙向通訊、W3C 標準、父子頁面各自獨立。

---

## 整體架構

```
Parent Frame（外部渠道）
    │  POST /sso/validate
    ▼
Channel Service（後端驗證層）
    │  解密身份資料
    │  SSO 中台二次驗證（僅 Production）
    │  回傳自動跳轉 HTML
    ▼
Frontend（Angular，Child Frame）
    │  接收 ?token=<JWT>
    │  解析並初始化應用狀態
    ▼
    主應用頁面
```

---

## 完整登入流程

```
[Parent Frame]      [Channel Service]           [Frontend]
    │                     │                         │
    │ 1. 取得加密參數     │                         │
    ├────────────────────>│                         │
    │<────────────────────┤                         │
    │   加密後的身份資料  │                         │
    │                     │                         │
    │ 2. 提交登入         │                         │
    ├────────────────────>│                         │
    │   POST /sso/validate│                         │
    │                     │                         │
    │                     │ 3. 解密身份資料         │
    │                     │ 4. 查詢補充使用者資料   │
    │                     │ 5. SSO 中台驗證（prod） │
    │                     │ 6. 重新加密             │
    │                     │ 7. 產生 JWT             │
    │                     │ 8. 產生重導向 HTML      │
    │<────────────────────┤                         │
    │   HTML（自動跳轉）  │                         │
    │                     │                         │
    │ 9. iframe 載入      │   10. /?token=<JWT>    │
    │                     │ ──────────────────────>│
    │                     │        11. 解析 JWT     │
    │                     │        12. 存入 storage │
    │                     │        13. 套用偏好設定 │
    │                     │        14. 進入主頁面   │
```

---

## 核心實作

### 後端：驗證流程

業務邏輯分五步：

1. **解密** — 解開 Parent Frame 傳來的 AES 加密資料，取出使用者身份（`user-data`）與偏好設定
2. **補充資料** — 向內部服務查詢使用者補充資訊；查詢失敗不中斷流程，僅記錄 log
3. **重新加密** — 將補充後的 `user-data` 重新加密
4. **SSO 中台驗證** — 僅 Production 環境執行，驗證不通過則回傳錯誤頁
5. **產生 JWT + 回傳 HTML** — 將 `user-data` 打包進 JWT，回傳可自動跳轉的 HTML

```java
public String processLogin(String encryptedData, String profile) throws Exception {

    // 1. 解密
    UserData userData = tokenUtil.decrypt(encryptedData, profile);

    // 2. 補充使用者資料（失敗不阻斷）
    try {
        String supplementInfo = internalClient.fetchSupplementInfo(userData.getUserId());
        userData.merge(supplementInfo);
    } catch (Exception e) {
        log.debug("Failed to fetch supplement info: {}", e.getMessage());
    }

    // 3. 重新加密
    EncryptedPayload encrypted = tokenUtil.encrypt(userData);

    // 4. SSO 中台驗證（prod only）
    if (ssoValidateEnabled) {
        boolean valid = ssoClient.validate(userData.getSsoToken());
        if (!valid) {
            return generateRedirectHtml("invalid", encrypted, userData);
        }
    }

    // 5. 產生 JWT 並回傳跳轉 HTML
    return generateRedirectHtml("ok", encrypted, userData);
}
```

幾個值得注意的設計決策：

**補充資料查詢失敗不阻斷登入**：補充資訊是次要資料，取不到不應讓使用者登入失敗。

**`@PostConstruct` fail-fast**：

```java
@PostConstruct
public void validateProductionConfig() {
    if ("production".equals(activeProfile) && !ssoValidateEnabled) {
        throw new IllegalStateException(
            "CRITICAL: SSO validation MUST be enabled in production!");
    }
}
```

安全配置錯誤在服務啟動時就暴露，不等到真實流量打進來。

**MDC 補充 Transaction ID**：這支 API 來自外部平台，請求不含標準追蹤 header，手動補入讓 log 可串接。

### 後端：回傳自動跳轉 HTML

不回 JSON，直接回一個 HTML，讓 iframe 自己跳轉：

```java
private String generateRedirectHtml(String status, EncryptedPayload payload, UserData userData) {
    String token = jwtUtil.generate(payload, userData);
    String encodedToken = URLEncoder.encode(token, StandardCharsets.UTF_8);
    String redirectUrl = buildRedirectUrl(userData.getPageCode(), encodedToken);
    return String.format(
        "<!DOCTYPE html><html><head>" +
        "<script>window.onload=function(){window.location.href='%s';}</script>" +
        "</head><body></body></html>",
        redirectUrl
    );
}
```

外部平台把回傳內容塞進 `iframe.srcdoc`，瀏覽器自動跳轉，父頁面不需要任何 JavaScript 介入。

### 前端：初始化狀態

Angular 應用啟動時從 URL query 取出 JWT，解析 payload 並初始化應用狀態：

```typescript
ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
        const { token } = params;

        if (token) {
            this.storage.set('Authorization', token);

            const isDarkMode = this.parseTokenField<boolean>(token, 'isDarkMode') ?? false;
            this.storage.set('isDarkMode', String(isDarkMode));

            const channelCode = this.parseTokenField<string>(token, 'channelCode') ?? '';
            this.storage.set('channelCode', channelCode);

            this.themeService.apply(isDarkMode);
        } else {
            // 無 token：從 storage 恢復先前狀態
            const stored = this.storage.get('isDarkMode');
            if (stored !== null) this.themeService.apply(stored === 'true');
        }
    });
}
```

---

## 雙層加密機制

```
Parent Frame 傳入的使用者資料
    ↓
【第一層】AES 對稱加密
    傳輸至 Channel Service 後解密 → 補充資料 → 重新加密
    ↓
【第二層】JWT 簽章（HS256）
    URL 參數傳至 Frontend
```

- **第一層**：保護傳輸內容，帶 checksum 驗完整性
- **第二層**：帶過期時間（1 小時），Frontend 解析後存入 storage

敏感資訊在任何環節都不以明文暴露於 URL 或 log 中。

---

## 安全設計重點

### postMessage 來源驗證

```javascript
window.addEventListener('message', function(event) {
    const allowedOrigins = ['https://your-app.example.com'];

    if (!allowedOrigins.includes(event.origin)) {
        console.warn('拒絕未知來源:', event.origin);
        return;
    }

    if (event.data?.type === 'NAVIGATE') {
        handleNavigation(event.data.url);
    }
});
```

### CSP frame-ancestors

```nginx
add_header Content-Security-Policy "
    frame-ancestors 'self' https://parent.example.com;
    connect-src 'self' https://api.example.com;
" always;
```

`frame-ancestors` 是比 `X-Frame-Options` 更現代的 Clickjacking 防護，同時限制允許嵌入的來源。

### 生產環境安全清單

- SSO 中台二次驗證強制啟用（啟動時即檢查）
- 強制 HTTPS + HSTS
- JWT 有效期 1 小時
- 敏感資訊不記錄於 log
- 定期輪換 JWT Secret

---

## 已知限制與改進方向

| 問題 | 說明 | 改進方向 |
|------|------|---------|
| JWT 無法主動撤銷 | Stateless token，過期前無法失效 | 引入 Token 黑名單（Redis） |
| postMessage targetOrigin 為通配符 | 子頁面發訊息時用 `'*'` | 改為明確指定來源 |
| Storage token 可被 XSS 讀取 | token 存在 localStorage 有風險 | 評估改用 HttpOnly Cookie |
| 無 CSRF Token | 目前依賴 JWT 驗證 | 加入雙重驗證 |

---

## 小結

這個方案的核心挑戰是在「使用者無感」的前提下把安全做到位：

1. **回傳 HTML 而非 JSON**：讓 iframe 自主跳轉，解耦父子頁面
2. **`@PostConstruct` fail-fast**：安全配置錯誤在啟動時就爆
3. **補充資料查詢失敗不阻斷登入**：次要資訊不影響主流程可用性
4. **MDC 補充 Transaction ID**：外部入口無標準 header，手動補上保持 log 可追蹤
