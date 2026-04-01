---
title: "目錄"
date: "2026-03-24"
category: "Backend"
tags: ["Spring Boot", "Logback"]
summary: "<!-- TOC -->"
published: true
---


## 目錄

<!-- TOC -->

- [目錄](#%E7%9B%AE%E9%8C%84)
- [型別](#%E5%9E%8B%E5%88%A5)
    - [基本型別Primitive Type](#%E5%9F%BA%E6%9C%AC%E5%9E%8B%E5%88%A5primitive-type)
        - [如果超出其記憶體可存放的數值範圍，會發生甚麼事情?](#%E5%A6%82%E6%9E%9C%E8%B6%85%E5%87%BA%E5%85%B6%E8%A8%98%E6%86%B6%E9%AB%94%E5%8F%AF%E5%AD%98%E6%94%BE%E7%9A%84%E6%95%B8%E5%80%BC%E7%AF%84%E5%9C%8D%E6%9C%83%E7%99%BC%E7%94%9F%E7%94%9A%E9%BA%BC%E4%BA%8B%E6%83%85)
    - [參考型別Reference Type](#%E5%8F%83%E8%80%83%E5%9E%8B%E5%88%A5reference-type)
    - [變數 Variable](#%E8%AE%8A%E6%95%B8-variable)
- [運算子](#%E9%81%8B%E7%AE%97%E5%AD%90)
    - [算術運算子 Arithmetic Operator](#%E7%AE%97%E8%A1%93%E9%81%8B%E7%AE%97%E5%AD%90-arithmetic-operator)
    - [關係運算子 Relational Operator](#%E9%97%9C%E4%BF%82%E9%81%8B%E7%AE%97%E5%AD%90-relational-operator)
    - [邏輯運算子 Logical Operator](#%E9%82%8F%E8%BC%AF%E9%81%8B%E7%AE%97%E5%AD%90-logical-operator)
    - [位元運算子 Bitwise Operator](#%E4%BD%8D%E5%85%83%E9%81%8B%E7%AE%97%E5%AD%90-bitwise-operator)
    - [遞增、遞減運算](#%E9%81%9E%E5%A2%9E%E9%81%9E%E6%B8%9B%E9%81%8B%E7%AE%97)
    - [指定運算](#%E6%8C%87%E5%AE%9A%E9%81%8B%E7%AE%97)
- [流程控制](#%E6%B5%81%E7%A8%8B%E6%8E%A7%E5%88%B6)
    - [條件式](#%E6%A2%9D%E4%BB%B6%E5%BC%8F)
    - [Switch](#switch)
    - [迴圈](#%E8%BF%B4%E5%9C%88)
- [Reference](#reference)

<!-- /TOC -->

## 型別

主要的型別分為基本型別和參考型別。

### 基本型別(Primitive Type)

Java 的基本型別有 8 種，分別是：
- 位元型別：byte
    - 8 位元
    - 在處理影像、音訊等二進位資料時常用到
    - 他也可以用來表示整數
- 整數型別：short、int、long
    - short：16 位元，適合範圍較小的整數
    - int：32 位元，最常用的整數型別
    - long：64 位元，適合範圍較大的整數
    - 可以從位元數看出他們所佔的記憶體大小，byte 佔 1 byte，short 佔 2 byte，int 佔 4 byte，long 佔 8 byte
- 浮點數型別：float、double
    - float：32 位元，單精度浮點數
    - double：64 位元，雙精度浮點數
- 字元型別：char
    - 16 位元
    - 用來表示單一字元
- 布林型別：boolean
    - 1 位元
    - 用來表示 true 或 false

> 宣告 int 時，可以使用底線 `_` 來增加可讀性，但是底線不能在數字的開頭或結尾。
> ```java
> public class Main {
>      public static void main(String[] args) {
>         int a = 1_000_000;
>         System.out.println(a); // 1000000
>     }
> }
> ```

#### 如果超出其記憶體可存放的數值範圍，會發生甚麼事情?

如果超出其記憶體可存放的數值範圍，會發生溢位(Overflow)的問題，也就是數值會從最小值或最大值開始重新計算。

```java
public class Main {
    public static void main(String[] args) {
        byte b = 127;
        b++;
        System.out.println(b); // -128
    }
}
```
如果想要查看這些型別的最大值和最小值，可以使用以下的方式：
```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Byte: " + Byte.MIN_VALUE + " ~ " + Byte.MAX_VALUE);
        System.out.println("Short: " + Short.MIN_VALUE + " ~ " + Short.MAX_VALUE);
        System.out.println("Integer: " + Integer.MIN_VALUE + " ~ " + Integer.MAX_VALUE);
        System.out.println("Long: " + Long.MIN_VALUE + " ~ " + Long.MAX_VALUE);
        System.out.println("Float: " + Float.MIN_VALUE + " ~ " + Float.MAX_VALUE);
        System.out.println("Double: " + Double.MIN_VALUE + " ~ " + Double.MAX_VALUE);
    }
}
```

### 參考型別(Reference Type)

參考型別是指除了基本型別之外的型別，舉例但不限於以下：
- 類別：Class
- 介面：Interface
- 陣列：Array
- 列舉：Enum
- 泛型：Generic
- 字串：String
- 日期：Date

### 變數 Variable

- 想像一下如果有一段程式碼中，很多地方都要印出銅像的字串 `Hello, World!`，如果我們把這個字串寫死在程式碼中。
```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        System.out.println("Hello, World!");
        System.out.println("Hello, World!");
        System.out.println("Hello, World!");
        System.out.println("Hello, World!");
    }
}
```
- 當我們想要修改這個字串的時候，就需要一個一個去修改，這樣的做法不僅麻煩，也容易出錯。這時候我們就可以使用變數來解決這個問題。
```java
public class Main {
    public static void main(String[] args) {
        String str = "Hello, World!";
        System.out.println(str);
        System.out.println(str);
        System.out.println(str);
        System.out.println(str);
        System.out.println(str);
    }
}
```
- 在 Java 中，變數的命名規則如下：
    - 變數名稱只能包含英文字母、數字、底線和美元符號
    - 變數名稱的第一個字元不能是數字
    - 變數名稱不能是 Java 保留字
    - 變數名稱區分大小寫
        - 如果有多個單字組成，通常我們會使用小駝峰命名法(Camel Case)來命名變數，例如：`myVariable`
        - 大駝峰命名法(Pascal Case)：`MyVariable`
    - 變數名稱應該要有意義，並且要符合命名規則
- 當我們宣告一個變數時，就會告訴 JVM 要在記憶體中開一塊空間來存放這個變數，這個空間的大小取決於變數的型別。
- 在 Java 中，變數的宣告方式如下：
```java
<資料型別> <變數名稱> = <初始值>;
int a = 10;
```
- 而在以上的放立中，我們都將變數宣告在一個方法中，這樣的變數稱為區域變數(Local Variable)。區域變數只能在宣告他的方法中使用，當方法結束時，這個變數就會被釋放。
- 由於 Java 對於安全性的要求很高，所以在宣告變數的時候，必須要給他一個初始值，否則編譯器會報錯。
```java
public class Main {
    public static void main(String[] args) {
        int a; // Error: Variable 'a' might not have been initialized
    }
}
```

> 常用的忽略符號
> - \\: 反斜線\
> - \': 單引號'
> - \": 雙引號"
> - \uXXXX: 以十六進位表示的 Unicode 字元，XXXX 是四位數字，例如 \u0048 代表 'H'
> - \xxx: 以八進位表示的 Unicode 字元，xxx 是三位數字，例如 \110 代表 'H'
> - \b: 倒退一個字元
> - \f: 換頁
> - \n: 換行
> - \r: 歸位(游標移到行首)
> - \t: 水平定位字元(就是 tab 跳格)

> 常用的格式指定符號
> - %d: 十進位整數
> - %x: 十六進位整數
> - %o: 八進位整數
> - %f: 浮點數
> - %e: 科學記號
> - %c: 字元
> - %s: 字串
> - %b: 布林值
> - %n: 換行
> - 範例：
> ```java
> public class Main {
>     public static void main(String[] args) {
>         int a = 10;
>         System.out.printf("a = %d\n", a); // a = 10
>     }
> }
> ```

## 運算子

### 算術運算子 Arithmetic Operator

- 算術運算子用來執行數學運算，例如加法、減法、乘法、除法等。
- Java 的算術運算子有以下幾種：
    - 加法：`+`
    - 減法：`-`
    - 乘法：`*`
    - 除法：`/`
    - 餘數：`%`
- 算術運算子的運算規則如下：
    - 算術運算子的運算結果的型別取決於運算子兩邊的型別
    - 如果運算子兩邊的型別都是整數，那麼運算結果也是整數
    - 如果運算子兩邊的型別有一個是浮點數，那麼運算結果也是浮點數
    - 如果運算子兩邊的型別不同，那麼會先進行型別提升，再進行運算
- 算術運算子的優先順序如下：
    - 乘法、除法、餘數
    - 加法、減法
- 算術運算子的結合性是從左到右
- 通常我們習慣在運算子兩邊加上空格，以增加程式碼的可讀性
```java
public class Main {
    public static void main(String[] args) {
        int a = 10;
        int b = 3;
        System.out.println(a + b); // 13
        System.out.println(a - b); // 7
        System.out.println(a * b); // 30
        System.out.println(a / b); // 3
        System.out.println(a % b); // 1
    }
}
```

### 關係運算子 Relational Operator

- 關係運算子用來比較兩個值的大小，例如大於、小於、等於等。
- Java 的關係運算子有以下幾種：
    - 大於：`>`
    - 小於：`<`
    - 大於等於：`>=`
    - 小於等於：`<=`
    - 等於：`==`
    - 不等於：`!=`
- 關係運算子的運算結果是布林值，也就是 `true` 或 `false`
- 範例：
```java
public class Main {
    public static void main(String[] args) {
        int a = 10;
        int b = 3;
        System.out.println(a > b); // true
        System.out.println(a < b); // false
        System.out.println(a >= b); // true
        System.out.println(a <= b); // false
        System.out.println(a == b); // false
        System.out.println(a != b); // true
    }
}
```

### 邏輯運算子 Logical Operator

- 邏輯運算子用來執行邏輯運算，例如邏輯與、邏輯或、邏輯非等。
- Java 的邏輯運算子有以下幾種：
    - 邏輯與：`&&`
    - 邏輯或：`||`
    - 邏輯非：`!`
- 邏輯運算子的運算結果是布林值，也就是 `true` 或 `false`
- 邏輯運算子還有一個特性就是 `短路運算 Short-Circuit Evaluation`，也就是當運算結果已經確定時，就不會再進行後續的運算。
    - 例如：`true && false`，因為 `&&` 運算子是邏輯與，只有當兩邊的運算結果都是 `true` 時，整個運算結果才是 `true`，所以當左邊的運算結果是 `false` 時，整個運算結果就是 `false`，所以右邊的運算就不會執行。
- 範例：
```java
public class Main {
    public static void main(String[] args) {
        int a = 10;
        int b = 3;
        System.out.println(a > b && a < b); // false
        System.out.println(a > b || a < b); // true
        System.out.println(!(a > b)); // false
    }
}
```
### 位元運算子 Bitwise Operator

- 不常用，先略過

### 遞增、遞減運算

```java
public class Main {
    public static void main(String[] args) {
        int a = 10;
        System.out.println(a++); // 10，先印出 a 再加 1
        System.out.println(a); // 11，a 在上一行結束時加了 1
        System.out.println(++a); // 12，先加 1 再印出 a
    }
}
```
```java
public class Main {
    public static void main(String[] args) {
        int a = 10;
        System.out.println(a--); // 10，先印出 a 再減 1
        System.out.println(a); // 9，a 在上一行結束時減了 1
        System.out.println(--a); // 8，先減 1 再印出 a
    }
}
```

### 指定運算

- 我個人覺得使用指定運算子可以讓程式碼更簡潔，但是也容易讓程式碼變得難以閱讀，所以我個人不太常用，以下就稍微舉例說明就帶過。
```java
public class Main {
    public static void main(String[] args) {
        int a = 10;
        System.out.println(a += 5); // 15，等同於 a = a + 5
        System.out.println(a -= 5); // 10，等同於 a = a - 5
        System.out.println(a *= 5); // 50，等同於 a = a * 5
        System.out.println(a /= 5); // 2，等同於 a = a / 5
        System.out.println(a %= 5); // 0，等同於 a = a % 5
    }
}
```

## 流程控制

### 條件式

- 條件式用來控制程式的執行流程，例如 `if`、`else`、`else if` 等。
- Java 的條件式有以下幾種：
    - `if`：如果條件成立，就執行程式碼
    - `else`：如果 `if` 的條件不成立，就執行 `else` 的程式碼
    - `else if`：如果 `if` 的條件不成立，就檢查 `else if` 的條件，如果成立就執行 `else if` 的程式碼
- 範例：
```java
public class Main {
    public static void main(String[] args) {
        int a = 10;
        if (a > 5) {
            System.out.println("a > 5");
        } else if (a == 5) {
            System.out.println("a = 5");
        } else {
            System.out.println("a < 5");
        } 
    }
}
```

### Switch

- Switch 用來處理多個條件的情況，通常用在有多個條件的情況下，例如星期幾、月份等。
- Switch 的語法如下：
```java
switch (<變數>) {
    case <值1>:
        <程式碼1>
        break;
    case <值2>:
        <程式碼2>
        break;
    ...
    default:
        <程式碼>
}
```
- Switch 的運作方式是從上到下，當遇到 `case` 的值等於變數的值時，就會執行該 `case` 的程式碼，並且會執行 `break` 來結束 `switch` 的執行。
- 如果沒有任何一個 `case` 的值等於變數的值，就會執行 `default` 的程式碼。
- 範例：
```java
public class Main {
    public static void main(String[] args) {
        int day = 3;
        switch (day) {
            case 1:
                System.out.println("Monday");
                break;
            case 2:
                System.out.println("Tuesday");
                break;
            case 3:
                System.out.println("Wednesday");
                break;
            case 4:
                System.out.println("Thursday");
                break;
            case 5:
                System.out.println("Friday");
                break;
            case 6:
                System.out.println("Saturday");
                break;
            case 7:
                System.out.println("Sunday");
                break;
            default:
                System.out.println("Invalid day");
        }
    }
}
```
- 到了 Java SE 14 之後，Switch 的語法有了一些改變，可以使用 `->` 來取代 `:`，並且可以使用多個 `case` 來指定同一個程式碼。
```java
public class Main {
    public static void main(String[] args) {
        int day = 3;
        switch (day) {
            case 1, 2, 3, 4, 5 -> System.out.println("Weekday");
            case 6, 7 -> System.out.println("Weekend");
            default -> System.out.println("Invalid day");
        }
    }
}
```

### 迴圈

- 迴圈用來重複執行程式碼，例如 `for`、`while`、`do while` 等。
- for 迴圈
    - for 迴圈用來重複執行程式碼，並且可以指定迴圈的條件。
    - for 迴圈的語法如下：
    ```java
    for (<初始條件>; <條件>; <遞增或遞減>) {
        <程式碼>
    }
    ```
    - 範例：
    ```java
    public class Main {
        public static void main(String[] args) {
            for (int i = 0; i < 5; i++) {
                System.out.println(i);
            }
        }
    }
    ```
    - 或是可以使用 for-each 迴圈，用來遍歷陣列或集合。
    ```java
    public class Main {
        public static void main(String[] args) {
            int[] arr = {1, 2, 3, 4, 5};
            for (int i : arr) {
                System.out.println(i);
            }
        }
    }
    ```
    - 最經典的 99 乘法表
    ```java
    public class Main {
        public static void main(String[] args) {
            for (int i = 1; i <= 9; i++) {
                for (int j = 1; j <= 9; j++) {
                    System.out.printf("%d * %d = %2d", i, j, i * j);
                }
                System.out.println();
            }
        }
    }
    ```
- while 迴圈
    - while 迴圈用來重複執行程式碼，並且可以指定迴圈的條件。
    - while 迴圈的語法如下：
    ```java
    while (<條件>) {
        <程式碼>
    }
    ```
    - 範例：
    ```java
    public class Main {
        public static void main(String[] args) {
            int i = 0;
            while (i < 5) {
                System.out.println(i);
                i++;
            }
        }
    }
    ```
- do while 迴圈
    - do while 迴圈用來重複執行程式碼，並且可以指定迴圈的條件。
    - do while 迴圈的語法如下：
    ```java
    do {
        <程式碼>
    } while (<條件>);
    ```
    - 範例：
    ```java
    public class Main {
        public static void main(String[] args) {
            int i = 0;
            do {
                System.out.println(i);
                i++;
            } while (i < 5);
        }
    }
    ```
    - while 跟 do while 的差別在於，do while 會先執行一次程式碼，再檢查條件是否成立。
- break
    - break 用來結束迴圈的執行，並且跳出迴圈。
    - 範例：
    ```java
    public class Main {
        public static void main(String[] args) {
            for (int i = 0; i < 5; i++) {
                if (i == 3) {
                    break;
                }
                System.out.println(i);
            }
        }
    }
    ```
- continue
    - continue 用來跳過迴圈中的某一次迭代，並且繼續執行下一次迭代。
    - 範例：
    ```java
    public class Main {
        public static void main(String[] args) {
            for (int i = 0; i < 5; i++) {
                if (i == 3) {
                    continue;
                }
                System.out.println(i);
            }
        }
    }
    ```
- label
    - label 用來標記迴圈，並且可以在 break 或 continue 時指定要跳出的迴圈。
    - 例如當我們有兩個迴圈時，我們可以使用 label 來指定要跳出的迴圈。
    - 範例：
    ```java
    public class Main {
        public static void main(String[] args) {
            BACK1:
            for (int i = 0; i < 5; i++) {
                BACK2:
                for (int j = 0; j < 5; j++) {
                    if (j == 3) {
                        break BACK1;
                    } else if (j == 2) {
                        continue BACK2;
                    }
                    System.out.println(i + " " + j);
                }
            }
        }
    }
    ```

## Reference

- Java SE 14 技術手冊
