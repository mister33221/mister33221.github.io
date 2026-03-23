---
title: "Java 8 - 17 新特性重點整理"
date: "2023-05-10"
category: "Java"
tags: ["Java", "JEP", "Lambda", "Stream", "Records", "Sealed Classes"]
summary: "整理 Java 8 到 17 各版本的重點新特性，從 Lambda、Stream、Optional 到 Records、Sealed Classes，以及各版本 GC 改進。"
published: true
---

## Java 17 簡介

Java 17 是目前的 LTS（Long-Term Support）版本，於 2021 年 9 月 14 日發布，距離上一個 LTS 版本 Java 11 間隔 3 年。主要改進方向分兩類：**簡化語法提升效能**，以及**影響設計風格的語法**。

重要的版本相容性：Spring 6 與 Spring Boot 3 至少要基於 Java 17，Hibernate 也宣告「All system go for Java 17」。

> **LTS 版本建議：** 選用 Java 8、11、17 其中之一，中間版本官方視為小版本更新。

---

## Java 8

### JEP 126 — Lambda

Lambda 讓你用 `->` 建立匿名方法，大幅簡化程式碼：

```java
// Before
Runnable r = new Runnable() {
    @Override
    public void run() { System.out.println("Hello"); }
};

// After
Runnable r = () -> System.out.println("Hello");
```

### JEP 107 — Stream

Stream 讓集合操作更簡潔、更有表達力：

```java
// Before
for (String name : names) { System.out.println(name); }

// After
names.stream().forEach(System.out::println);
```

### JEP 129 — Optional

優雅處理 null，減少 NullPointerException：

```java
// Before
if (name != null) { System.out.println(name); }

// After
Optional.ofNullable(name).ifPresent(System.out::println);
```

### JEP 150 — Date Time API

取代老舊的 `Calendar`，提供更清晰的日期時間操作：

```java
LocalDate date = LocalDate.of(2022, Month.MAY, 15);
LocalTime time = LocalTime.of(14, 30);
LocalDateTime dateTime = LocalDateTime.of(date, time);

// 時區轉換
ZonedDateTime zonedDateTime = dateTime.atZone(ZoneId.of("Asia/Tokyo"));

// 格式化
DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss z");
String formatted = zonedDateTime.format(formatter);
```

### JEP 135 — Base64

Java 8 以前需要第三方套件，現在內建：

```java
String encoded = Base64.getEncoder().encodeToString("hello".getBytes());
byte[] decoded = Base64.getDecoder().decode(encoded);
```

---

## Java 10

### JEP 286 — Local Variable Type Inference (`var`)

讓編譯器自動推斷區域變數型別：

```java
// Before
ArrayList<String> list = new ArrayList<>();
HashMap<Integer, String> map = new HashMap<>();

// After
var list = new ArrayList<String>();
var map = new HashMap<Integer, String>();
```

---

## Java 11

### JEP 321 — HTTP Client (Standard)

取代過時的 `HttpURLConnection`：

```java
HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://example.com"))
    .build();
HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
System.out.println(response.statusCode());
System.out.println(response.body());
```

---

## Java 14

### JEP 361 — Switch Expressions

大幅簡化多分支邏輯：

```java
// Before（傳統 switch + break）
switch (day) {
    case 1: System.out.println("Monday"); break;
    case 2: System.out.println("Tuesday"); break;
    // ...
}

// After（Switch Expression）
String dayName = switch (day) {
    case 1 -> "Monday";
    case 2 -> "Tuesday";
    case 3 -> "Wednesday";
    default -> "Invalid";
};
```

### JEP 358 — Helpful NullPointerExceptions

錯誤訊息更明確，直接告訴你是哪個變數是 null：

```
// Before
java.lang.NullPointerException at Book.java:23

// After
NullPointerException: cannot invoke "String.length()" because "str" is null
```

---

## Java 15 & 16

### JEP 378 — Text Blocks

多行字串不再需要 `\n` 和字串拼接：

```java
// Before
String sql = "SELECT * FROM users WHERE age > 18 AND city = 'Taipei'";

// After
String sql = """
    SELECT *
    FROM users
    WHERE age > 18
    AND city = 'Taipei'
    """;
```

### JEP 395 — Records

快速定義不可變的輕量級資料類別：

```java
// 一行搞定，自動生成 constructor、getter、equals、hashCode、toString
public record Person(String name, int age) {}

Person p = new Person("Kai", 30);
System.out.println(p.name()); // Kai
System.out.println(p.age());  // 30
```

### JEP 394 — Pattern Matching for `instanceof`

消除冗餘的型別轉換：

```java
// Before
if (obj instanceof String) {
    String s = (String) obj;
    System.out.println(s.length());
}

// After
if (obj instanceof String s) {
    System.out.println(s.length());
}
```

---

## Java 17

### JEP 409 — Sealed Classes

限制誰可以繼承你的類別，讓繼承關係更可控：

```java
public sealed abstract class Shape permits Circle, Square {
    public abstract double area();
}

public final class Circle extends Shape {
    private final double radius;
    public Circle(double radius) { this.radius = radius; }
    public double area() { return Math.PI * radius * radius; }
}

public final class Square extends Shape {
    private final double side;
    public Square(double side) { this.side = side; }
    public double area() { return side * side; }
}
```

### JEP 406 — Pattern Matching for `switch`

`instanceof` 加上 `switch`，複雜分支更優雅：

```java
// Before（多個 if-else）
if (obj instanceof Integer) { ... }
else if (obj instanceof String) { ... }
else if (obj instanceof List) { ... }

// After（switch pattern matching）
switch (obj) {
    case Integer i -> System.out.println("Integer: " + i);
    case String s  -> System.out.println("String: " + s);
    case List<?> l -> System.out.println("List size: " + l.size());
    default        -> System.out.println("Other");
}
```

---

## 參考資料

- [Spring Framework 6 & Java 17](https://spring.io/blog/2021/09/02/a-java-17-and-jakarta-ee-9-baseline-for-spring-framework-6)
- [OpenJDK JEP Index](https://openjdk.org/jeps/0)
- [Hibernate Ready for JDK 17](https://in.relation.to/2021/09/14/ready-for-jdk17/)
