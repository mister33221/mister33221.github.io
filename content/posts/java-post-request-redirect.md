---
title: "[Java] 如果前端是送來 Post Request，要怎麼在 Java 端 Redirect ?"
date: "2026-03-24"
category: "Java"
tags: ["Java"]
summary: "是這樣的，前端送來一個 Get Request，我們的 Spring boot 專案在 Controller 處理完"
published: true
---

# [Java] 如果前端是送來 Post Request，要怎麼在 Java 端 Redirect ?

## 情境

是這樣的，前端送來一個 Get Request，我們的 Spring boot 專案在 Controller 處理完相關邏輯後，直接在 Controller 裡面 return "redirect:/some-url"，這樣就可以將 Request 重新導向到指定的 URL。

> 要先注意一點，如果你想要像下面這裡直接 return "redirect:/some-url"，我們在 Controller 上加的 Annotation，要用 @Controller。     
> 不可以使用 @RestController，因為 @RestController 中野默認為所有的 Response 都是 JSON 格式(@ResponseBody)，所以不會將 String 視為 URL 來 Redirect。
```java
@GetMapping("/redirect")
public String redirect() {
    System.out.println("get request");
    return "redirect:https://www.google.com";
}
```

但如果前端被限制只能送 Post Request，那要怎麼在 Java 端 Redirect 呢？

是這樣的，我有一個專案需求，客戶手上有多個 APP，都要遷入我們新做的網頁，但是想要在各種不同的APP內，直接進入我們的網頁，勢必就要帶上一些認證資訊，以證明要進入我們新做的網頁的使用者是合法的。

那我們就不可以使用 Get Request 了，因為 Get Request 的 URL 是可以被看到的，這樣就有可能被竊取，所以我們只能使用 Post Request。

當我收到 Post Request 後，要怎麼讓客戶的 APP 重新導向到我們的網頁呢？

Post Request 直接回應 "redirect:/some-url" 是不行嗎?

其實....我也還沒研究透徹，確定是不行的，但為什麼我還說不清楚。

不過! 我找到了一個方法，可以在 Java 端 Redirect。

## 解法

先來寫一個超級簡單的 html，有一個 form，裡面有一個 input，一個 submit 按鈕，按下去就會向我們的 Controller 送出 Post Request。

```html
<!DOCTYPE html>
<html>
<head>
    <title>Post Request</title>
</head>
<body>
    <form action="http://localhost:8080/post-redirect" method="post">
        <input type="text" name="name" value="John">
        <input type="submit" value="Submit">
    </form>
</body>
</html>
```

然後寫一個 Controller，接收 Post Request，並且在 Controller 回應整個 html，在 html 裡面來送 get Request，這樣就可以達到 Redirect 的效果。

> 這邊因為我們不是要直接回應 "redirect:/some-url"，所以我們可以使用 @RestController。       

```java
@PostMapping(value = "/redirectPostToPost")
public ResponseEntity<String> redirectPostToPost(TestReqeust testRequest) {
    System.out.println(testRequest.toString());

    String htmlContent = "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "    <title>Redirecting...</title>" +
            "    <script>" +
            "        window.onload = function() {" +
            "            window.location.href = 'https://google.com';" +
            "        };" +
            "    </script>" +
            "</head>" +
            "<body>" +
            "    <p>Redirecting to google...</p>" +
            "</body>" +
            "</html>";

    return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_TYPE, "text/html")
            .body(htmlContent);
}
```

上面說是可以在 Java 端 Redirect，但其實實際上是在 html 裡面做 Redirect，只是這個 html 是由 Java Controller 回應的。最後 Redirect 還是在前端，只是我把它塞在要還應給前端的 Response 裡面。
