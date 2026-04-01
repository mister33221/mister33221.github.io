---
title: "用 Java 學資料結構：堆疊 Stack"
date: "2026-03-24"
category: "Tool"
tags: ["Git"]
summary: "堆疊(Stack)是一種基本的資料結構，遵循著一個簡單的原則：**後進先出**（La"
published: true
---

# 用 Java 學資料結構：堆疊 Stack

## 什麼是 Stack？

堆疊(Stack)是一種基本的資料結構，遵循著一個簡單的原則：**後進先出**（Last In, First Out, LIFO）。這意味著最後加入的元素會最先被取出。就好像我們將磚頭一塊疊在前一塊的上面，當我們要拿磚頭的時候，就會先拿最上面的那塊。這種特性讓我們可以在很多場景中使用堆疊，例如括瀏覽器的返回、括號匹配等。

## Stack 的基本操作

以下會用 Java 來說明 Stack 的基本操作，包括 push、pop、peek、isEmpty 與 size。

首先，我們先來宣告 Stack 的物件，在宣告時，我們需要指定 Stack 的元素類型，例如整數類型：

```java
Stack<Integer> stack = new Stack<>();
```

> 在 Java 7 之前，我們需要使用 `new Stack<Integer>()` 來宣告 Stack 物件，但在 Java 7 之後，可以使用鑽石運算子（Diamond Operator）`<>`，讓編譯器自動推斷型別。比較簡潔。

### 常見操作方法

#### push: 將元素加入到 Stack 頂部。

```java
stack.push(1);
stack.push(2);
stack.push(3);
stack.push(4);
stack.push(5);

System.out.println(stack);
// 輸出：[1, 2, 3, 4, 5]
```

#### pop: 移除並返回頂部的元素。

```java
int top = stack.pop();

System.out.println(top);
// 輸出：5
System.out.println(stack);
// 輸出：[1, 2, 3, 4]
```

#### peek: 獲取但不移除頂部的元素。

```java
int top = stack.peek();

System.out.println(top);
// 輸出：4
System.out.println(stack);
// 輸出：[1, 2, 3, 4]
```

#### isEmpty: 檢查 Stack 是否為空。

```java
boolean empty = stack.isEmpty();

System.out.println(empty);
// 輸出：false
```

#### size: 返回 Stack 的當前大小。

```java
int size = stack.size();

System.out.println(size);
// 輸出：4
```

#### search: 搜索元素在 Stack 中的位置。

- 位置是從 Stack 頂部開始計算的，會從 1 開始。如果元素不存在，則返回 -1。
```java
int position = stack.search(3);

System.out.println(position);
// 輸出：2
```
- 在我們的範例中，經過如下的操作
    - 由下往上堆疊 1、2、3、4、5
    ```ascii
    ┌────┐
    │ 5  │ <- top
    ├────┤
    │ 4  │
    ├────┤
    │ 3  │
    ├────┤
    │ 2  │
    ├────┤
    │ 1  │
    └────┘
    ```
    - 取出頂部的元素 5，剩下由下往上堆疊的元素 1、2、3、4
    ```ascii
    ┌────┐
    │ 4  │ <- top (pop移除5)
    ├────┤
    │ 3  │
    ├────┤
    │ 2  │
    ├────┤
    │ 1  │
    └────┘
    ```
    - 查看頂部的元素 4，此時 Stack 中堆疊的元素依然是 1、2、3、4
    - 搜索元素 3 的位置，從頂部低一個元素開始計算，所以位置是 2
    ```ascii
    ┌────┐
    │ 4  │ <- top, 位置 1
    ├────┤
    │ 3  │ <- 位置 2，search(3)
    ├────┤
    │ 2  │ <- 位置 3
    ├────┤
    │ 1  │ <- 位置 4
    └────┘
    ```


### 這些操作的時間複雜度

- push、pop、peek、isEmpty、size 操作的時間複雜度都是 O(1)。
    - 表示這些操作的時間與 Stack 中的元素個數無關，只與操作本身的複雜度有關。
- search 操作的時間複雜度是 O(n)。
    - 表示 search 操作的時間與 Stack 中的元素個數成正比。

## Java 中的 Stack 實現方式

### 使用 Java 提供的 Stack 類

介紹 Java 的 java.util.Stack，並提供簡單的程式範例。

### 使用 Array 實現 Stack

用 Array 實現一個自訂的 Stack，並提供完整範例。

1. 首先，我們需要定義 Stack 的大小與元素數組。
2. 然後，我們需要實現 Stack 的基本操作，包括 push、pop、peek、isEmpty 與 size。

```java
public class ArrayStack {
    private int maxSize;
    private int[] stack;
    private int top = -1; // 初始化為 -1，表示 Stack 是空的

    public ArrayStack(int maxSize) {
        this.maxSize = maxSize;
        stack = new int[maxSize];
    }

    public void push(int value) {
        if (isFull()) {
            System.out.println("Stack is full.");
            return;
        }
        stack[++top] = value;
    }

    public int pop() {
        if (isEmpty()) {
            throw new RuntimeException("Stack is empty.");
        }
        return stack[top--];
    }

    public int peek() {
        return stack[top];
    }

    public boolean isEmpty() {
        return top == -1;
    }

    public boolean isFull() {
        return top == maxSize - 1;
    }

    public int size() {
        return top + 1;
    }

    @Override
    public String toString() {
        return Arrays.toString(Arrays.copyOfRange(stack, 0, top + 1));
    }
}
```
3. 最後，我們可以使用這個自訂的 Stack 類。

```java
ArrayStack stack = new ArrayStack(5);
stack.push(1);
stack.push(2);
stack.push(3);
stack.push(4);
stack.push(5);

System.out.println(stack);
// 輸出：[1, 2, 3, 4, 5]

int top = stack.pop();
System.out.println(top);
// 輸出：5
System.out.println(stack);
// 輸出：[1, 2, 3, 4]
```

### 使用 Linked List 實現 Stack

用 Linked List 實現一個自訂的 Stack，並提供完整範例。

1. 首先，我們需要定義 Node 類。
2. 然後，我們需要實現 Stack 的基本操作，包括 push、pop、peek、isEmpty 與 size。

```java
public class Node {
    public int value;
    public Node next;

    public Node(int value) {
        this.value = value;
    }
}

public class LinkedListStack {
    private Node top;

    public void push(int value) {
        Node node = new Node(value);
        node.next = top;
        top = node;
    }

    public int pop() {
        if (isEmpty()) {
            throw new RuntimeException("Stack is empty.");
        }
        int value = top.value;
        top = top.next;
        return value;
    }

    public int peek() {
        if (isEmpty()) {
            throw new RuntimeException("Stack is empty.");
        }
        return top.value;
    }

    public boolean isEmpty() {
        return top == null;
    }

    public int size() {
        int size = 0;
        Node current = top;
        while (current != null) {
            size++;
            current = current.next;
        }
        return size;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        Node current = top;
        while (current != null) {
            sb.append(current.value).append(" ");
            current = current.next;
        }
        return sb.toString();
    }
}
```

## Stack 的應用範例

### 包含大中小括號的加減乘除運算

使用 Stack 實現包含大中小括號的加減乘除運算的範例。

```java
import java.util.Stack;

public class Calculator {
    public static double calculate(String expression) {
        // 擺放數字的堆疊
        Stack<Double> numbers = new Stack<>();
        // 擺放運算符的堆疊
        Stack<Character> operators = new Stack<>();

        // 遍歷表達式中的每個字符
        for (int i = 0; i < expression.length(); i++) {
            // 獲取當前字符
            char ch = expression.charAt(i);

            // 如果是空白字符，則忽略，結束當前循環，進入下一個循環
            if (Character.isWhitespace(ch)) {
                continue;
            }

            
            if (Character.isDigit(ch) || ch == '.') { // 如果是數字或是小數點的話
                StringBuilder num = new StringBuilder();
                while (i < expression.length() &&  // 當前的字符位置小於表達式的長度，表示後面還有字符，且
                      (Character.isDigit(expression.charAt(i)) || // 當前的字符是數字 或
                       expression.charAt(i) == '.')) { // 當前的字符是小數點
                    num.append(expression.charAt(i)); // 將當前的字符加入到 num 中，表示正在組合一個完整的數字。如 12或12.34
                    i++; // 繼續下一個字符
                }
                i--; // 因為上面的 i++，所以這裡要減 1，才能保證下一次循環時，i 指向正確的字符。例如：12+34，i 在 1 的位置，下一次循環時，i 應該指向 + 的位置。
                numbers.push(Double.parseDouble(num.toString())); // 將組合好的數字轉換為 double 類型，並加入到 numbers 堆疊中
            } else if (ch == '(' || ch == '[' || ch == '{') { // 如果是左括號的話
                operators.push(ch); // 直接加入到 operators 堆疊中
            } else if (ch == ')' || ch == ']' || ch == '}') { // 如果是右括號的話
                while (!operators.isEmpty() &&  // 如果 operators 堆疊不為空，且
                      !isOpenBracket(operators.peek())) { // 當前的字符不是左括號的話
                    processOperation(numbers, operators); // 則處理運算
                }
                if (!operators.isEmpty() && isMatchingBracket(operators.peek(), ch)) { // 如果 operators 堆疊不為空，且當前的字符是左右括號匹配的話
                    operators.pop(); // 則將左括號從 operators 堆疊中移除
                } else {
                    throw new RuntimeException("括號不匹配");
                }
            } else if (isOperator(ch)) { // 如果是運算符的話
                while (!operators.isEmpty() &&  // 如果 operators 堆疊不為空，且
                       !isOpenBracket(operators.peek()) &&  // 當前的字符不是左括號，且
                       getPrecedence(operators.peek()) >= getPrecedence(ch)) { // 當前的字符的優先級小於等於 operators 堆疊頂部的運算符的優先級的話
                    processOperation(numbers, operators); // 則處理運算 
                }
                operators.push(ch); // 將當前的字符加入到 operators 堆疊中
            }
        }

        while (!operators.isEmpty()) { // 當 operators 堆疊不為空的話
            if (isOpenBracket(operators.peek())) { // 如果 operators 堆疊頂部的字符是左括號的話
                throw new RuntimeException("括號不匹配"); // 表示括號不匹配
            }
            processOperation(numbers, operators); // 則處理運算
        }

        if (numbers.size() != 1) { // 如果 numbers 堆疊的大小不為 1 的話
            throw new RuntimeException("表達式無效"); // 表示表達式無效
        }

        return numbers.pop(); // 返回 numbers 堆疊頂部的元素，即計算結果
    }

    private static boolean isOpenBracket(char ch) {
        return ch == '(' || ch == '[' || ch == '{';
    }

    private static boolean isMatchingBracket(char open, char close) {
        return (open == '(' && close == ')') ||
               (open == '[' && close == ']') ||
               (open == '{' && close == '}');
    }

    private static boolean isOperator(char ch) {
        return ch == '+' || ch == '-' || ch == '*' || ch == '/';
    }

    private static int getPrecedence(char operator) {
        switch (operator) {
            case '+':
            case '-':
                return 1;
            case '*':
            case '/':
                return 2;
            default:
                return 0;
        }
    }

    private static void processOperation(Stack<Double> numbers, Stack<Character> operators) {
        if (numbers.size() < 2) {
            throw new RuntimeException("表達式無效");
        }

        double b = numbers.pop();
        double a = numbers.pop();
        char operator = operators.pop();

        switch (operator) {
            case '+':
                numbers.push(a + b);
                break;
            case '-':
                numbers.push(a - b);
                break;
            case '*':
                numbers.push(a * b);
                break;
            case '/':
                if (b == 0) {
                    throw new RuntimeException("除數不能為零");
                }
                numbers.push(a / b);
                break;
            default:
                throw new RuntimeException("未知運算符");
        }
    }

    public static void main(String[] args) {
        // 測試範例
        String[] tests = {
            "1 + 2 * 3",           // 7.0
            "(1 + 2) * 3",         // 9.0
            "{1 + [2 * (3 + 4)]}", // 15.0
            "2 * (3 + 4) / 2"      // 7.0
        };

        for (String test : tests) {
            try {
                System.out.println(test + " = " + calculate(test));
            } catch (Exception e) {
                System.out.println(test + " 錯誤: " + e.getMessage());
            }
        }
    }
}
```
