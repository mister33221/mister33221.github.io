---
title: "[Nginx] 基礎介紹"
date: "2026-03-24"
category: "Backend"
tags: ["Spring Boot", "Logback"]
summary: "<!-- TOC -->"
published: true
---


# [Nginx] 基礎介紹

<!-- TOC -->

- [[Nginx] 基礎介紹](#nginx-%E5%9F%BA%E7%A4%8E%E4%BB%8B%E7%B4%B9)
    - [Load Balancer](#load-balancer)
    - [Nginx 介紹](#nginx-%E4%BB%8B%E7%B4%B9)
    - [安裝 Nginx](#%E5%AE%89%E8%A3%9D-nginx)
    - [查看 Nginx 的設定檔](#%E6%9F%A5%E7%9C%8B-nginx-%E7%9A%84%E8%A8%AD%E5%AE%9A%E6%AA%94)
    - [查看 Nginx 的預設的 html 歡迎頁](#%E6%9F%A5%E7%9C%8B-nginx-%E7%9A%84%E9%A0%90%E8%A8%AD%E7%9A%84-html-%E6%AD%A1%E8%BF%8E%E9%A0%81)
    - [如果我的網站還有包含一些靜態檔案，例如：圖片、CSS、JavaScript 等，我該如何部署到 Nginx 上呢？](#%E5%A6%82%E6%9E%9C%E6%88%91%E7%9A%84%E7%B6%B2%E7%AB%99%E9%82%84%E6%9C%89%E5%8C%85%E5%90%AB%E4%B8%80%E4%BA%9B%E9%9D%9C%E6%85%8B%E6%AA%94%E6%A1%88%E4%BE%8B%E5%A6%82%E5%9C%96%E7%89%87cssjavascript-%E7%AD%89%E6%88%91%E8%A9%B2%E5%A6%82%E4%BD%95%E9%83%A8%E7%BD%B2%E5%88%B0-nginx-%E4%B8%8A%E5%91%A2)
    - [Serving 靜態內容](#serving-%E9%9D%9C%E6%85%8B%E5%85%A7%E5%AE%B9)
    - [如果我想要使用網址來訪問不同的分頁呢?](#%E5%A6%82%E6%9E%9C%E6%88%91%E6%83%B3%E8%A6%81%E4%BD%BF%E7%94%A8%E7%B6%B2%E5%9D%80%E4%BE%86%E8%A8%AA%E5%95%8F%E4%B8%8D%E5%90%8C%E7%9A%84%E5%88%86%E9%A0%81%E5%91%A2)
    - [將 Angular 專案部署到 Nginx](#%E5%B0%87-angular-%E5%B0%88%E6%A1%88%E9%83%A8%E7%BD%B2%E5%88%B0-nginx)
    - [Load Balancer 流量分配](#load-balancer-%E6%B5%81%E9%87%8F%E5%88%86%E9%85%8D)

<!-- /TOC -->

以下我們先來舉幾個問題，讓大家了解為什麼我們需要一個 Nginx 插在 Client 和 Server 之間。

1. 當你開啟了 Airbnb 時，從你的手機發送一個 request，會經過網路、到達 Airbnb 的伺服器，然後 Airbnb 的伺服器會回傳 response 給你的手機。
    而現在 Airbnb 的用戶數量非常的龐大，如果我們只有一台 Server，那麼這台 Server 就會非常的忙碌。
    這時我們就需要增加 Server 的數量，讓每一台 Server 都可以處理一部分的 request，這樣就可以分散 Server 的負擔。
    那我們又該如何讓這些 Server 之間可以協同工作呢？這時就需要一個 Load Balancer 來幫忙了。
2. 現在大多數了網頁，為了安全，都會使用 HTTPS，這就表示 Server 和 Client 之間的資料都是加密的。當我們只有一台 Server，只需要安裝一個 SSL 憑證就可以了。
    但是當我們有多台 Server 時，我們就需要在每一台 Server 上都安裝 SSL 憑證，這樣就會變得非常的麻煩。
    這時我們就可以將 SSL 憑證安裝在 Load Balancer 上，然後再將 request 轉發給 Server，這樣就可以省去在每一台 Server 上安裝 SSL 憑證的麻煩。

## Load Balancer

Load Balancer 是一個位於 Client 和 Server 之間的裝置，它的主要功能是將 Client 發送的 request 分配給 Server，讓 Server 可以平均的處理 request。
Load Balancer 有很多種演算法，例如：Round Robin、Least Connections、IP Hash 等等，這些演算法可以讓我們根據不同的需求來做不同的設定。

## Nginx 介紹

Nginx 是一個非常著名的 Web Server，它的特點是非常的輕量、穩定、高效，所以很多公司都會使用 Nginx 來當作 Load Balancer。
回到 Airbnb 的例子，當你開啟了 Airbnb 時，我們將 request 先送到 Nginx，然後 Nginx 會根據我們的設定，將 request 分配給不同的 Server。
這麼一來，我們就可以平均的分配 request 給不同的 Server，讓每一台 Server 都可以處理一部分的 request，這樣就可以分散 Server 的負擔。

## 安裝 Nginx

我是直接使用 Podman(docker desktop就把podman改成 docker 就可以囉) 來安裝 Nginx，這樣就不用擔心會影響到我的系統。直接安裝在本機上的方法網路上很多，可以依照自己的系統來找尋教學。

- 安裝 Podman
```bash
# 安裝 Nginx
$ podman run -d -p 80:80 --name myNginx nginx
```
- 查看是否安裝成功
```bash
$ podman ps
```

## 查看 Nginx 的設定檔

- 直接查看 nginx.conf
```bash
$ podman exec -it <container ID> cat /etc/nginx/nginx.conf
```
- 進入 Nginx 容器
```bash
$ podman exec -it <container ID> /bin/bash
```
- 進入 Nginx 的設定檔
```bash
$ cd /etc/nginx
```
- 我要要專注的是 Nginx 的設定檔，所以我們先來看看 Nginx 的設定檔長什麼樣子
```bash
$ cat nginx.conf
```
```conf

user  nginx;  # 指定 Nginx 的用戶名稱
worker_processes  auto;  # 指定 Nginx 的 worker process 數量，auto 表示自動設定，通常會設定為 CPU 的核心數量

error_log  /var/log/nginx/error.log notice; # 指定 Nginx 的錯誤日誌存放位置
pid        /var/run/nginx.pid; # 指定 Nginx 的 PID 檔存放位置，PID是 Process ID 的縮寫，也就是進程 ID，進程是用來執行程式的一個實例


events {
    worker_connections  1024; # 指定每個 worker process 可以處理的連線數量，通常會設定為 1024
}


http {
    include       /etc/nginx/mime.types; 
    default_type  application/octet-stream; 

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" ' 
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main; 

    sendfile        on; 
    #tcp_nopush     on;

    keepalive_timeout  65; 

    #gzip  on;

    include /etc/nginx/conf.d/*.conf;
}
```
> MIME（Multipurpose Internet Mail Extensions）類型是一種標準，用於描述和標籤數據的內容類型。這種標籤可以幫助接收數據的軟體（如瀏覽器）理解如何處理數據。
> MIME 類型由兩部分組成：類型和子類型，兩者之間由一個斜線（/）分隔。
> - text/html：這是 HTML 文件的 MIME 類型。當瀏覽器接收到這種類型的內容時，它會將其作為 HTML 文檔來處理。
> - image/jpeg：這是 JPEG 圖像的 MIME 類型。當瀏覽器接收到這種類型的內容時，它會將其作為圖像來處理。
> - application/pdf：這是 PDF 文件的 MIME 類型。當瀏覽器接收到這種類型的內容時，它會將其作為 PDF 文件來處理。

以下我們來解釋 nginx.conf 中的設定
- user nginx：
    指定 Nginx 的用戶名稱，這裡指定為 nginx。
- worker_processes auto：
    指定 Nginx 的 worker process 數量，這裡設定為 auto，表示自動設定，通常會設定為 CPU 的核心數量。
- error_log /var/log/nginx/error.log notice：
    指定 Nginx 的錯誤日誌存放位置，這裡指定為 /var/log/nginx/error.log，並且只記錄 notice 級別的錯誤。
- pid /var/run/nginx.pid：
    指定 Nginx 的 PID 檔存放位置，PID是 Process ID 的縮寫，也就是進程 ID，進程是用來執行程式的一個實例。
- events：
    指定 Nginx 的事件模塊，這裡設定了 worker_connections，表示每個 worker process 可以處理的連線數量，通常會設定為 1024。
- http：
    指定 Nginx 的 HTTP 模塊，這裡設定了一些 HTTP 相關的配置，例如 MIME types、log format、access log、sendfile、keepalive_timeout 等。
- include /etc/nginx/conf.d/*.conf：
    包含 /etc/nginx/conf.d/ 目錄下的所有以 .conf 結尾的文件，這樣可以將配置文件分開管理，使配置更加清晰。
- log_format：
    定義了一個 log format，這裡的 main 是 log format 的名稱，可以自己定義。log format 用來指定日誌的格式，可以包含一些變量，例如 $remote_addr、$remote_user、$time_local 等。
    - `$remote_addr`：客戶端的 IP 地址。
    - `$remote_user`：用戶名。
    - `$time_local`：伺服器本地時間。
    - `$request`：請求的 URI 和 HTTP 協議。
    - `$status`：HTTP 狀態碼。
    - `$body_bytes_sent`：發送給客戶端的字節數。
    - `$http_referer`：請求的 Referer 頭部，表示請求來源的 URI。
    - `$http_user_agent`：請求的 User-Agent 頭部，表示客戶端的軟體類型。
    - `$http_x_forwarded_for`：請求的 X-Forwarded-For 頭部，當請求經過代理時，這個頭部可以包含原始客戶端的 IP 地址。
- access_log：
    指定 Nginx 的存取日誌存放位置和 log format，這裡的 main 就是上面定義的 log format。
- sendfile：
    指定是否開啟 sendfile 功能，sendfile 是一個高效的文件傳輸機制，可以提高文件的傳輸效率。當 sendfile 設定為 on 時，Nginx 會使用 sendfile 系統調用來傳輸靜態文件，這可以提高靜態文件的傳輸速度，並減少 CPU 的使用率。這對於服務大量靜態文件的網站來說，可以提供顯著的性能提升。然而，請注意，sendfile 只適用於傳輸靜態文件，對於動態內容（如 PHP、Python 等生成的內容），sendfile 不會有任何效果。
- tcp_nopush：
    指定是否開啟 tcp_nopush 功能，tcp_nopush 是一個 TCP 協議的擴展，可以提高網絡傳輸的效率。當 tcp_nopush 設定為 on 時，Nginx 會嘗試合併多個小的數據塊到一個 TCP 包中，然後一次性發送，以減少網絡包的數量並提高網絡效率。這對於靜態文件的傳輸尤其有用，因為它可以減少網絡延遲並提高文件傳輸的速度。請注意，tcp_nopush 指令只有在 sendfile 指令設定為 on 時才會生效，因為它依賴於 sendfile 系統調用來傳輸文件。此外，tcp_nopush 指令只對靜態文件的傳輸有影響，對於動態內容（如 PHP、Python 等生成的內容），它不會有任何效果。
- keepalive_timeout：
    指定 Nginx 的 keepalive_timeout，這裡設定為 65，表示 Nginx 在關閉閒置連接之前會等待 65 秒。keepalive_timeout 指令的值是一個時間長度（以秒為單位），表示 Nginx 在關閉閒置連接之前會等待多長時間。例如，如果 keepalive_timeout 設定為 60，那麼 Nginx 會在一個連接閒置 60 秒後關閉它。
- gzip：
    指定是否開啟 gzip 壓縮功能，gzip 是一種文件壓縮算法，可以將文件的大小壓縮到原來的大小的一部分。在網絡傳輸中，使用 gzip 壓縮可以減少傳輸的數據量，從而提高傳輸速度和效率。當 gzip 指令設定為 on 時，Nginx 會將 HTTP 響應壓縮為 gzip 格式，然後再發送給客戶端。客戶端（如瀏覽器）收到壓縮的響應後，會自動解壓並處理。
- include /etc/nginx/conf.d/*.conf：
    包含 /etc/nginx/conf.d/ 目錄下的所有以 .conf 結尾的文件，這樣可以將配置文件分開管理，使配置更加清晰。

## 查看 Nginx 的預設的 html 歡迎頁

- 進入 Nginx 容器
```bash
$ podman exec -it <container ID> /bin/bash
```
- 查看 Nginx 的 html 檔案
```bash
$ cat /usr/share/nginx/html/index.html
```
```html
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
html { color-scheme: light dark; }
body { width: 35em; margin: 0 auto;
font-family: Tahoma, Verdana, Arial, sans-serif; }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>

<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>

<p><em>Thank you for using nginx.</em></p>
</body>
</html>
```

## 如果我的網站還有包含一些靜態檔案，例如：圖片、CSS、JavaScript 等，我該如何部署到 Nginx 上呢？

- 來說明一下 nginx 中的 mime.types
    - 在空白的 `nginx.conf` 中，我們會需要自己指定那些種類的 mime type，這樣 Nginx 才能正確的處理這些檔案。如下
```conf
http{
    types {
        text/html html htm shtml;
        text/css css;
        text/xml xml;
        image/gif gif;
        image/jpeg jpeg jpg;
        application/javascript js;
        application/json json;
        application/xml xml;
    }

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;
        location / {
            try_files $uri $uri/ /index.html;
        }
    }
}
```
- 但種類這麼多怎麼辦?，所以 Nginx 提供了一個 `mime.types` 檔案，這個檔案中包含了許多常見的 mime type，檔案位置在 `/etc/nginx/mime.types`。我們可以把內容全部複製到 `nginx.conf` 的 `http` 區塊中，這樣就不用自己指定 mime type 了。
- 但複製一大串的 mime type 會讓 `nginx.conf` 變得很長，也好麻煩(你是鹿丸嗎?)，所以我們可以使用 `include` 來引入 `mime.types` 檔案，這樣就可以讓 `nginx.conf` 變得更加簡潔。
```conf
http{
    include /etc/nginx/mime.types;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;
        location / {
            try_files $uri $uri/ /index.html;
        }
    }
}
```
- 當然我們也可在預設的 `nginx.conf` 中找到 `include /etc/nginx/mime.types;`，這樣就不用自己指定 mime type 了。

> `$uri`：請求的 URI，也就是當我們的網址是 `http://localhost/about` 時，$uri 就是 `/about`。
> `ry_files $uri $uri/ /index.html;`：這個指令的作用是嘗試根據請求的 URI 來查找文件，如果找到了就返回該文件，如果找不到就查找 URI/ 目錄，如果還是找不到就返回 index.html 文件。

## Serving 靜態內容

想要在 Nginx 上服務靜態內容，我們的目標就是取代 Nginx 預設的 html 檔案，讓 Nginx 服務我們自己的 html 檔案。

1. 我們先來建立一個靜態的 html 檔案，這裡我們建立一個 `index.html` 檔案，內容如下：
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <h1>Hello, World!</h1>
</body>
</html>
```
2. 接著我們來解自己的 docker-compose.yaml。再前面我們有提到 Nginx 的歡迎葉面是在 `/usr/share/nginx/html/index.html`，所以我們要將我們的 index.html 放到這個位置。
```yaml
version: '3' # 使用 Docker Compose 的版本
services:
  nginx:
    image: nginx # 使用 Nginx 映像檔
    ports:
      - "80:80" # 將本機的 80 port 對應到 Nginx 容器的 80 port。 <host port>:<container port>
    volumes: # 將本機的 index.html 掛載到 Nginx 容器的 /usr/share/nginx/html/index.html，取代 Nginx 預設的 html 檔案
      - ./index.html:/usr/share/nginx/html/index.html 
```
3. 接著我們到我們的專案資料夾，執行以下指令
```bash
$ docker-compose up -d # 啟動容器，`-d` 表示在背景執行，這樣就不會佔用終端機
```
4. 最後我們打開瀏覽器，輸入 `http://localhost`，就可以看到我們自己的 index.html 了。

## 如果我想要使用網址來訪問不同的分頁呢?

- 我們可以在 `nginx.conf` 中的 `server` 區塊中設定 `location`，這樣就可以根據不同的網址來訪問不同的分頁。
- 假設我們已經有了兩個靜態的 html 檔案，分別是 `index.html` 、 `about.html`、`contact.html`。
- 我們先了解遺下幾個用來指令文件路徑的指令
    - location root:
        - 這個指令用來設置請求地跟目錄，當 nginx 處理一個請求時，她會將請求的 url 添加到 root 設置的路徑後面，然後去這個路徑下查找文件。
        - 例如
        ```yaml
        location /dogs/ {
            root /data;
        }
        ```
        - 當請求的 url 是 `http://localhost/dogs/index.html` 時，nginx 會去 `/data/dogs/index.html` 下查找文件。
    - location alias:
        - 這個指令用來設置別名，當 nginx 處理一個請求時，她會將請求的 url 添加到 alias 設置的路徑後面，然後去這個路徑下查找文件。
        - 例如
        ```yaml
        location /cats/ {
            alias /data
        }
        ```
        - 當請求的 url 是 `http://localhost/cats/index.html` 時，nginx 會去 `/data/index.html` 下查找文件。
    - location try_files:
        - 這個指令用來嘗試查找文件，當 nginx 處理一個請求時，又在你指定的 root 或 alias 下找不到文件時，他會根據 try_files 指令的設置來查找文件。
        - 例如
        ```yaml
        location / {
            root /data;
            try_files /test1.html /test2.html =404;
        }
        ```
        - 當請求的 url 是 `http://localhost/` 時，nginx 會先在 `/data/` 下查找文件，如果找不到就會嘗試查找 `/data/test1.html`，如果還是找不到就會嘗試查找 `/data/test2.html`，如果還是找不到就返回 404 錯誤。
        - 另外你也可以使用 `$uri` 來代表請求的 URI，例如 `try_files $uri $uri/ /index.html;`。這時的 `$url` 就是請求的 URI，例如 `http://localhost/about` 的 `$uri` 就是 `/about`。
    - location 307 redirect:
        - 這個指令用來重定向，當 nginx 處理一個請求時，他會將請求重定向到指定的 url。
        - 例如
        ```yaml
        location /redirect {
            return 307 /about;
        }
        ```
        - 當請求的 url 是 `http://localhost/redirect` 時，nginx 會將請求重定向到 `http://localhost/about`。

## 將 Angular 專案部署到 Nginx

只部屬一個靜態的 html 很無聊對吧，我們來部屬一個 Angular 專案到 Nginx 上。

1. 我們先來建立一個 Angular 專案，這裡我們建立一個 `my-app` 專案。
```bash
$ ng new my-app
```
2. 接著我們要建立一個 docker-compose.yaml，這裡我們要將 Angular 專案的 dist 資料夾掛載到 Nginx 容器的 `/usr/share/nginx/html`，這樣 Nginx 就可以服務 Angular 專案了。
```yaml
version: '3' # 使用 Docker Compose 的版本
services:
  nginx:
    image: nginx # 使用 Nginx 映像檔
    ports:
      - "80:80" # 將本機的 80 port 對應到 Nginx 容器的 80 port。 <host port>:<container port>
    volumes: # 將 Angular 專案的 dist 資料夾掛載到 Nginx 容器的 /usr/share/nginx/html，取代 Nginx 預設的 html 檔案
      - ./my-app/dist/my-app:/usr/share/nginx/html
```

> 如果你不想使用 `/usr/share/nginx/html` 這個路徑，你可以自己定義一個路徑，例如：`/usr/share/nginx/my-app`。
> 那麼你可以透過修改 Nginx 的設定檔來指定這個路徑，例如：`/etc/nginx/conf.d/my-app.conf`。
> ```conf
> server {
>     listen 80;
>     server_name localhost;
>     root /usr/share/nginx/my-app;
>     index index.html;
>     location / { #
>         try_files $uri $uri/ /index.html;
>     }
> }
> ```
> 然後在 docker-compose.yaml 中指定這個設定檔
> ```yaml
> version: '3' # 使用 Docker Compose 的版本
> services:
>   nginx:
>     image: nginx # 使用 Nginx 映像檔
>     ports:
>       - "80:80" # 將本機的 80 port 對應到 Nginx 容器的 80 port。 <host port>:<container port>
>     volumes: 
>       - ./my-app/dist/my-app:/usr/share/nginx/my-app # 將 Angular 專案的 dist 資料夾掛載到 Nginx 容器的 /usr/share/nginx/my-app
>       - ./my-app.conf:/etc/nginx/conf.d/my-app.conf # 將 my-app.conf 掛載到 Nginx 容器的 /etc/nginx/conf.d/my-app.conf
> ```

## Load Balancer 流量分配

當我們有多台 Server 時，我們可以使用 Nginx 來做 Load Balancer，讓 Nginx 幫我們分配流量，讓 Server 可以平均的處理 request，降低 Server 的負擔。

1.建立一個資料夾叫做 `backend1`，並在裡面建立一個 `app.py` 檔案，及一個 `Dockerfile` 檔案。
```python
from flask import Flask # 引入 Flask，Flask 是一個 Python 的 Web 框架，可以用來快速開發 Web 應用程式，當作我們的 Server。

app = Flask(__name__) # 創建一個 Flask 應用程式，__name__ 是 Python 的特殊變數，用來指定模組的名稱。

@app.route('/api') # 設定一個路由，當訪問 /api 時，會執行下面的方法。
def index(): 
    return "Hello from Backend 1" # 返回一個字符串 "Hello from Backend 1"。這就表示我們正在訪問 Backend 1。

if __name__ == '__main__': # 表示當這個文件被直接運行時，讓 Flask 開始監聽 5000 port。
    print("Backend 1 is running")
    app.run(host='0.0.0.0', port=5000)
```
```dockerfile
# 使用 Python 3.9-slim 映像檔
FROM python:3.9-slim   
# 設定工作目錄為 /app
WORKDIR /app
# 將我們執行指令時，所在的目錄下的 app.py 複製到 /app 目錄下
COPY app.py /app
# 安裝 Flask，這個指令將會執行在你前面指定的工作目錄下
RUN pip install flask
# 指定容器監聽 5000 port，需要注意的是，這只是告訴 Docker 這個容器要監聽 5000 port，並不是把 5000 port 映射到主機的 5000 port。
EXPOSE 5000
# 指在工作目錄下執行 `python app.py`，這樣當我們啟動容器時，就會執行這個指令，啟動我們的 Flask 應用程式。
CMD ["python", "app.py"]
```
2.建立一個資料夾叫做 `backend2`，並在裡面建立一個 `app.py` 檔案，及一個 `Dockerfile` 檔案。
```python
from flask import Flask

app = Flask(__name__)

@app.route('/api')
def index():
    return "Hello from Backend 2"

if __name__ == '__main__':
    print("Backend 1 is running")
    app.run(host='0.0.0.0', port=5000)
```
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY app.py /app
RUN pip install flask
EXPOSE 5000
CMD ["python", "app.py"]
```
3. 建立一個資料夾叫做 `frontend`，並在裡面建立一個 `index.html` 檔案，及一個 `Dockerfile` 檔案。
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Load Balancer Test</title>
</head>
<body>
    <h1>Load Balancer Test</h1>
    <button onclick="fetchBackend()">Call Backend</button>
    <p id="response"></p>

    <script>
        function fetchBackend() {
            fetch('http://localhost:8080/api')
                .then(response => response.text())
                .then(data => {
                    document.getElementById('response').innerText = data;
                });
        }
    </script>
</body>
</html>
```
```dockerfile
# 使用 Nginx 映像檔
FROM nginx:alpine
# 將我們執行指令時，所在的目錄下的 index.html 複製到 /usr/share/nginx/html 目錄下，取代 Nginx 預設的 html 檔案。這樣當我們訪問 Nginx 預測的 80 port 歡迎頁面時，就會顯示我們的 index.html。
COPY index.html /usr/share/nginx/html
```
4. 建立一個資料夾叫做 `nginx`，並在裡面建立一個 `nginx.conf` ，及一個 `Dockerfile` 檔案。
```conf
events {}  # 這個區塊用來配置基於事件驅動的模型。這裡是空的，所以使用預設設定。

http {  # 這個區塊用來配置 HTTP 伺服器。
    upstream backend {  # 這個區塊定義了一組後端伺服器組。
        server backend1:5000;  # 這是第一個後端伺服器。
        server backend2:5000;  # 這是第二個後端伺服器。
    }

    server {  # 這個區塊定義了一個伺服器，該伺服器在某個特定的埠上監聽來自客戶端的請求。
        listen 80;  # 伺服器在 80 埠上監聽。以這個專案來說，就是監聽我們的前端應用程式。

        location / {  # 這個區塊配置了如何回應對根 URL ("/") 的請求。
            root /usr/share/nginx/html;  # 靜態檔案的根目錄。也就是我們的前端應用程式的目錄。
            index index.html index.htm;  # 預設的索引檔案。也就是我們的前端應用程式的入口檔案。
        }

        location /api {  # 這個區塊配置了如何回應以 "/api" 開頭的 URL 的請求。
            proxy_pass http://backend;  # 請求會被傳送到前面定義的後端組。直接使用在 upstream 區塊定義的後端伺服器名稱即可。
            
            # proxy_set_header 是用來設定標頭的指令，這裡設定了一些標頭，傳給後端，讓後端知道這個請求所攜帶的資訊。
            proxy_set_header Host $host;  # 是用來設定標頭的指令，Host 是要設定的標頭名稱，$host 是 Nginx 變數，代表請求的主機名稱。
            proxy_set_header X-Real-IP $remote_addr;  # 是用來設定標頭的指令，X-Real-IP 是要設定的標頭名稱，$remote_addr 是 Nginx 變數，代表客戶端(哪裡發來的請求)的 IP 地址。
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;  # 是用來設定標頭的指令，X-Forwarded-For 是要設定的標頭名稱，$proxy_add_x_forwarded_for 是 Nginx 變數，代表客戶端的 IP 地址和之前的代理伺服器的 IP 地址列表。
            proxy_set_header X-Forwarded-Proto $scheme;  # 是用來設定標頭的指令，X-Forwarded-Proto 是要設定的標頭名稱，$scheme 是 Nginx 變數，代表請求使用的協議（通常是 http 或 https）。

            # add_header 是用來新增標頭的指令，新增完傳回給客戶端(前端)。
            add_header 'Access-Control-Allow-Origin' '*';  # 任何網域都可以存取這個 API。
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';  # 允許這些 HTTP 方法。
            add_header 'Access-Control-Allow-Headers' 'Origin, Content-Type, Accept, Authorization';  # 允許這些 HTTP 標頭。
        }
    }
}
```
```dockerfile
FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
```
5. 接著在最外層建立一個 `docker-compose.yaml` 檔案，並在裡面加入以下內容。
```yaml
version: '3.8'  # 使用的 Docker Compose 文件格式的版本

services:  # 定義多個服務，每個服務都會運行在一個單獨的容器中
  backend1:  # 服務名稱
    build:  # 構建服務的配置
      context: ./backend1  # Dockerfile 所在的路徑
    ports:  # 容器的端口映射
      - "5001:5000"  # 本機的 5001 端口映射到容器的 5000 端口

  backend2:  # 另一個服務
    build:
      context: ./backend2
    ports:
      - "5002:5000"  # 本機的 5002 端口映射到容器的 5000 端口

  frontend:  # 前端服務，在這個服務中的前端是部屬在 Nginx 上的
    build:
      context: ./frontend
    ports:
      - "80:80"  # 本機的 80 端口映射到容器的 80 端口

  nginx:  # Nginx 服務，用於反向代理及當作 Load Balancer
    build:
      context: ./nginx
    ports:
      - "8080:80"  # 本機的 8080 端口映射到容器的 80 端口
    depends_on:  # 定義服務的依賴關係，表示當要啟動這個服務時，需要 backend1、backend2、frontend 這三個服務都已經被啟動。但是這個指令只能確保啟動順序，並不能保證服務的可用性。
      - backend1  # Nginx 服務依賴 backend1
      - backend2  # Nginx 服務依賴 backend2
      - frontend  # Nginx 服務依賴 frontend
```
6. 此時的資料夾結構如下
```
.
├── backend1
│   ├── app.py
│   └── Dockerfile
├── backend2
│   ├── app.py
│   └── Dockerfile
├── frontend
│   ├── Dockerfile
│   └── index.html
├── nginx
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yaml
```
7. 接著我們到我們的專案資料夾，執行以下指令
```bash
$ docker-compose up -d # 啟動容器，`-d` 表示在背景執行，這樣就不會佔用終端機
```
8. 最後我們打開瀏覽器，輸入 `http://localhost`，就可以看到我們的 index.html 了。頁面上會呈現一個按鈕，點擊按鈕後，會顯示 `Hello from Backend 1` 或 `Hello from Backend 2`，這表示我們的 Load Balancer 已經成功的將流量分配到不同的 Server 上了。
