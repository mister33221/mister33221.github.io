---
title: "物件導向設計(Java)"
date: "2026-03-24"
category: "Java"
tags: ["Java"]
summary: "- [甚麼是物件導向設計](#甚麼是物件導向設計)"
published: true
---



# 物件導向設計(Java)

## 目錄

- [甚麼是物件導向設計](#甚麼是物件導向設計)
- [物件導向設計的基本原則](#物件導向設計的基本原則)
- [用 Code 來說明物件導向設計的基本原則](#用code來說明物件導向設計的基本原則)
    - [封裝(Encapsulation)](#封裝encapsulation)
    - [繼承(Inheritance)](#繼承inheritance)
    - [多型(Polymorphism)](#多型polymorphism)


## 甚麼是物件導向設計

物件導向設計(Object-Oriented Design, OOD)是一種軟體設計方法，它將軟體系統中的元素組織為物件(Object)。物件是一個具有屬性(Attributes)和行為(Methods)的實體(instance)。物件導向設計的目標是將複雜的系統分解為簡單的物件，並通過它們之間的協作來實現系統的功能。

> 在 Java 中，物件(Object)與實例(Instance)是差不多的概念，通常我們會將一個類(Class)實例化(Instantiate)為一個物件(Object)。

## 物件導向設計的基本原則

物件導向設計的基本原則包括以下幾點：

1. 封裝(Encapsulation)
    封裝是一種將屬性(Attributes)和方法(Methods)封裝在一個物件(Object)中的機制。封裝可以保護物件的內部狀態，並提供一個清晰的界面，使物件之間的協作更容易。
2. 繼承(Inheritance)
    繼承是指一個物件(Object)可以繼承另一個物件的屬性(Attributes)和方法(Methods)。繼承可以提高代碼的重用性，並使代碼更容易擴展和修改。
3. 多型(Polymorphism)
    多型是指一個物件(Object)可以根據上下文的不同表現出不同的行為。多型可以提高代碼的靈活性，並使代碼更容易理解和維護。


## 用 Code 來說明物件導向設計的基本原則

### 封裝(Encapsulation)

封裝是一種將屬性(Attributes)和方法(Methods)封裝在一個物件(Object)中的機制。使這些屬性和方法只能通過物件的界面來訪問，而不能直接訪問。

```java
// 定義一個類別(Class)
public class Person {
    // 定義屬性(Attributes)
    private String name;
    private int age;

    // 定義方法(Methods)，這個方法我們也稱之為建構子(Constructor)
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    // 定義方法(Methods)
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }
}
```

### 繼承(Inheritance)

我們先定義了一個父類別(Parent Class)，然後定義了一個子類別(Child Class or Subclass)，子類別繼承了父類別的屬性(Attributes)和方法(Methods)。
也就是說我們利用繼承的機制，可以將父類別的屬性(Attributes)和方法(Methods)重用在子類別中。
Dog 與 Cat 都是 Animal，狗會吠叫，貓會喵喵叫，且它們同時都會吃東西。這麼一來，我們就可以將吃東西的方法放在父類別中，然後讓子類別繼承父類別的方法，就可以達到代碼重用的目的，減少重複代碼的情況。

```java
// 定義一個父類別(Parent Class)
public class Animal {
    public void eat() {
        System.out.println("Animal is eating...");
    }
}

// 定義一個子類別(Child Class or Subclass)
public class Dog extends Animal {
    public void bark() {
        System.out.println("Dog is barking...");
    }
}

// 定義一個子類別(Child Class or Subclass)
public class Cat extends Animal {
    public void meow() {
        System.out.println("Cat is meowing...");
    }
}
```

### 多型(Polymorphism)

延續上面的例子，我們可以看到 Dog 與 Cat 都是 Animal，所以我們可以將 Dog 與 Cat 都當作 Animal 來使用。
值白一點的說法就是我們可以使用父類別(Parent Class)的引用來引用子類別(Child Class or Subclass)的物件(Object)。
這個物件就可以使用多種型別來表示，這就是多型(Polymorphism)的概念。

```java
public class Main {
    public static void main(String[] args) {
        Animal dog = new Dog();
        Animal cat = new Cat();

        dog.eat(); // Output: Animal is eating...
        cat.eat(); // Output: Animal is eating...

        // dog.bark(); // Error: Cannot resolve method 'bark' in 'Animal'
        // cat.meow(); // Error: Cannot resolve method 'meow' in 'Animal'
    }
}
```
