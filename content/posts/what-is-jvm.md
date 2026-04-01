---
title: "甚麼是JVM?"
date: "2026-03-24"
category: "Java"
tags: ["Java"]
summary: "- Java Virtual Machine"
published: true
---



## 甚麼是JVM?

- Java Virtual Machine
- JVM 會架構在 Linux、Windows、MacOS 等作業系統上。
- JVM 使得 Java 程式可以跨平台執行。
- 對於電腦而言，可以閱讀的語言只有機器碼，如 0、1，然而像 Java、C++ 等這類高階語言，電腦是看不懂的。必須要有一個翻譯員，我們稱之為 Compiler 編譯器，也就是 Javac，將高階語言翻譯成機器碼，這樣電腦才能執行程式。
- Java 在編譯時，不直接編譯成機器碼，而是編譯成一種稱為 Byte Code 位元碼 的中間碼，這個中間碼是 JVM 可以讀懂的，然後 JVM 會將這個中間碼翻譯成機器碼，這樣電腦才能執行程式。
- 原本的 Java 程式碼是以 .java 結尾，經過 Javac 編譯後，會變成 .class 結尾的 Byte Code 檔案。
- 若你想要在你的電腦上執行 Byte Code 位元碼，你必須要安裝 JVM，JVM 會根據目前的作業系統，將 Byte Code 翻譯成機器碼，這樣不同的作業系統就可以執行相同的 Java 程式。
- 所以對 Java 而言，只有一種作業系統，那就是 JVM。

## 甚麼是JRE?

- Java Runtime Environment, Java 執行環境
- JRE 包含了 Java SE API 和 JVM。
- 也就是說，安裝了 JRE 的電腦，就可以直接運行 Java 程式。

## 甚麼是JDK?

- ~~Java Development Killer~~ (Just Kidding)
- Java Development Kit, Java 開發工具包
- JDK 包含了所有需要的工具。
- 用階層的方式來說明，JDK 包含了 JRE，JRE 包含了 JVM。

## 甚麼是PATH?

- *.java 必須先編譯成 *.class，然後再執行。
- 當你在命令列中輸入 javac 時，電腦會去找 javac.exe 這個檔案，如果找不到，就會報錯。
- 所以你必須要告訴電腦 javac.exe 這個檔案在哪裡，這就是 PATH 的用途。
- 你可以在命令列中輸入 `echo %PATH%` 來查看目前的 PATH。
- 你可以在命令列中輸入 `set PATH=%PATH%;C:\Program Files\Java\jdk1.8.0_181\bin` 來新增 PATH。
- 如果你是使用 Windows，你可以在從這邊找到設定環境變數的地方。
    - 控制台 -> 系統 -> 系統資訊 -> 進階系統設定 -> 環境變數 -> 系統變數 -> Path -> 編輯 -> 新增 `C:\Program Files\Java\jdk1.8.0_181\bin` -> 確定 -> 確定 -> 確定。

---
## 資料來源
- Java SE 14 技術手冊
