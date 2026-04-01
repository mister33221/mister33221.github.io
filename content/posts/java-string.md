---
title: "[Java] 字串"
date: "2026-03-24"
category: "Java"
tags: ["Java", "Concurrency"]
summary: "- [目錄](#%E7%9B%AE%E9%8C%84)"
published: true
---



# [Java] 字串

## 目錄

- [目錄](#%E7%9B%AE%E9%8C%84)
- [前言](#%E5%89%8D%E8%A8%80)
- [字串基礎](#%E5%AD%97%E4%B8%B2%E5%9F%BA%E7%A4%8E)
- [字串的特性](#%E5%AD%97%E4%B8%B2%E7%9A%84%E7%89%B9%E6%80%A7)
    - [字串常量與字串池](#%E5%AD%97%E4%B8%B2%E5%B8%B8%E9%87%8F%E8%88%87%E5%AD%97%E4%B8%B2%E6%B1%A0)
    - [不可變動Immutable字串](#%E4%B8%8D%E5%8F%AF%E8%AE%8A%E5%8B%95immutable%E5%AD%97%E4%B8%B2)


## 前言

在 Java 中，字串代表一組字元，是 java.lang.String 類別的實例，Java 中的物件特性他都具備，不過字串有一些特殊的特性，是為了效能考量而設計的。

## 字串基礎

所謂字串，就是由多個得字元組成的序列，例如 "Hello" 就是一個字串，由 H、e、l、l、o 這幾個字元組成。
在 Java 中，我們使用`"`來表示字串，例如：

```java
String str = "Hello";
```

也因為他是字元組成的序列，所以我們可以查看它的長度，或是取得其中的字元。

```java
String str = "Hello";

System.out.println(str.length()); // 5
System.out.println(str.charAt(0)); // H
```

## 字串的特性

### 字串常量與字串池

開始前我們先來回達兩個問題

1. 以下的程式片段結果是 `true` 還是 `false`？
    ```java
    char[] a = {'H', 'e', 'l', 'l', 'o'};
    String str1 = new String(a);
    String str2 = new String(a);
    System.out.println(str1 == str2);
    ```
    答案是 `false`，因為 `new` 關鍵字會在記憶體中建立一個新的物件，所以 `str1` 和 `str2` 是不同的物件。
2. 以下的程式片段結果是 `true` 還是 `false`？
    ```java
    String str1 = "Hello";
    String str2 = "Hello";
    System.out.println(str1 == str2);
    ```
    答案是 `true`，因為 Java 會將所有的字串常量放在字串池中，當我們宣告一個字串時，只要他的`序列`相同、`大小寫`相同，無倫他們出現過多少次，JVM 都只會建立一個 String 物件放在字串池中，如果你又建立了一個相同的字串，JVM 會先檢查字串池中是否已經有這個字串，如果有就直接返回這個字串的參考，不會再建立一個新的物件。如果沒有才會建立一個新的物件。

使用 `""` 來宣告字串，我們就稱他為字串常量(String Literal)，字串常量是不可變動(Immutable)的，也就是說一旦建立了字串常量，他的值就不能再改變了。

而這邊我們就要特別注意，如果你想要比較兩個字串是否相等，因為前面提到的字串池及使用`new`來建立字串物件，所以我們不能使用 `==` 來比較兩個字串是否相等，因為 `==` 是比較兩個物件的參考是否相等，而不是比較兩個物件的值是否相等，所以我們應該使用 `equals()` 方法來比較兩個字串是否相等。

```java
String str1 = "Hello";
String str2 = "Hello";
String str3 = new String("Hello");
String str4 = new String("Hello");

System.out.println(str1 == str2); // true
System.out.println(str1.equals(str2)); // true
System.out.println(str1 == str3); // false
System.out.println(str1.equals(str3)); // true
System.out.println(str3 == str4); // false
```

### 不可變動(Immutable)字串

字串常量是不可變動的，這是因為 Java 的效能考量，當我們對字串做修改時，實際上是建立了一個新的字串物件，而原本的字串物件並沒有被改變，這樣會造成記憶體的浪費，所以 Java 設計成字串是不可變動的，這樣就不用擔心字串物件被修改。

```java
String str = "Hello"; // 建立一個字串物件
str = str + " World"; // 在字串池中建立一個新的字串物件，也就是說現在有兩個字串物件，一個是 "Hello"，一個是 "Hello World"
System.out.println(str); // Hello World
```

我們來寫個程式來看看。從耗費記憶體的方式到效能考量的方式。輸出1+2+3...+100的字串

```java
public class Main {
    public static void main(String[] args) {
        String str = "";
        for (int i = 1; i <= 100; i++) {
            str += i;
        }
        System.out.println(str);
    }
}
```

但以上的程式碼是不好的，因為每次迴圈都會建立一個新的字串物件，這樣會造成記憶體的浪費，所以我們應該使用 StringBuilder 或 StringBuffer 來處理字串。

```java
public class Main {
    public static void main(String[] args) {
        StringBuilder str = new StringBuilder();
        for (int i = 1; i <= 100; i++) {
            str.append(i);
        }
        System.out.println(str.toString());
    }
}
```

在 Java 中，StringBuilder 和 StringBuffer 都是用來創建和操作可變的字串。它們的 API 都非常相似，但主要的區別在於 StringBuffer 是線程安全的，而 StringBuilder 不是。

- StringBuilder：
    - 線程不安全
    - 非同步、效能較好
    - 如果單線程，建議使用 StringBuilder
- StringBuffer：
    - 線程安全
    - 同步、效能較差
    - 如果多線程，建議使用 StringBuffer


## 字串常用方法

Java 中的字串有很多常用的方法，我們直接使用程式碼來看看。

```java
String str = "Hello";

System.out.println(str.length()); // 5, 取得字串長度
System.out.println(str.charAt(0)); // H, 取得指定位置的字元
System.out.println(str.substring(1)); // ello, 取得指定位置之後的子字串
System.out.println(str.substring(1, 3)); // el, 取得指定位置之間的子字串
System.out.println(str.indexOf("l")); // 2, 取得指定字元第一次出現的位置
System.out.println(str.lastIndexOf("l")); // 3, 取得指定字元最後一次出現的位置
System.out.println(str.startsWith("H")); // true, 判斷字串是否以指定字元開頭
System.out.println(str.endsWith("o")); // true, 判斷字串是否以指定字元結尾
System.out.println(str.equals("Hello")); // true, 判斷字串是否與指定字串相等
System.out.println(str.equalsIgnoreCase("hello")); // true, 忽略大小寫判斷字串是否相等
System.out.println(str.toLowerCase()); // hello, 將字串轉換為小寫
System.out.println(str.toUpperCase()); // HELLO, 將字串轉換為大寫
System.out.println(str.trim()); // Hello, 移除字串前後的空白
System.out.println(str.replace("H", "h")); // hello, 取代字串中的字元
System.out.println(str.contains("l")); // true, 判斷字串是否包含指定字元
System.out.println(str.concat(" World")); // Hello World, 連接字串
System.out.println(str + " World"); // Hello World, 連接字串
```
