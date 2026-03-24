---
title: "[練習範例]spring security & JWT & Swagger"
date: "2026-03-24"
category: "Backend"
tags: ["Spring Boot", "Logback"]
summary: "* HttpSecurity http :"
published: true
---

# [練習範例]spring security & JWT & Swagger

## 範例專案名稱 angular-11-spring-boot-jwt-authenticationExample

### annotation
#### security
##### 登入流程經過的所有事情
* HttpSecurity http : 
    所有請求都會屬於他，就會要先通過security，而要經過哪些認證就可以接在http後面做設定。
* cors() : 
    表示要使用CorsFilter，如果有自己設定一個名為corsFilter的bean，那麼就會使用自己設定的corsFilter，不然在corsConfigurationSource中已經有預設好了。[參考](https://segmentfault.com/a/1190000019485883)
* and() : 
    只是把method接在一起
* csrf() : 
    * 防止CSRF Attacks
    * 使用時機為當你有使用瀏覽器時，就建議使用
    * 做 token 驗證，不用開啟避免 csrf
    * [參考](https://blog.techbridge.cc/2017/02/25/csrf-introduction/)
* exceptionHandling()
    * 通常會這樣使用HttpSecurity.exceptionHandling()，後面就可以再接你想要自己定義的例外處理邏輯，例如exceptionHandling().authenticationEntryPoint(自定義的邏輯)
    * [參考](https://matthung0807.blogspot.com/2020/04/spring-security-custom.html)
* sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
* .antMatchers("/api/auth/**").permitAll().anyRequest().authenticated()
    如果api網址如上的話，直接通過，不需驗證


#### swagger

#### 一般
* <font color="#f00">@Valid : 註釋在方法中要校驗的參數上，用於啟動校驗，可搭配[BindingResult 物件獲取校驗失敗的訊息](https://sites.google.com/im.fju.edu.tw/web/spring-framework/spring-validation)；也可以註釋在成員屬性上，用於進行嵌套驗證。</font>
* @Validated : 對於@Valid 的封裝，由Spring 提供的校驗機制，比@Valid 多了分組功能，但必須配合@Valid 才能進行嵌套驗證。
* @Email : 被註釋的屬性必須是電子信箱格式。
* @Pattern : 被註釋的屬性必須符合指定的正則表示法。
* <font color="#f00">@Null : 被註釋的屬性必須為Null。</font>
* <font color="#f00">@NotNull : 被註釋的屬性必須不為Null。</font>
* <font color="#f00">@NotEmpty : 被註釋的字串不可為空。</font>
* <font color="#f00">@NotBlank : 被註釋的字串非null 且長度必須大於0。</font>
* @Length : 被註釋的字串長度必須在指定的範圍內。
* @Min(value) : 被註釋的屬性必須為一個數字且大於或等於指定的最小值。
* @Max(value) : 被註釋的屬性必須為一個數字且小於或等於指定的最大值。
* @DecimalMin(value) : 被註釋的屬性必須為一個數字且大於或等於指定的最小值。
* @DecimalMax(value) : 被註釋的屬性必須為一個數字且小於或等於指定的最大值。
* @Size(max, min) : 被註釋的屬性必須為一個數字且在指定的範圍內。
* @Digits(integer, fraction) : 被註釋的屬性必須為一個數字且在可接收的範圍內。
* @Range : 被註釋的屬性必須在合適的範圍內。
* @AssertTrue : 被註釋的屬性必須為一個布林值且為true。
* @AssertFalse : 被註釋的屬性必須為一個布林值且為false。
* @Past : 被註釋的屬性必須為一個過去的日期。
* @Future : 被註釋的屬性必須為一個未來的日期。


---
