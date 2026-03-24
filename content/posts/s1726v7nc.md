---
title: "[Java] 基本型別包裹類別"
date: "2026-03-24"
category: "Java"
tags: ["Java"]
summary: "- [類別與實例](#%E9%A1%9E%E5%88%A5%E8%88%87%E5%AF%A6%E4%BE%8B)"
published: true
---


# [Java] 基本型別包裹類別

- [類別與實例](#%E9%A1%9E%E5%88%A5%E8%88%87%E5%AF%A6%E4%BE%8B)
- [基本型別包裹類別](#%E5%9F%BA%E6%9C%AC%E5%9E%8B%E5%88%A5%E5%8C%85%E8%A3%B9%E9%A1%9E%E5%88%A5)
    - [自動裝箱和拆箱](#%E8%87%AA%E5%8B%95%E8%A3%9D%E7%AE%B1%E5%92%8C%E6%8B%86%E7%AE%B1)
        - [自動裝箱](#%E8%87%AA%E5%8B%95%E8%A3%9D%E7%AE%B1)
        - [自動拆箱](#%E8%87%AA%E5%8B%95%E6%8B%86%E7%AE%B1)
        - [棄用基本型態包裝類別](#%E6%A3%84%E7%94%A8%E5%9F%BA%E6%9C%AC%E5%9E%8B%E6%85%8B%E5%8C%85%E8%A3%9D%E9%A1%9E%E5%88%A5)
        - [自動裝箱的蜜糖毒藥](#%E8%87%AA%E5%8B%95%E8%A3%9D%E7%AE%B1%E7%9A%84%E8%9C%9C%E7%B3%96%E6%AF%92%E8%97%A5)
## 類別與實例

- Java 有兩種型態系統
    - 基本型態
    - 類別型態
- 在 Java 撰寫程式時，幾乎都是使用物件( Object )，要產生物件必須先定義類別( Class )，類別是物件的設計圖，物件是某個類別的實例( Instance )。
- 在 Java 中， 實例( Instance ) 和物件( Object ) 是同義詞，都是指某個類別的實例。
- 用製作汽車的例子來說明，汽車是類別，而實際的汽車就是物件，汽車的設計圖就是類別，而實際的汽車就是物件。
- 用程式碼來說明，定義一個類別如下：
```java
public class Car {
    // 定義屬性
    String color;
    int speed;
    // 定義方法
    void run() {
        System.out.println("Car is running");
    }
}

public class Main {
    public static void main(String[] args) {
        // 產生物件
        Car myCar1 = new Car();
        Car myCar2 = new Car();
        // 為個別的物件設定屬性
        myCar1.color = "Red";
        myCar1.speed = 60;
        myCar1.run();

        myCar2.color = "Blue";
        myCar2.speed = 80;
        myCar2.run();

        // 顯示物件的屬性
        System.out.println("My car1 color is " + myCar1.color);
        System.out.println("My car2 color is " + myCar2.color);
    }
}
```
- 當你新建一個物件時，Java 會為物件分配記憶體空間，會給他一個記憶體位址，這個位址就是物件的參考( Reference )。也可以說是門牌號碼，這個參考可以用來存取物件的屬性和方法。
- 同一個類別的不同物件，它們的參考是不同的，所以他們是不同的物件。

- 討論 `=` 與 `==` 的差異
    - `=` 是指定運算子，用來指定名稱參考到某個物件。
    - `==` 是用在比較兩個名稱是否參考到同一個物件，而非比較兩個物件是否相等。白話一點就是兩個物件的門牌號碼是否相同。
    - `=` 是用來指定參考，`==` 是用來比較參考。
    - 例如：
    ```java
    Car myCar1 = new Car(); // 產生一個新的物件，傭有一個新的參考(Reference)，也可以說是門牌號碼
    Car myCar2 = myCar1; // myCar2 參考到 myCar1 的物件，也就是把 myCar1 的門牌號碼給 myCar2，所以 myCar1 和 myCar2 參考到同一個物件
    System.out.println(myCar1 == myCar2); // true

    Car myCar3 = new Car(); // 產生一個新的物件，傭有一個新的參考(Reference)，產生新的門牌號碼
    Car myCar4 = new Car(); // 產生一個新的物件，傭有一個新的參考(Reference)，產生新的門牌號碼
    System.out.println(myCar3 == myCar4); // false
    ```


## 基本型別包裹類別

- Java 提供了基本型別的包裹類別，用來將基本型別轉換成物件，這樣就可以使用物件的方法和屬性。
- 基本型別包裹類別如下：
    - Byte
    - Short
    - Integer
    - Long
    - Float
    - Double
    - Character
    - Boolean
- 這些類別都是 final 類別，所以不能被繼承。
- 這些類別都有一個靜態方法 valueOf()，用來將基本型別轉換成物件。
- 例如：
```java
Integer i = Integer.valueOf(10); // 將 int 型別轉換成 Integer 物件
System.out.println(i); // 10
```
### 自動裝箱和拆箱

- Java 5 之後，提供了自動裝箱( Autoboxing ) 和自動拆箱( Unboxing ) 的功能。

#### 自動裝箱

- 自動裝箱是指將基本型別自動轉換成對應的包裝類別。
- 例如：
```java
Integer i = 10; // 自動裝箱，將 int 型別轉換成 Integer 物件
System.out.println(i); // 10
```

#### 自動拆箱

- 自動拆箱是指將包裝類別自動轉換成對應的基本型別。
- 例如：
```java
Integer i = 10; // 自動裝箱，將 int 型別轉換成 Integer 物件
int j = i; // 自動拆箱，將 Integer 物件轉換成 int 型別
System.out.println(j); // 10
```

#### 棄用基本型態包裝類別

- 不建議使用 `new` 建立基本型態包裝類別。如下
```java
Integer i = new Integer(10); // 不建議使用這種方式
```
- Java SE 9 開始，宣告基本型態包裝類別的方式已經被棄用，當你試圖使用這種方式宣告基本型態包裝類別時，編譯器會發出警告。

#### 自動裝箱的蜜糖毒藥

- 自動裝箱和拆箱的功能雖然方便，但是也有一些陷阱，例如：
```java
Integer i = 100;
Integer j = 100;
if (i == j) {
    System.out.println("i == j"); // 會顯示 i == j
} else {
    System.out.println("i != j"); // 不會顯示
}
```
- 這段程式碼會顯示 `i == j`，這是因為 Java 會將 IntegerCache.low = -128 和 IntegerCache.high = 127 之間的整數緩存起來，所以當你給他的值在這個範圍內時，會使用緩存中的物件，所以兩個物件的參考是相同的。
- 如果你給他的值不在 IntegerCache.low = -128 和 IntegerCache.high = 127 之間，就會產生新的物件，所以兩個物件的參考是不同的。
```java
Integer i = 1000;
Integer j = 1000;
if (i == j) {
    System.out.println("i == j"); // 不會顯示
} else {
    System.out.println("i != j"); // 會顯示 i != j
}
```
