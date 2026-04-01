---
title: "領域驅動設計(Domain-Driven Design DDD)學習"
date: "2026-03-24"
category: "Java"
tags: ["Java"]
summary: "DDD 是一種基於領域知識來解決複雜業務問題的軟體開發方法論。"
published: true
---

# 領域驅動設計(Domain-Driven Design DDD)學習

## DDD簡介

DDD 是一種基於領域知識來解決複雜業務問題的軟體開發方法論。

DDD 的三個重點
* 跟領域專家 (domain expert) 密切合作來定義出 domain 的範圍及相關解決的方案
* 切分領域出數個子領域，並專注在核心子領域
* 透過一系列設計模式，將領域知識注入進程式模型 (model) 中

與領域專家討論出 Ubiquitous Language(共通語言) 後，就可以開始套用 DDD 的各種設計模式，而這些模式大致上可以分為兩類：
* <font color="#f00">Strategic Design 戰略設計</font>：利用與領域專家溝通的結果，拆分問題成數個子領域後，定義解決方案(系統)的邊界與關係。
* <font color="#f00">Tactical Design 戰術設計</font>：又稱 Model-Driven Design ，在 Strategic Design 的一個個解決方案邊界內，用一系列設計模式寫程式實踐業務邏輯。

### Strategic Design 戰略設計
目的在於協助我們捕捉和<font color="#f00">獲得領域知識Domain Knowledge</font>，並且將其<font color="#f00">拆分</font>成適當的大小以利後續分析處理，同時也讓我們能夠理解軟體的核心價值。

戰略包括以下要點：
* 團隊與領域專家溝通及合作捕捉領域知識並且建構通用語言Ubiquitous Language。
* 依照所理解的問題域 Problem Space 以及解決方案域 Solution Space 的資訊建立領域 Domain。
* 將領域 Domain 切成若干個子領域 Subdomain ，並定義每一個子領域的優先等級。
* 在子領域中遵循通用語言將解決方案域切分出一個個語意的邊界：限界上下文 Bounded Context 。
* 使用上下文地圖Context Mapping 模式定義不同限界上下文之間的互動模式 。

#### 戰略設計-定義領域模型（Domain Model）
什麼是 domain：問題(problem space) + 解法(soluation space)。

定義領域模型（Domain Model）
* 了解你所需要設計的系統之領域（domain）。
* 了解該領域的使用案例（use cases）。
* 利用通用語言（ubiquitous language）和找出子領域 （subdomains）。

#### 戰略設計-Problem Space 、拆分Domain
一個產品可能存在多種需求，因此分析 Domain的 Problem Space 的第一步，就是先切出 Subdomain。
可以把整個 domain 視作一間醫院。一間醫院需要多個部門才能達到這個目標，甚至還會有許多非醫療直接相關的部門 (如行政)。

拆分出的 Subdomain 可以依照優先等級、功能性與替代性分成三個類型:
(以電影院舉例)
* 核心子領域（Core subdomains）：- 電影螢幕
核心子領域是你的公司和產品的競爭優勢，也是你商業流程的基礎，在這些子領域持續創新是你公司成長的基石。
* 支援子領域（Supporting subdomains）：-售票系統
用來支援核心子領域的系統和使用案例，這些子領域是這個系統不可或缺的一部分，但並不會為你的產品和公司帶來競爭優勢。
* 一般子領域（Generic subdomains）：-廁所、食物
一般子領域是那些你需要的系統功能，但市場上已經有非常多類似的產品，沒有理由去對這部分的功能進行發展。

#### 戰略設計-用 Bounded Context 切分 Solution Space
Solution Space 是你實作程式模型的地方，為了要更好的劃分模型間的邊界，我們需要定義出 Bounded Context (限界上下文)。

Solution Space 中包含一個或多個 Bounded Context，每個 Bounded Context 都可以視作一個特定的解決方案。

#### 戰略設計-為什麼需要邊界
一個產品的需求有多種面向，即使是同一個名詞在不同的語境 (Context) 底下都會有不同的定義。
識別 Bounded Context 最重要的原則之一就是以語意作為邊界，讓其中的字彙只有身在 Bounded Context 才能得到完整的定義。因此每個 Bounded Context 都有自己的一套 Ubiquitous Language 在其中。

有了 Bounded Context 後，我們就可以在其中開發我們的 Domain Model 也不用怕概念混淆。
引出 DDD 在實作程式碼的重要精神，<font color="#f00">在脈絡中思考</font>。
![](https://i.imgur.com/QOvmmXb.png)

#### 戰略設計- 再論Bounded Context
在微服務架構的風潮下，越來越多人將 DDD 的 Bounded Contexts 作為定義各個服務的系統設計單元。
根據通用語言所定義出的商業領域模型 (Problem Space)，Bounded Contexts 的目標是劃分出在軟體 (Solution Space) 上的合適界線，將商業領域模型進行適當的分割。
每個Bounded Context 應該有清楚的功能上的定義，而且你所用來定義每個 Bounded Context 的詞彙應盡可能地與領域模型所用的詞彙相吻合。

#### 戰略設計- Context Mapping
各個 Bounded Context 之間的連結，在Bounded Context 之上，用來定義這些互動關係的一個框架。
DDD 裡的 Bounded Context Relationship 有兩種：
* 對稱性關係 (Symmetric Relationship) 
* 上下游關係 (Upstream-Downstream Relationship)

#### 戰略設計-對稱性關係
Partnership
兩個產品團隊各自負責不同Context，產品的成功與否需要兩個團隊的緊密合作才能確保共同的成功，這兩個Context之間便是 Partnership 的關係。
有相當高的彈性和演變速度，能夠快速的反應市場的需求，但也需要高度頻繁的跨團隊合作。
![](https://i.imgur.com/pEpEoDy.png)

Shared Kernel
如果這兩個團隊共享相同的元件，任何對共用元件的更動都會對兩個團隊有直接的影響，這兩Context便是有著Shared Kernel的互動關係。
好處是，因為各個團隊共享元件的瞭解和定義都是一樣的，可以將系統和團隊溝通的額外負擔減到最低，但共享元件的改動都需要團隊間的協調來確定不會對現有系統有不良影響。
![](https://i.imgur.com/LYlphVW.png)

#### 戰略設計-上下游關係Upstream-Downstream Relationship(一)
Customer-Supplier
當 Bounded Context 或團隊間有上下游關係(單向依賴)時，上游團隊在產品策畫階段會確保能滿足下游團隊的需求，上游方可以獨立於下游方完成開發，而下游方必須受限於上游方的開發計畫，這種關係就稱為 Customer-Supplier。
![](https://i.imgur.com/rVmM8hk.png)

#### 戰略設計-上下游關係Upstream-Downstream Relationship(二)
幾種上下游的變型：
Open Host Service/Published Language 開放主機服務/發布語言
上游定義一種協定 (protocol)，讓你的下游透過協定去使用你的服務，並公開這份協定，讓想用的人可以使用它，常出現在一個上游必須與多個下游進行整合時。
另外在使用上基本上都會搭配 Published Language 使用。
Open Host Service ：定義協定。
Published Language ：協定傳送資料的語言格式，如 XML、JSON 或是 Protocol Buffer 等等。
![](https://i.imgur.com/fJMsJh2.png)

#### 戰略設計-上下游關係Upstream-Downstream Relationship(三)
Conformist 遵奉者
如果下游團隊無法對上游的開發方向有任何有意義的影響，上游方沒有任何動力要滿足下游方的需求，下游團隊完全的採用上游團隊的服務 。
上游是成熟和穩定的，這個方式會大幅的簡化下游的系統整合複雜度。

在上下游系統中間建立一層中間層 (Middleware)來處理不同領域間資料的轉譯
* Translation Layer：中間層由上下游的團隊共同開發維護
* Anti-Corruption Layer：中間層由下游負責開發維護
![](https://i.imgur.com/wnKIxte.png)
![](https://i.imgur.com/te9ErNc.png)



### Tactical Design 戰術設計
![](https://i.imgur.com/N3yGDhn.png)


#### 分層架構Layered Architecture
引入DDD時並沒有限制要在哪種架構下開發，只需要確保架構中有保留一個「核心層」來開發。
常見的DDD的分層架構大多會分為四個部分：
![](https://i.imgur.com/TLRfRCp.png)
![](https://i.imgur.com/EdOvgjL.png)

#### Entity
Entity為一具有屬性及行為的獨立事物，且此物件是必須被追蹤的實體。
特性
* 具有唯一的識別符(ID)，除識別符外的其他狀態可變
* 兩個Entity不論其他狀態，ID相同就是相同物件
* 即使一個概念「聽起來像是」一個 Entity，仍需要視使用情況來辨認他的資格 
設計
* 找出關鍵資料，抓住識別Entity物件的基本特徵
* 將其他行為/屬性轉移到與Entity關聯的物件中，可以考慮設計為Entity或 Value Object
* 照著通用語言命名後使用

#### Value Object
代表物件的特徵/屬性。當一個物件沒有概念上的標示，只關心它的屬性，該物件可建立成Value Object。Value Object可幫助Domain Knowledge的實現。
例：將Customer中地址相關的屬性建立為Address Value Object。

特性
* 描述性：Value Object度量或描述了領域中的某個概念
* 不變性、替換性：Value Object可以被替換，但不可被改變(只有建立跟刪除)
![](https://i.imgur.com/B8I8mWQ.png)
* 
* 概念整體性、相等性：一個Value Object物件由相關屬性組成一個概念整體，屬性相同之Value Object為同一Value Object
* Value Object不會單獨存在，只會附屬於Entity

#### Entity及Value Object範例
![](https://i.imgur.com/sgJnIcj.png)

Entity 除了擁有ID及其屬性以外，還可以包含多個 Value Object 及 Entity。
情境為汽車生產情境。
車子和引擎是Entity，本身具有屬性，也具唯一標示。
此案例中不關注輪胎的唯一性，凡是具有相同大小及品牌的輪胎均視為同一輪胎。因此將輪胎的相關屬性設計為Value Object(VO)。

#### Aggregate
在DDD中，Entity和Value Object是很基礎的領域對象， Entity跟Value Object都只是個體的對象。
當領域中擁有越來越多的 Entity 與 Value Object，根據業務規則的需求，模型之間關聯性的複雜度會大幅增加。
因此會需要Aggregate來為這些互相牽連的物件們，減少互動的複雜性以及保護界線內規則的完整性，畫立一個清晰的界線。
聚合(Aggregate)是業務和邏輯緊密關聯的Entity與Value Object的組合，幫助在複雜關聯的模型中確保物件更改的一致性，且更改物件均遵守業務規則。

<font color="#f00">聚合是數據修改和持久化的基本單元，用來確保這些領域對象在實現共同的業務邏輯時，能保證數據的一致性</font>。
設想一個業務場景，當一個事件需要牽動到多個Entity的更新，且這些Entity都有各自的建立規則，分別管理這些Entity容易造成規則上的遺漏及錯誤。
![](https://i.imgur.com/Pe6pgWW.png)

![](https://i.imgur.com/y1xHyy2.png)

##### 設計
* 將相關連Entity及Value Object聚集在一起形成Aggregate並定義Aggregate的邊界 (Aggregate Boundary)。
* 選擇一個合適的Entity作為Aggregate Root。
* Aggregate Root只能是Entity，不能是Value Object。
* Aggregate Root控制對Boundary內所有物件的存取，對於Aggregate內部物件的所有操作均須透過Aggregate Root，不能繞過Aggregate Root。
![](https://i.imgur.com/AlGoPTK.png)

##### 規則
* 改變透過Aggregate Root傳遞到內部各個物件中：
    Aggregate Root 負責檢查同一Aggregate Boundary內的所有規則，每一次修改都需要滿足規則。Aggregate Boundary內所有物件的存取都須透過Aggregate Root，此機制確保Aggregate內所有物件的狀態修改都不會違反Aggregate的規則，保持數據的一致性。
* 一個Aggregate對到一個Repository
    只有Aggregate Root才能直接透過資料庫查詢，內部物件僅能透過Aggregate Root取得。
    當 Aggregate 完成了一個更改操作後，為了要儲存這次成功的操作，你需要將整個 Aggregate 一起存進資料庫，因此Aggregate邊界同時也是資料庫Transaction邊界。
* 刪除Aggregate時需刪除該Aggregate的所有物件：
    如：刪除Car物件時，會一併刪除該Aggregate底下的Tire物件。
* 外部物件不能引用除了Aggregate Root外的內部物件：
    為了保持Aggregate內部物件的一致性，外部物件僅可以持有Aggregate Root的reference，不可持有內部Entity的reference。
    Aggregate Root可以將內部Entity向外傳遞，外部可透過單一method操作這些內部entity。
    Aggregate Root可以傳遞Value Object給另一物件，不須關心Value Object的變化，因Value Object只是一個屬性Value，不與Aggregate有關聯。
* 實作上若想取得一個Aggregate，可使用Aggregate Root的ID引用，而非引用整個Aggregate的物件，有需要時再透過Aggregate Root ID向Repository尋找物件。(可以減少記憶體的消耗)
* Aggregate的大小：
    設計大Aggregate有助於維持資料的完整性，但設計一個過大的Aggregate容易引發併發或資源浪費的問題。
    Aggregate 拆分的越小且越多，系統的效能及擴展性會跟著提升，測試也會更容易。但如果Aggregate設計的很小，但相對的操作複雜度也會跟著會提高。例如每個Entity都是一個Aggregate Root，那麼就很難遵守一個事務只能更新一個Aggregate的原則。
* 一個處理流程應避免更新多個Aggregate：
    當要對兩個Aggregate進行操作，兩個處理流程會分開運行。
    當第一項處理流程完成後，才會觸發領域事件(Domain Event)，監聽事件的第二個Aggregate才會在收到事件後開始實作。
    
#### 領域事件 Domain Event
如果執行一個Aggregate相關命令需要額外在其他Aggregate執行其他領域規則，需要設計及實作Domain Event及Domain Event Handler觸發及接收相關的事件。
Domain Event一樣須由通用語言建立，可幫助實踐領域規則。
Domain Event與其觸發事件理論上應該在相同Domain發生。
![](https://i.imgur.com/KGzdVPZ.png)

Domain Event可用來將資訊傳遞到其他Aggregate，也可用來觸發任何數目的應用程式方法動作。
![](https://i.imgur.com/LSzb2uj.png)

#### 範例 - 採購訂單
![](https://i.imgur.com/pJahS0T.png)
Purchase Order(採購訂單)
	- approve limit: 金額上限
Line Item(採購物品)
	- quantity: 採購數量
Part (物品項目)
	- price: 物品價格

業務規則：
一張採購訂單總額不可超過Purchase Order中定義的approved limit限制
![](https://i.imgur.com/9sl2cTZ.png)![](https://i.imgur.com/cG9KAzC.png)

#### 範例 - 採購訂單(不使用Aggregate)
情境1：多人同時編輯同一Purchase Order的不同Item
![](https://i.imgur.com/Fv0af8v.png)
![](https://i.imgur.com/M0pEF1x.png)
![](https://i.imgur.com/VKU9Rer.png)
問題
* 需要同時面對來自多個Entity值的變動，避免更改違反業務原則
* 多人同時編輯相同表格，可能造成編輯結果違反業務原則
* 若使用鎖定機制，會造成多人作業時需要互相等待的不方便

改進Domain Model，加入業務規則
* Purchase Order及Item不需分開，Item獨立存在沒有意義
* Part Price的修改不立刻影響Purchase Order
![](https://i.imgur.com/O9QNrUn.png)

Purchase Order及Item歸類為同一個Aggregate，將它們的建立、刪除綁定在一起
Part Price的變動不會影響目前修改中的Purchase Order。
需待Part Price發出事件，Purchase Order(Aggregate Root)接收事件後更改Item中的價格，才會發生變動。

### Repository
DDD 注重在 Domain 層的領域物件，而這些領域物件雖然擁有計算能力，但仍需要有持久化機制將他們存下來，可使用Repository管理Aggregate的取用。
Repository不同於一般的DAO模式。DAO本質上是對資料庫CRUD的操作，而Repository更專注於Domain Model(Aggregate)的操作。
特點
* 嚴格限制只能從Aggregate Root取得及修改物件
* 隱藏持久化技術細節，它提供了客戶端一個與技術無關的「外觀介面」(façade)
* 定義了一個領域模型(Domain Model)與資料模型(Data Model)的邊界

### Repository與Aggregate
* 一個 Aggregate 最好對到一個 Repository
* 從 Repository 一次可以拿出一整個 Aggregate Object (ofId(id: string): Aggregate)
* 寫入 Repository 時也是一次寫入一整個 Aggregate Object (save(obj: Aggregate): void)
Repository與Factory
![](https://i.imgur.com/E49oUpm.png)

### Service
一些領域概念不適合被建模成物件(將其歸類為Entity或Value Object的職責)，與其替它們硬找歸屬，不如順其自然的成為Service。
特徵
* 無法自然規類在Entity或Value Object
* 著重在它能為客戶做什麼
* 操作是無狀態的(可能有副作用，但本身無狀態)
Service的分層，考慮以下情境：
* 銀行進行資金轉帳業務
* 接著把相關內容匯出成電子表格
* 最後以mail通知使用者




---

# Self learning

* 領域驅動設計 (Domain-Driven Design ，簡稱 DDD)
* 提倡開發人員也需要與領域專家合作以獲取足夠的業務知識 (business knowledge)，接著將領域知識與業務邏輯注入進程式碼模型之中，達成「程式即設計、設計即程式」的境界。
* DDD 最大的價值之一就是把將商業領域的知識映照到程式碼中，解放「程式歸程式，業務歸業務」的傳統思維
* 設計的三大重點
    * 跟領域專家 (domain expert) 密切合作來定義出 domain 的範圍及相關解決的方案。
    * 切分領域出數個子領域，並專注在核心子領域。
    * 透過一系列設計模式，將領域知識注入進程式模型 (model) 中。
* 用 Ubiquitous Language 溝通
* 兩大設計模式類別
    * Strategic Design 戰略設計：利用與領域專家溝通的結果，拆分問題成數個子領域後，<font color="#f00">定義解決方案(系統)的邊界與關係</font>。
    * Tactical Design 戰術設計：又稱 Model-Driven Design ，在 Strategic Design 的一個個解決方案<font color="#f00">邊界內，用一系列設計模式寫程式實踐業務邏輯</font>。
* DDD 帶來的改變
    ex:咖啡廳的例子，假如一個正常流程包括點餐、製作、送餐，可以寫出以下程式碼：
    ```
        customer = new Customer('Bill');
        order = Order.create(customer, 'Coffee');
        staff = new Staff(9527);
        cashier = new Cashier();
        // 結帳
        order.setStaff(staff);
        staff.setCashier(cashier);
        staff.setOrders(order);
        cashier.addOrder(order);
        
        // 泡咖啡
        cup = new Cup();
        staff.setCup();
        cup.setFilterCone(new FilterCone());
        cup.setCoffeeGround(new Coffee());
        staff.brew(cup);
        staff.wait();
        staff.setFilterCone(null);
        
        // 送餐
        staff.setCoffeeTo(customer);
        customer.setCoffee(order);
    ```
    to
    ```
    barista = new Barista(9527);
    customer = new Customer('Bill');
    order = customer.placeOrder(order);
    
    barista.processPayment(order);
    barista.make(order);
    barista.serveOrderTo(order, customer);
    ```
* 優缺點
    優點
    * 促進跨團隊的溝通、理解領域知識。
    * 專注在核心業務上
    * 保護業務邏輯，不會因技術細節 (如 db 、框架、基礎設施)而影響。
    * 開發時更靈活彈性、重用程式更方便，能夠面對未來的變化與成長。
    * 更好的模組化 = 更容易測試 (完美搭配 TDD)。
    * 出現 Bug 時更快找到原因 (已經將關注點分離，查出哪邊出問題很快)。
    * 有利用拆分與設計 microservice (這也是最近幾年紅的原因)
    * 少加班，發大財。
    缺點
    * 較難快速建立產品 (戰術實作部分)
    * 沒有領域專家會很難開頭 (新創需注意)
    * 要導入溝通文化、學習成本高
    * 對於高度科技(數學)專業的專案不一定合適
*  DDD 模式的全貌
    ![](https://i.imgur.com/dGMerUn.png)
* 戰略設計要領與重點
    * 團隊與領域專家溝通及合作捕捉領域知識並且建構通用語言
    * 依照所理解的問題域 Problem Space 以及解決方案域 Solution Space 的資訊建立領域 Domain
    * 將領域 Domain 切成若干個子領域 Subdomain ，並定義每一個子領域的優先等級
    * 在子領域中遵循通用語言將解決方案域切分出一個個語意的邊界：限界上下文 Bounded Context 
    * 使用上下文地圖Context Mapping 模式定義不同限界上下文之間的互動模式 
    * <font color="#f00">綜合上述
        開發團隊與領域專家溝通建立通用語言
        →將領域劃分成數個子領域並定義優先順序
        →在子領域中依通用語言，將子領域切成數個帶有限界的解決方案
    →依限界文定義所有領域的互動模式</font>
* 戰術設計的要領與重點
    * 實體 Entity：
        能被識別出來的物件 有 id。 Entity 的狀態會在其生命週期中持續追蹤其變化。
    * 值物件 Value Object：
        無 identity 概念、狀態不可變更的物件 object，用於描述某個事物的特徵。
    * 聚合 Aggregate：
        由相關業務目標的物件 包含實體與值物件 所組成，一個聚合即為一個 Transaction 的邊界。並且會在其中選擇一個實體 作為聚合根 Aggregate Root ，所有與外界的溝通都必須交由聚合根來負責。
    * 以上三個由於負責領域的業務邏輯，因此又被稱為領域物件 Domain Object。
    * 倉儲 Repository：
        這是一個保存領域物件的狀態的設計模式，可以轉接資料庫、 ORM 或檔案系統。一般使用上會考慮一個聚合(Aggregate)對上一個倉儲(Repository)。
    * 工廠 Factory：(?)
        同 GoF 的工廠樣式，在 DDD 中用於處理聚合生成較為複雜的情境。
    * 領域事件 Domain Event：
        某件領域專家在乎的事件，通常用於聚合間的溝通。
    * 領域服務 Domain Service：
        當有某個業務邏輯職責無法被歸類到任何一個領域物件上時，會將以領域服務承載這個職責。處於應用服務與領域物件之間。
    * 應用服務 Application Service：
        等同於系統的使用案例，主要負責技術細節並呼叫領域物件或領域服務處理業務邏輯。



---

參考資料:[【如何設計軟體 ? 】領域驅動設計 | 4 層架構 + 3 類物件](https://ithelp.ithome.com.tw/articles/10254763)

## 領域驅動設計
Domain Driven Design 簡稱 DDD
以領域知識為核心建立的模型，領域專家與開發人員，可以透過這個模型進行交流。
<font color="#f00">領域驅動設計，可以理解為，以領域層為核心，驅動整個系統的設計方法。</font>
確保最終設計出來的東西，是雙方共同想要達到的結果。


## 分層架構
領域驅動設計的分層結構，會分成四個部份。
* 用戶介面層 (User Interface)
* 應用層 (Application Layer)
* 領域層 (Domain Layer)
* 基礎設施層 (Infrastructure Layer)
越往上，離使用者越接近，是客戶能夠理解的部分。
越往下，則離程式語言與平臺越接近，是開發者搭建系統的技術實作。
![](https://i.imgur.com/KTN0gMd.png)

### 用戶介面層 (User Interface)
從字面意思上理解，就是 UI 介面。
這一層，負責向用戶顯示信息或解釋用戶指令。
<font color="#f00">用戶介面層只需要知道，要完成他的工作，需要調用哪一個應用。</font>
可以理解為這一層就是飛機的機場或貨輪的港口。
![](https://i.imgur.com/StE72CQ.png)

### 應用層 (Application Layer)
定義軟體要完成的任務，並且指揮表達領域概念的對象來解決問題。
整套協調任務、分配工作的流程，就是「應用」。
<font color="#f00">應用層只需要知道，要完成他的流程，需要調用領域層的哪個物件與服務。</font>
「應用層」只管流程步驟，本身並不介入任務的實際執行。
用機場來說明的話，就是要上飛機前的海關檢查程序。

### 領域層 (Domain Layer) = 模型層(Model Layer)
主要負責表達業務概念、業務狀態信息及業務規則。
以海關的稽核人員來說:
業務:查核旅客的護照與身上的物品
業務狀態訊息:查核哪些資訊與違禁物的清單
業務規則:有違禁品時 要進行通報
至於要調配哪一位，保安與巡警到達現場，則是管理中心 應用層的職責。

### 基礎設施層 (Infrastructure Layer)
為上面各層提供通用的技術能力。
為應用層傳遞消息
為領域層提供數據訪問及持久化機制
為用戶介面層繪製屏幕組件
可以理解為，海關安檢時用的:
X 光機
金屬探測器
電腦設備

## 層級關係
層與層之間的調用，是由上而下，並且可以跨層呼叫
但不會出現，由下而上或者平行呼叫的情況出現
![](https://i.imgur.com/RV6L8Pr.png)

### 領域層的物件
領域驅動設計，可以理解為，以領域層為核心，驅動整個系統的設計方法。
在跟領域專家討論與建構模型的順序:
1. 領域層
1. 應用層
1. 用戶界面層

#### 描述模型
領域層的模型建立，還缺了三個東西，用來描述這個模型:
* 實體(Entity)
* 值對象(Value object)
* 服務(Service)

##### 實體(Entity)
物件導向概念中的**「物件」，並且帶有「標示符」的對象。
標示符即為ID這類可以唯一識別碼，在經過軟體的各個分層結構時，仍然保持一致。
ex:
```
// POJO 物件
public class AppInfo {
    private Long id; // <- 「標示符」
    private String name;
    private String version;
}
```

##### 值對象(Value Object)
相似於實體(Entity)，兩者的差異在於值對象，沒有「標示符」。
```
// POJO 物件
public class AppInfo {
    private String name; // <- 沒有「標示符」
    private String version;
}
```

##### 服務(Service)
跟實體與值對象不太一樣，在與領域專家規劃模型時，會發現領域中有些方面是很難映射成對象。
尤其是領域中的動作，不屬於任何對象，卻代表了一個重要行為，此種行為通常會跨越若干的對象。
將此行為加入到任一對象中會破壞對象。
對象 = 物件 = 實體 / 值對象
最佳實做的方式是將它當成一個服務(Service)
可以簡單地理解:
<font color="#f00">實體與值對象 -> 名詞
    服務 -> 動詞</font>

#### 專案架構實作

將一般的三階層專案該造為DDD架構

##### 三層架構

一般的三階層專案會切分為如下:
* Controller : @Controller 的分一個資料夾放
* Service : @Service 也分一個資料夾來放
* DAO(Repository) : 所有有關資料庫存取的服務與對象也分一個資料夾放
![](https://i.imgur.com/pUKJApo.png)

優勢
* 簡單
* 快速實現

缺點
* 服務多的時候會變得複雜
* Service 與 DAO 深度耦合
* Service 不能進行單元測試

##### 領域分層

再複習一次領域分層的四層架構
* 用戶介面層 (User Interface)
* 應用層 (Application Layer)
* 領域層 (Domain Layer)
* 基礎設施層 (Infrastructure Layer)
![](https://i.imgur.com/Zigp4M7.png)

###### 用戶界面層 (User Interface)
對應的是 Controller 保持不變

###### 應用層(Application Layer) 與 領域層(Domain Layer) 對應的是 Service
拆分成兩個 :
應用服務層 (Application Service)
此區域沒有邏輯，主要是向流程及執行，call各地的service
領域服務層 (Domain Service)
主要的邏輯核心

###### 基礎設施層(Infrastructure Layer)，對應的是 DAO
DAO 該算是基礎設施層的一個子項模組
所以在基礎設施層，劃分一個數據庫的區塊存放

#### 最終圖示
讀完了上述領域驅動及各分層的重點功能區分後，我們可以將其具現化，可以再思考一下流程的部分，準備好了嗎?

## <font color="#f00">!!!!!!領域展開!!!!!!</font>

![](https://i.imgur.com/f1CjoTQ.png)

放錯圖了，抱歉。再一次!

## <font color="#f00">!!!!!!領域展開!!!!!!</font>

六角架構
![](https://i.imgur.com/cbC0aLs.png)
資料流向
![](https://i.imgur.com/33J9zRG.png)




---

---
參考資料:
我忘記紀錄了..........如果有侵犯請來信告知，馬上修正!
