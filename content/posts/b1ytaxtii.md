---
title: "[Clean Code]涵式"
date: "2026-03-24"
category: "Backend"
tags: ["Clean Code", "Design Pattern"]
summary: "* 關於涵式的首要準則就是簡短"
published: true
---

{%hackmd BJzAwtWvp %}
# [Clean Code]涵式

## 簡短!!
* 關於涵式的首要準則就是簡短
* 而第二項準則就是要比第一項的簡短涵式還要更簡短!
* 簡短地透露出本身的意圖，每個涵式都帶著你至下個涵式，這就是涵式該有的簡短。

## 區塊與縮排
* if、else、while及其他敘述都應該只有一行，而那航程式通常是涵式呼叫敘述。
* 涵式不應該大道包含潮狀結構，因此涵式裡的縮排程度不應該大過一層或兩層，這會使的涵式更容易閱讀與理解。

## 只做一件事
* 涵式應該只做一件事情。他們應該把這件事做好。而且它們應該只做這件事情
    > Leo王-想起李國修:
        別牽拖牽絆
        人一輩子做好一件事情就功德圓滿
        別想要貪多嚼不爛
* 甚麼叫做只做一件事?
    * 如果你無法從其中提煉出另一個function那就是只做了一件事情

## 使用劇描述能力的名稱
* Ward原則
    當每個你看到的城市，執行結果都與你想得差不多，你會察覺到你正在clean code之上。即使你取的名字很長，也比較短卻難以理解的命名好。
    
## 函釋的參數最好的情況是0個
* 其次是1個，再來兩個，盡量避免三個及三個以上的參數。

## 旗標(flag)參數
* 使用旗標參數(即函式的參數為布林值)是一個非常不好的寫法，因為這表明這個函示內做了兩件事情，那個違反只做一件事的初衷，且一定可以分成兩個函式。

## 要無副作用
* 如下方範例，函式名稱並沒有顯示該函式有Session.initialeze()的功能，故別人來使用可能會忽略其中有執行到這個功能，而只是在check password而已，而導致整個工作階段毀掉
```java
public class UserValidator {
    private Cryptographer cryptographer;
    
    public boolean checkPassword(String userName, String password){
        User uer = UserGateway.findByName(userName);
        if(user != User.NULL){
            String codePhrase = user.getPhraseEncodedByPassword();
            String phrase - cryptographer.decrypt(codedPhrase, password);
            if("Valid Password".equals(phrase)){
                Session.initialize();
                return true;
            }
        }
        return false;
    }
}
```
## 提取try/catch 區塊
* 擾亂絲路，應以throws exception取代之

## 不要重複自己
* 重複的code是寫程式中，萬惡的根源!

## 結論
寫軟體就像寫作一樣，當你寫一篇論文或一篇文章時，你會先把想法寫下來，然後開始琢磨，直到他讀起來很通順。
第一份初稿通常雜亂無章，所以你開始修改，重新組織整個文章段落，將文章改善致你想要的樣子為止。
所以不可能有人可以在第一版完成的程式碼就完全符合clean code的所有需求，而是會在過程中盡可能符合，並在結束後，在繼續修改至最符合clean code的作品。


好了 我讀完這些東西以後發現，我以前寫了一堆大便 :D

---
