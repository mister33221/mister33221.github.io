---
title: "kafka 情境問題"
date: "2026-03-24"
category: "Tool"
tags: ["Git"]
summary: "稍微修整一下問題為同一個consumer group中的兩個consumer，分別在不同的主機或"
published: true
---

{%hackmd Hy_uVFcRD %}
# kafka 情境問題

## 不同主機 消費者 group 如何消費

稍微修整一下問題為同一個consumer group中的兩個consumer，分別在不同的主機或容器，會如何消費?

* 同一個 consumer group 中的兩個 consumer ，分別在不同的主機或容器，並不會影響消費模式，因為都是由 zookeeper 進行統一處理。因為 zookeeper 只關心 consumer group 中消費的總體數量。當某個 consumer 掉線或加入時，zookeeper 會自動重新平衡分區，以確保每個 consumer 處理相同數量的消息。
* consumer group的消費模式
    * 規定前提: 
        * 一個topic可被分為一至多個partition，而這些partitions中會有leader及follower，平均分散於broker中，讀寫都由leader進行，follower只負責備份。
        * 一個leader partition只能由consumer group中的一個consumer消費。

    ![](https://i.imgur.com/1QzNPq6.png)

## 消費失敗之後，同主機 retry，不同主機 retry 方式
* retry是在同一consumer上進行retry，並無同主機、不同主機的問題。


## broker 容錯機制，如何 failover ?
![](https://i.imgur.com/1QzNPq6.png)
* 同樣以此圖說明
* 環境: 1個topic分為三個partition、3個broker
* 當我有一個topic，我將這個topic分為三個部分，而這三個partition會平均分配到borker中，而當這些partition產生時，contoller broker會選擇某一個borker當作這個partition的leader broker，並將其他broker作為這個partition的follower broker。
* leader broker負責所有資料的讀寫，而leader broker就會主動把資料備份給其他的follower broker。
* 備份的機制ACKS(acknowledgments)有三種，分別為0、1、-1(all)
    * 0:
        producer發送過來給leader的數據、不需要等資料寫入leader partition，也不等follower同步資料，就反映給producer說已完成。
        如果此時這個leader掛掉了，還沒寫入硬碟、follower也還沒同步數據，這樣資料就會直接遺失。
        這個選項效率最高，但最不可靠。
        ![](https://i.imgur.com/FVhTg56.png)

    * 1:
        producer發送過來給leader的數據、需要等資料寫入leader partition，但不等follower同步資料，才反映給producer說已完成。
        如果此時這個leader掛掉了，資料已經寫入硬碟、但follower還沒同步數據。controller borker會重新在剩下正常的borker中選出一個leader，但新的leader並不會收到資料，因為producer已經認為發送成功。所以資料也是會有遺失風險。
        這個選項比acks=0來的可靠，但還是有風險。
        ![](https://i.imgur.com/qxr4rko.png)

    * -1(all):
        producer發送過來給leader的數據、需要等資料寫入leader partition，且要等follower同步資料，才反映給producer說已完成。
        這種選項最可靠，但效率也最低。
        ![](https://i.imgur.com/ZdG3IbR.png)
    * 備註:
        * leader維護了一個動態的ISR(in-sync replica set)，意為和leader保持同步的follower、leader集合(ex: leader:0, isr:0,1,2)
        * 如果follower長時間未向leader有互動的話，這個follower就會被踢出ISR，這個閥值為replica.lag.time.max.ms，預設為30秒。
        * 資料完全可靠的條件為
            ACK級別設定為-1(ALL)+分區副本大於等於2+ISR理應達的最小副本數量>=2。
* 如果有一個broker掛掉了，contoller broker會重新進行選舉，而選舉的規則如下:
    * 條件1: 可參與選舉的borker必須在isr中存活(isr會所有正常broker)
    * 條件2: 依照ar順序輪流擔任leader(ar為啟動時，就產生的所有broker列表，ar=isr+osr，osr為延遲過多被isr剔除的副本)
    ![](https://i.imgur.com/4EHH5iy.png)
* leader 及 follower 故障處裡細節
    * 名詞介紹
        * LEO(long end offset): 每個副本的最後一個offset，LEO也就是最新的offset+1
        * HW(high watermark): 所有副本中最小的SEO，也就是共有的最小offset+1
    * 情境
        1. 正常狀況
        ![](https://i.imgur.com/YIJ9ZbB.png)
        2. broker 2發生故障，從isr中剃除
        ![](https://i.imgur.com/Hkdd56m.png)
        3. 正常的broker繼續接收資料
        ![](https://i.imgur.com/V4pGbEe.png)
        4. 當follower重新啟動後，首先會替除HW後(含HW)的所有資料
        ![](https://i.imgur.com/9nw0JWM.png)
        5. 向leader發送同步請求，等這個重啟的follower的LEO追上了leader的HW後，就可以重新加入倒ISR中
        ![](https://i.imgur.com/juxQXEy.png)


## 補充
* 監控kafka的軟體-PreetyZoo [載點](https://github.com/vran-dev/PrettyZoo/releases)
