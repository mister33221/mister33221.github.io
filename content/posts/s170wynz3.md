---
title: "cypress 前端測試 with angular 簡單介紹及教學"
date: "2026-03-24"
category: "Backend"
tags: ["Spring Boot", "Logback"]
summary: "Cypress是一個開源的端對端測試框架，它可以幫助開發人員在網頁應用程序上"
published: true
---

# cypress 前端測試 with angular 簡單介紹及教學

## 簡介
Cypress是一個開源的端對端測試框架，它可以幫助開發人員在網頁應用程序上進行自動化測試。Cypress與其他測試框架不同之處在於它直接在瀏覽器中運行，而不是使用Selenium等工具來模擬瀏覽器行為。

### 特點
* 快速而穩定：由於它直接在瀏覽器中運行，Cypress比其他自動化測試框架更快且更穩定。
* 簡單易用：Cypress具有簡潔的API和易於閱讀的錯誤報告，使開發人員能夠快速編寫和調試測試腳本。
* 全面性：Cypress可以檢查網頁的所有方面，包括DOM元素、Ajax請求、時間等等。
* 實時測試：Cypress具有實時測試功能，開發人員可以實時查看應用程序在測試期間的變化。

### Cypress的運作方式可以簡述為以下步驟
* 通過Cypress API編寫測試腳本，例如訪問網站、模擬使用者行為等。
* 執行測試腳本，Cypress將在瀏覽器中打開應用程序，然後注入測試腳本。
* Cypress將在測試過程中監聽所有瀏覽器事件，例如單擊、鍵盤輸入等。這樣可以確保測試腳本在與應用程序交互時能夠正確運行。
* Cypress會在執行期間顯示詳細的錯誤報告，包括錯誤類型、錯誤描述和堆棧跟踪。
* 測試運行完成後，Cypress會生成一份詳細的報告，報告中包含測試腳本運行的結果、執行時間、失敗原因等信息。

總之，Cypress是一個強大的自動化測試框架，它可以幫助開發人員更快地發現和解決應用程序的問題。Cypress的簡潔API和易於閱讀的報告使測試腳本編寫和調試變得更加容易。

### cypress是怎麼找到要測試的位置
Cypress可以透過簡單的命令和API來定位和控制網頁上的元素，從而實現對網頁應用程序的自動化測試。以下是Cypress定位和控制網頁元素的幾種方法：

使用CSS選擇器
Cypress支持使用CSS選擇器來定位網頁上的元素。開發人員可以使用jQuery的語法，例如：
```csharp
cy.get('button')  // 找到所有的button元素
cy.get('#myInput')  // 找到id為myInput的元素
cy.get('.myClass')  // 找到所有class為myClass的元素
cy.get('[data-testid=myId]')  // 找到所有data-testid屬性為myId的元素
```
使用Cypress內置的命令
Cypress還提供了一些內置的命令，例如：

```csharp
cy.contains('Submit')  // 找到包含Submit文本的元素
cy.get('input').first()  // 找到第一個input元素
cy.get('input').eq(1)  // 找到第二個input元素
cy.get('form').find('button')  // 在form元素中找到所有button元素
```
使用XPath
Cypress也支持使用XPath來定位網頁上的元素。開發人員可以使用XPath的語法，例如：

```arduino
cy.xpath('//button[text()="Submit"]')  // 找到文本為Submit的button元素
cy.xpath('//*[@id="myInput"]')  // 找到id為myInput的元素
cy.xpath('//*[contains(@class, "myClass")]')  // 找到所有class包含myClass的元素
```

而在官方文件中有提到推薦開發者自行在html中，針對要進行測試的tag加上官方推薦的屬性如data-cy,data-test,data-testid,方便定位資料，且若使用cypress的錄製功能時，也會以這些為優先偵測，進而自動產生測試碼。例如:
```html
<button
  id="main"
  class="btn btn-large"
  name="submission"
  role="button"
  data-cy="submit"
>
  Submit
</button>
```
![](https://i.imgur.com/UgLLBpE.png)

![](https://i.imgur.com/5VZkK0l.png)


## 安裝
### way 1
到根目錄中，使用以下指令安裝
```
npm install cypress --save-dev
```

### way 2(推薦，以下介紹以此方案安裝介紹)
到根目錄中，使用以下指令安裝
```
ng add @cypress/schematic
```
使用這個指令會做下面這些事情
* 安裝Cypress
* 添加npm腳本以運行Cypress端到端（e2e）測試的運行模式和開啟模式
    * 可以在angular.json中看到以下這些設定
    ```json
        "cypress-run": {
          "builder": "@cypress/schematic:cypress",
          "options": {
            "devServerTarget": "web-management:serve"
          },
          "configurations": {
            "production": {
              "devServerTarget": "web-management:serve:production"
            }
          }
        },
        "cypress-open": {
          "builder": "@cypress/schematic:cypress",
          "options": {
            "watch": true,
            "headless": false
          }
        },
        "ct": {
          "builder": "@cypress/schematic:cypress",
          "options": {
            "devServerTarget": "web-management:serve",
            "watch": true,
            "headless": false,
            "testingType": "component"
          },
          "configurations": {
            "development": {
              "devServerTarget": "web-management:serve:development"
            }
          }
        },
        "e2e": {
          "builder": "@cypress/schematic:cypress",
          "options": {
            "devServerTarget": "web-management:serve",
            "watch": true,
            "headless": false
          },
          "configurations": {
            "production": {
              "devServerTarget": "web-management:serve:production"
            }
          }
        }
    ```
    * 可以在package.json中看到以下設定，就可以使用 npm run cypress:run 或npm run cypress:open  來執行
    ```json
    "cypress:open": "cypress open",
    "cypress:run": "cypress run"
    ```
* 建立基礎的Cypress文件和目錄架構
    * cypress
        - download 
        - e2e:用來放e2e測試腳本的地方
        - fixtures:主要用來存儲測試用泛例的外部數據json檔
        - support
        - screenshots (有設定錄製功能才會產生)
        - videos (有設定錄製功能才會產生)
* 提供使用ng-generate輕鬆添加新的e2e和組件規格的能力
* 產生一個cypress.config.ts
* 可選：提示您添加或更新默認的ng e2e命令以使用Cypress進行端到端測試。
* 可選：提示您添加ng ct命令以使用Cypress進行組件測試。
### 啟動
```
npm run cypress:open
```

### 在CMD中開始測試指令
```
npm run cypress:run
```

### 啟動後
![](https://i.imgur.com/Sivuhdc.png)

#### E2E testing
E2E testing是End-to-End testing的簡稱，也稱作黑盒測試，這種測試方式的目的是驗證一個應用程式的完整性和正確性，從用戶的角度來模擬各種操作，並且測試應用程式的所有部分，包括UI、後端、資料庫、API等。E2E testing通常是在模擬真實環境下執行的，例如模擬不同的使用者、網絡狀態、瀏覽器等。

#### Component testing
Component testing是測試應用程式的獨立模塊或組件的功能和邏輯，也稱作單元測試。這種測試方式主要是針對一個組件的內部邏輯進行測試，並且通常是在隔離的環境下進行的，例如使用模擬器或mock對象來測試。Component testing可以測試每個組件的正確性，並且可以快速發現和修復bug。

## 簡單來玩一下
### 寫一頁登入頁面
html在要針對測試的點，加上data-cy的屬性
```html
<div class="fixMiddle">
  <div class="row">
    <div class="col-md-4 col-md-offset-4">
      <h1 style="text-align: center;">Login</h1>
      <form name="form" (ngSubmit)="f.form.valid && login()" #f="ngForm" novalidate style="text-align: center;">
        <div class="form-group m-2" [ngClass]="{ 'has-error': f.submitted && !username.valid }">
          <label for="username">Username</label>
          <input type="text" class="form-control" name="username" [(ngModel)]="model.username" #username="ngModel" required data-cy="username" />
        </div>
        <div class="form-group m-2" [ngClass]="{ 'has-error': f.submitted && !password.valid }">
          <label for="password">Password</label>
          <input type="password" class="form-control" name="password" [(ngModel)]="model.password" #password="ngModel" data-cy="password" required />
        </div>
        <div class="form-group m-2">
          <button [disabled]="loading" class="btn btn-primary" data-cy="submit-login-form-btn" >Login</button>
          <a routerLink="/register" class="btn btn-link" data-cy="register-btn">Register</a>
        </div>
      </form>
    </div>
  </div>
</div>
```
component
```typescript=
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {


  loading = false;

  @ViewChild('f')
  loginForm!: NgForm;

  model:{username:string, password:string} = {username: '', password: ''};

  login(){
    this.loading = true;
    console.log(this.loginForm.value);
    this.loginForm.reset();
    this.loading = false;
  }
}
```

### 編寫測試腳本
編寫腳本有兩種方式
* 手寫
    [基本語法](##基本語法)這裡我就不廢話了，常用的指令我寫在文章結尾
* 錄製
    1. 到cypress.config.ts中的e2e加上 experimentalStudio: true 來開啟錄製功能
        ```typescript
        export default defineConfig({

          e2e: {
            baseUrl: 'http://localhost:4200',
            experimentalStudio: true,
          },


          component: {
            devServer: {
              framework: 'angular',
              bundler: 'webpack',
            },
            specPattern: '**/*.cy.ts'
          }

        })
        
        ```
    2. 啟動cypress，選E2E Testing
        ```
        npm run cypress:open
        ```
        ![](https://i.imgur.com/9WnBGMv.png)
    3. 選你想要的瀏覽器
        ![](https://i.imgur.com/fnuqMiH.png)
    4. 選擇你想要編輯的測試腳本
        ![](https://i.imgur.com/3o4WGj0.png)
    5. 當滑鼠移到腳本的右方會有一個魔法棒，點擊他即可進行錄製，你只要直接進行一般使用者的操作，cypress就會自動產生腳本
        ![](https://i.imgur.com/QPKkN7l.png)
    6. 霹靂卡霹靂拉拉波波莉娜貝貝魯多 cypress就自動產生了studio註解內的腳本
        ![](https://i.imgur.com/sjYtwdt.png)


## 基本語法
### Hook
```javascript
describe('Hooks', () => {
  before(() => {
    // runs once before all tests in the block
  })

  beforeEach(() => {
    // runs before each test in the block
  })

  afterEach(() => {
    // runs after each test in the block
  })

  after(() => {
    // runs once after all tests in the block
  })
})
```
* __before()__ - 執行所有測試前執行一次 (only)
* __beforeEach()__ - 每一個測試執行前會執行一次
* __afterEach()__ - 每一個測試執行後會執行一次
* __after()__ - 執行所有測試後執行一次 (only)

### 元素定位
查找 DOM 元素的基本方式 :

```html
<button id="main1" class="btn" data-cy="submit"> submit </button>
<button id="main2" class="btn" data-test="submit"> submit </button>
<button id="main3" class="btn" data-testid="submit"> submit </button>

<ul>
    <li id="li1">test1</li>
    <li data-cy="li2">test2</li>
    <li data-test="li3">test3</li>
    <li data-testid="li4">test4</li>
</ul>

```
### __.get(selector)__
用來在 DOM 樹中查找 selector 對應的 DOM 元素。
```javascript
// 兩種格式
cy.get(selector)
cy.get(alias)

// 測試文件
context("get命令用例", function() {
	

	it("測試用例", function() {
    	cy.get("#main1").as("myMain") // sets the alias
    	cy.get("@myMain") // re-queries the DOM as before (only if necessary)
        cy.get(".btn")
        cy.get("li")
        cy.get("ul>[data-testid=li4]")
    })
})
```

### __.find(selector)__
在 DOM 樹中搜尋 __已被定位到的元素後代__，將匹配到的元素返回一個新的JQuery對象。

```javascript
// 測試文件
context("find 命令用例", function() {
	it("正確寫法", function() {
    	cy.get("ul").find("#li1")
    })
    
    it("錯誤寫法", function() {
    	cy.find("#li1")
    })
})
```
### __.contains()__
獲取包含指定文本的 DOM 元素

```javascript
// 兩種格式
.contains(content)
.contains(selector, content)

// 測試文件
context("contains 命令用例", function() {
	it("contains(content) 例子", function() {
    	cy.contains("submit")
    })
    
    it("contains(selector, content) 例子", function() {
    	cy.contains("ul>li", "test1")
    })
    
    it("contains(content) 正則例子", function() {
    	cy.contains(/test\d/)
    })
})
```
[更多查找元素輔助方式](https://www.cnblogs.com/poloyy/p/13065998.html)

Cypress 提供三個定位器 <僅用來測試> : 
* data-cy
* data-test
* data-testid
```javascript
// 測試文件
context("data-元素定位器", function() {
	it("測試用例", function() {
    	cy.get("[data-cy=submit]").click()
        cy.get("[data-test=submit]").click()
        cy.get("[data-testid=submit]").click()
    })
})
```
可以透過自訂義 command 來簡化

```javascript
// support/commands.ts
declare namespace Cypress {
    interface Chainable {
        byTestId<E extends Node = HTMLElement>(
            id: string,
            options?: Partial<Cypress.Loggable & Cypress.Timeoutable & Cypress.Withinable & Cypress.Shadow>,
        ): Cypress.Chainable<JQuery<E>>;
    }
}

Cypress.Commands.add(
    'byTestId',
    <E extends Node = HTMLElement>(
        id: string,
        options?: Partial<Cypress.Loggable & Cypress.Timeoutable & Cypress.Withinable & Cypress.Shadow>,
    ): Cypress.Chainable<JQuery<E>> => cy.get(`[data-testid="${id}"]`, options),
)
    
// 測試文件
context("data-元素定位器", function() {
	it("測試用例", function() {
    	cy.get("[data-cy=submit]").click()
        cy.get("[data-test=submit]").click()
        cy.byTestId("submit").click()
    })
})
```

### __與元素互動__
在 DOM 元素上，可以進行以下操作 : 
* __.type()__ - 輸入框輸入文本元素。 
* __.focus()__ - 聚焦在 DOM 元素。
* __.blur()__ - DOM 元素失去焦點。
* __.clear()__ - 清空 DOM 元素。 
* __.check()__ - 選中單選框、複選框。
* __.uncheck()__ - 取消選中複選框。 
* __.select()__ - select options的選項框 
* __.dblclick()__ - 雙擊。
* __.rightclick()__ - 右鍵點擊。
* __.submit()__ - 提交表單。
* __.scrollIntoView()__ - 將 DOM 元素滑動到可視區域。
* __.trigger()__ - DOM 元素上觸發事件。
* __cy.scrollTo()__ - 滑動滾動條。

[更多內容說明](https://www.cnblogs.com/poloyy/p/13066035.html)

### 關於斷言
#### __default Assertions__
* __cy.visit()__ expects the page to send text/html content with a 200 status code.
* __cy.request()__ expects the remote server to exist and provide a response.
* __cy.contains()__ expects the element with content to eventually exist in the DOM.
* __cy.get()__ expects the element to eventually exist in the DOM.
* __.find()__ also expects the element to eventually exist in the DOM.
* __.type()__ expects the element to eventually be in a typeable state.
* __.click()__ expects the element to eventually be in an actionable state.
* __.its()__ expects to eventually find a property on the current subject.

<p class="callout info">
	某些 command 可能有特定的要求，導致它們立即失敗而不重試，例如 cy.request()，<br>
  	其它基於 DOM 的 command，會自動重試並在失敗前等待其對應的元素存在，<br>
  	甚至還有 action command 在失敗之前自動等待其元素達到可以操作狀態。
</p>

##### __Writing Assertions__
There are two ways to write assertions in Cypress:
* 顯性斷言: 使用 expect().

* 隱性斷言: 使用 .should() or .and()，這個是 Cypress 推崇的方式。.and() 和 .should() 的使用方式和效果是一樣的。

```
.and(chainers)
.and(chainers, value)
.and(chainers, method, value)
.and(callbackFn)
```
* chainers : 斷言器。 [BDD](https://docs.cypress.io/guides/references/assertions#BDD-Assertions)
* value : 需要斷言的值。
* method : 需要調用的方法。
* callbackFn : 回調方法，可以滿足自己想要的斷言內容 ; 總是返回前一個 cy 命令返回的結果，方法內的 return 是無效的 ; 會一直運行到裡面沒有斷言。

##### __Should__
[should api](https://docs.cypress.io/api/commands/should#Syntax)

[大補帖](https://www.cnblogs.com/poloyy/p/13744006.html)
##### __Subject Management__
在 Cypress 在使用 command 後產生的內容，將會確定接下來能夠用的 command，像是在 cy.get() 或 cy.contains() 後產生 DOM 元素，允許我們進一步使用 command ，像是 .click() 甚至是再使用 cy.contains()，但是有些 command 回傳一個 null 就不能夠再接其它 command，像是 cy.clearCookies()。
```javascript
cy.clearCookies() // Done: 'null' was yielded, no chaining possible

cy.get('.main-container') // Yields an array of matching DOM elements
  .contains('Headlines') // Yields the first DOM element containing content
  .click() // Yields same DOM element from previous command
```
##### __Using then() to Act On A Subject__
使用 .then() 則使你可以使用上一條命令產生的主題。
```javascript
cy
  // Find the el with id 'some-link'
  .get('#some-link')

  .then(($myElement) => {
    // ...massage the subject with some arbitrary code

    // grab its href property
    const href = $myElement.prop('href')

    // strip out the 'hash' character and everything after it
    return href.replace(/(#.*)/, '')
  })
  .then((href) => {
    // href is now the new subject
    // which we can work with now
  })
```

##### __Commands 為 async 異步執行__
舉個例子 ~ <br>
錯誤寫法 : 
```javascript
it('does not work as we expect', () => {
  cy.visit('/my/resource/path') // Nothing happens yet

  cy.get('.awesome-selector') // Still nothing happening
    .click() // Nope, nothing

  // Cypress.$ is synchronous, so evaluates immediately
  // there is no element to find yet because
  // the cy.visit() was only queued to visit
  // and did not actually visit the application
  let el = Cypress.$('.new-el') // evaluates immediately as []

  if (el.length) {
    // evaluates immediately as 0
    cy.get('.another-selector')
  } else {
    // this will always run
    // because the 'el.length' is 0
    // when the code executes
    cy.get('.optional-selector')
  }
})

// Ok, the test function has finished executing...
// We've queued all of these commands and now
// Cypress will begin running them in order!
```
正確寫法 : 

```javascript
it('does not work as we expect', () => {
  cy.visit('/my/resource/path') // Nothing happens yet

  cy.get('.awesome-selector') // Still nothing happening
    .click() // Nope, nothing
    .then(() => {
      // placing this code inside the .then() ensures
      // it runs after the cypress commands 'execute'
      let el = Cypress.$('.new-el') // evaluates after .then()

      if (el.length) {
        cy.get('.another-selector')
      } else {
        cy.get('.optional-selector')
      }
    })
})

// Ok, the test function has finished executing...
// We've queued all of these commands and now
// Cypress will begin running them in order!
```
[官網例子](https://docs.cypress.io/guides/core-concepts/introduction-to-cypress#Commands-Are-Asynchronous)
  
#### __Commands Run Serially__
```javascript
it('changes the URL when "awesome" is clicked', () => {
  cy.visit('/my/resource/path') // 1.

  cy.get('.awesome-selector') // 2.
    .click() // 3.

  cy.url() // 4.
    .should('include', '/my/resource/path#awesomeness') // 5.
})
```

#### __新增斷言__
Because we are using chai, that means you can extend it however you'd like. Cypress will "just work" with new assertions added to chai. You can:

* Write your own chai assertions as [documented here](https://www.chaijs.com/api/plugins/).
* npm install any existing chai library and import into your test file or support file.

> [Check out our example recipe extending chai with new assertions.](https://docs.cypress.io/examples/examples/recipes#Fundamentals)

#### 取得某component中的變數範例
```typescript=
describe('My Test', () => {
    it('Get the variable in component', () => {
        // get the verifyCode from the component and type it into the input
        cy.window().then((win: any) => {
            const appComponent = win.ng.getComponent(
                win.document.querySelector('app-login'),
                'app-login'
            );
            const verifyCode = appComponent.verifyCode;
            cy.get('[data-cy=login-verify-code]').type(verifyCode);
            console.log(verifyCode);
        });
    });
});

```

### 產出報告
內建三種格式
* spec
* json
* junit

`npx cypress run --reporter junit `<br>

後面加 --spec"特定測試檔" ，可針對特定測試檔執行。

#### 使用 Mochawesome
安裝 

`npm install mocha` <br>

`npm install mochawesome` <br>

執行

`npx cypress run --reporter mochawesome `

後面加 --spec"特定測試檔" ，可針對特定測試檔執行。

[了解更多](https://www.cnblogs.com/poloyy/p/13030898.html)

### Plugins
#### cypress-file-upload
install<br>
`npm install --save-dev cypress-file-upload`

在 cypress/support/command.ts 添加<br>
`import 'cypress-file-upload'; `<br>

測試 code [測試的網站](https://practice.automationbro.com/cart/)
```
describe('cypress-file-upload test', () => {
    it('upload file', () => {
        cy.visit("https://practice.automationbro.com/cart/");

        cy.get("input[type=file]").attachFile("test.txt");
        
        cy.get("input[value='Upload File']").click();

        cy.get("#wfu_messageblock_header_1_label_1").should(
            "contain",
            "uploaded successfully"
        )
    }) 
})
```
----
參考資料
* [https://www.cypress.io/](https://www.cypress.io/)
* [https://www.npmjs.com/package/@cypress/schematic](https://www.npmjs.com/package/@cypress/schematic)
* [https://docs.cypress.io/guides/references/best-practices](https://docs.cypress.io/guides/references/best-practices)
* [https://levelup.gitconnected.com/write-e2e-tests-with-angular-and-cypress-1f011f673a5e](https://levelup.gitconnected.com/write-e2e-tests-with-angular-and-cypress-1f011f673a5e)
