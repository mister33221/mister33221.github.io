---
title: "用 Rust 寫一個簡單的 HTTP Server"
date: "2024-03-15"
updatedAt: "2024-03-20"
category: "Backend"
tags: ["Rust", "HTTP", "Systems"]
series: "Rust 學習筆記"
seriesOrder: 1
summary: "從零開始實作一個 HTTP/1.1 伺服器，理解底層網路通訊原理，不依賴任何框架。"
published: true
---

## 為什麼要手刻一個 HTTP Server？

學習任何底層技術最好的方式，就是**重新造輪子**。

當你用 `axum` 或 `actix-web` 寫 REST API 時，你在享受框架帶來的便利，但你不知道當一個 HTTP 請求進來時，底層到底發生了什麼事。本文就是要填補這個空白。

## 基礎：TCP 監聽

HTTP 建構在 TCP 之上。所有的一切，從一個 TCP listener 開始：

```rust
use std::net::TcpListener;

fn main() {
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();
    println!("Listening on port 7878");

    for stream in listener.incoming() {
        let stream = stream.unwrap();
        handle_connection(stream);
    }
}
```

`TcpListener::bind` 會綁定到指定的位址與 port，`incoming()` 回傳一個 iterator，每次有新連線進來時就會產生一個 `TcpStream`。

## 解析 HTTP 請求

HTTP/1.1 的請求格式如下：

```
GET /path HTTP/1.1\r\n
Host: localhost:7878\r\n
\r\n
```

我們需要從 `TcpStream` 讀取這些 bytes，然後解析出 method、path 和 headers。

```rust
use std::io::{BufRead, BufReader};
use std::net::TcpStream;

fn handle_connection(mut stream: TcpStream) {
    let buf_reader = BufReader::new(&mut stream);
    let request_line = buf_reader.lines().next().unwrap().unwrap();

    println!("Request: {request_line}");
}
```

### 解析 Request Line

Request line 的格式是 `METHOD PATH HTTP/VERSION`，我們可以用 `split_whitespace` 來拆分：

```rust
fn parse_request_line(line: &str) -> (&str, &str, &str) {
    let mut parts = line.split_whitespace();
    let method  = parts.next().unwrap_or("");
    let path    = parts.next().unwrap_or("/");
    let version = parts.next().unwrap_or("HTTP/1.1");
    (method, path, version)
}
```

## 發送 HTTP 回應

HTTP 回應的格式：

```
HTTP/1.1 200 OK\r\n
Content-Length: 13\r\n
Content-Type: text/plain\r\n
\r\n
Hello, World!
```

用 Rust 寫成：

```rust
use std::io::Write;

fn send_response(stream: &mut TcpStream, status: u16, body: &str) {
    let status_text = match status {
        200 => "OK",
        404 => "Not Found",
        _   => "Internal Server Error",
    };
    let response = format!(
        "HTTP/1.1 {status} {status_text}\r\nContent-Length: {}\r\nContent-Type: text/plain\r\n\r\n{body}",
        body.len()
    );
    stream.write_all(response.as_bytes()).unwrap();
}
```

## 加入多執行緒

目前的實作是單執行緒的，一次只能處理一個請求。讓我們用 `ThreadPool` 來改善：

```rust
use std::sync::{Arc, Mutex};
use std::thread;

struct ThreadPool {
    workers: Vec<Worker>,
    sender: std::sync::mpsc::Sender<Job>,
}

type Job = Box<dyn FnOnce() + Send + 'static>;

impl ThreadPool {
    fn new(size: usize) -> ThreadPool {
        let (sender, receiver) = std::sync::mpsc::channel();
        let receiver = Arc::new(Mutex::new(receiver));

        let mut workers = Vec::with_capacity(size);
        for id in 0..size {
            workers.push(Worker::new(id, Arc::clone(&receiver)));
        }

        ThreadPool { workers, sender }
    }

    fn execute<F>(&self, f: F)
    where F: FnOnce() + Send + 'static
    {
        let job = Box::new(f);
        self.sender.send(job).unwrap();
    }
}
```

> **注意：** 這裡使用了 `Arc<Mutex<Receiver>>` 來讓多個 worker 共享同一個 channel 的接收端。這是 Rust 中處理共享狀態的標準模式。

## 完整範例

把以上所有部分組合起來：

```rust
fn main() {
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();
    let pool = ThreadPool::new(4);

    for stream in listener.incoming() {
        let stream = stream.unwrap();
        pool.execute(|| handle_connection(stream));
    }
}
```

## 學到了什麼

1. **TCP 是 HTTP 的基礎**：理解這一層讓你對網路程式設計有更清晰的認識。
2. **Rust 的所有權系統**：在多執行緒場景下，Rust 的 borrow checker 會強迫你思考資料的生命週期。
3. **`Arc<Mutex<T>>` 模式**：Rust 的標準共享可變狀態解法，理解它是寫並行程式碼的關鍵。

下一篇，我們會加入路由功能，讓這個小小的 HTTP server 能夠處理更複雜的請求。
