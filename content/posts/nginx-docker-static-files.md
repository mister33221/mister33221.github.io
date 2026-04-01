---
title: "[Nginx] 使用docker, nginx讀取靜態檔案"
date: "2026-03-24"
category: "DevOps"
tags: ["DevOps", "Docker"]
summary: "- docker"
published: true
---


# [Nginx] 使用docker, nginx讀取靜態檔案

## 環境
- docker
- windows

## 步驟
1. 建立docker-compose.yaml
```yaml
version: '3' # specify docker-compose version
services:
  nginx:
    image: nginx:latest # specify the image to build container from nginx:latest
    container_name: nginx # set container name
    ports:
      - "80:80" # listen local port 80 and map to container port 80
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf # mount nginx.conf
      - ./files:/usr/share/nginx/html/files # mount files

```

2. 建立nginx.conf
```nginx.conf
events {
  worker_connections 1024; # set the maximum number of simultaneous connections that can be opened by a worker process
}

http {
  server {
    listen 80; # listen port 80
    server_name localhost; # server name

    location / {
      root /usr/share/nginx/html; # root path
      index index.html; # index file
    }
  }
}
``````

3. 建立files資料夾，並放入靜態檔案
4. 放一張圖片到files資料夾，並命名為test.jpg
5. 執行docker-compose up -d
6. 瀏覽器輸入localhost/test.jpg，即可看到圖片
---
