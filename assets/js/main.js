/**
* Template Name: DevFolio - v4.8.1
* Template URL: https://bootstrapmade.com/devfolio-bootstrap-portfolio-html-template/
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/
(function() {
  "use strict";

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim()
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  }

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all)
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener))
      } else {
        selectEl.addEventListener(type, listener)
      }
    }
  }

  /**
   * Easy on scroll event listener 
   */
  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener)
  }

  /**
   * Navbar links active state on scroll
   */
  let navbarlinks = select('#navbar .scrollto', true)
  const navbarlinksActive = () => {
    let position = window.scrollY + 200
    navbarlinks.forEach(navbarlink => {
      if (!navbarlink.hash) return
      let section = select(navbarlink.hash)
      if (!section) return
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        navbarlink.classList.add('active')
      } else {
        navbarlink.classList.remove('active')
      }
    })
  }
  window.addEventListener('load', navbarlinksActive)
  onscroll(document, navbarlinksActive)

  /**
   * Scrolls to an element with header offset
   */
  const scrollto = (el) => {
    let header = select('#header')
    let offset = header.offsetHeight

    if (!header.classList.contains('header-scrolled')) {
      offset -= 16
    }

    let elementPos = select(el).offsetTop
    window.scrollTo({
      top: elementPos - offset,
      behavior: 'smooth'
    })
  }

  /**
   * Toggle .header-scrolled class to #header when page is scrolled
   */
  let selectHeader = select('#header')
  if (selectHeader) {
    const headerScrolled = () => {
      if (window.scrollY > 100) {
        selectHeader.classList.add('header-scrolled')
      } else {
        selectHeader.classList.remove('header-scrolled')
      }
    }
    window.addEventListener('load', headerScrolled)
    onscroll(document, headerScrolled)
  }

  /**
   * Back to top button
   */
  let backtotop = select('.back-to-top')
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add('active')
      } else {
        backtotop.classList.remove('active')
      }
    }
    window.addEventListener('load', toggleBacktotop)
    onscroll(document, toggleBacktotop)
  }

  /**
   * Mobile nav toggle
   */
  on('click', '.mobile-nav-toggle', function(e) {
    select('#navbar').classList.toggle('navbar-mobile')
    this.classList.toggle('bi-list')
    this.classList.toggle('bi-x')
  })

  /**
   * Mobile nav dropdowns activate
   */
  on('click', '.navbar .dropdown > a', function(e) {
    if (select('#navbar').classList.contains('navbar-mobile')) {
      e.preventDefault()
      this.nextElementSibling.classList.toggle('dropdown-active')
    }
  }, true)

  /**
   * Scrool with ofset on links with a class name .scrollto
   */
  on('click', '.scrollto', function(e) {
    if (select(this.hash)) {
      e.preventDefault()

      let navbar = select('#navbar')
      if (navbar.classList.contains('navbar-mobile')) {
        navbar.classList.remove('navbar-mobile')
        let navbarToggle = select('.mobile-nav-toggle')
        navbarToggle.classList.toggle('bi-list')
        navbarToggle.classList.toggle('bi-x')
      }
      scrollto(this.hash)
    }
  }, true)

  /**
   * Scroll with ofset on page load with hash links in the url
   */
  window.addEventListener('load', () => {
    if (window.location.hash) {
      if (select(window.location.hash)) {
        scrollto(window.location.hash)
      }
    }
  });

  /**
   * Intro type effect
   */
  const typed = select('.typed')
  if (typed) {
    let typed_strings = typed.getAttribute('data-typed-items')
    typed_strings = typed_strings.split(',')
    new Typed('.typed', {
      strings: typed_strings,
      loop: true,
      typeSpeed: 100,
      backSpeed: 50,
      backDelay: 2000
    });
  }

  /**
   * Initiate portfolio lightbox 
   */
  const portfolioLightbox = GLightbox({
    selector: '.portfolio-lightbox'
  });

  /**
   * Testimonials slider
   */
  new Swiper('.testimonials-slider', {
    speed: 600,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    },
    slidesPerView: 'auto',
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true
    }
  });

  /**
   * Portfolio details slider
   */
  new Swiper('.portfolio-details-slider', {
    speed: 400,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    },
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true
    }
  });

  /**
   * Preloader
   */
  let preloader = select('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove()
    });
  }

  /**
   * Initiate Pure Counter 
   */
  new PureCounter();

})()

  
// 部落格資料
const blogData = [
    {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/HkCSx8Cwxl",
    category: "[Java] 型別擦除 Type erasure",
    description: "其實是 AI 幫我在產生程式碼的時候看到一些奇怪的 Annotation，才發現還有型別擦除這件事情啊。慚愧慚愧。",
    author: "Kai　2025.8.4",
    tags: "Java, Spring Boot"
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/Skn3s4TSge",
    category: "[DDD] DDD 專案實戰練習",
    description: "這是一篇紀錄 DDD 架構專案要如何執行、規劃、實作、思路的文章。可以 Clone 這個專案，其中的 readme 有更詳細的說明。",
    author: "Kai　2025.7.10",
    tags: "DDD, Java, Spring, Domain-Driven Design, DDD實戰",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/Skngqcf7ll",
    category: "[Uncategorized]Linux Auth",
    description: "一直以來在使用 Linux 時，只有熟悉那些常常用到的指令，例如 `cp` `mv` `rm` `ll` 這些，知道 `ll` 最前面有一串奇怪的字串是權限，但是從來沒有了解他到底在做什麼，直到最近專案上線，很多鬼故事發生...，我還是讀一下好了。",
    author: "Kai　2025.06.8",
    tags: "Linux, Permissions, Security, Uncategorized"
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/HJswE2Ufel",
    category: "[AI]IntelliJ 整合 GitHub Copilot agent 與 IntelliJ MCP Server",
    description: "因為之前都是用 VScode insider 整合 Github Copilot agent 和 MCP，Intellij 中的 Github copilot 沒有 Agent mode 可以用。最近又看到別人都用 Claude Desktop 整合 Intellij 和 MCP，沒道理我課 Copilot 的不行吧!!就來試試看。",
    author: "Kai　2025.05.30",
    tags: "AI, Intellij, GitHub, Copilot, MCP"
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/SkF7m8ibgg",
    category: "[Redis]caffeine-redis-cluster-h2-practice",
    description: "本來只是想練習一下 Redis Cluster 搭配 Redis stack 的 RedisJSON 與 Redisearch，沒想到 Redisearch 的限制這麼多，沒辦法好好搜尋，甚至必須犧牲 Redis Cluster 的優勢才能順利查詢。這個功能還是只適合單體的架構。",
    author: "Kai　2025.05.21",
    tags: "Java, Spring, Redis" 
  }, 
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/rJTCUHmxgg",
    category: "[Angular]Angular Build 環境設定：自訂環境 vs Production Build",
    description: "最近要 Release 才知道用 Production 來打包跟一般自訂的環境打包有差這麼多......",
    author: "Kai　2025.05.03",
    tags: "Angular"
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/Bkf7MHQgll",
    category: "[Angular] Tailwind 安裝與設定",
    description: "到好多地方看怎麼安裝,有些會失敗，最後整理出來的安裝步驟",
    author: "Kai　2025.05.03",
    tags: "Angular"
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/S1puSIqRyg",
    category: "[Angular] RxJS 練習專案",
    description: "本專案整理並實作了 RxJS 在 Angular 中的常用操作符，並依功能分類為 7 個練習分頁，每頁皆提供互動按鈕與輸出結果區塊。",
    author: "Kai　2025.04.14 ",
    tags: "Angular"
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/BJIClAu0kg",
    category: "[Angular] Angular LifecycleTest",
    description: "來複習一下 Angular 最基本的 生命週期，這篇文章會介紹 Angular 的生命週期，並且提供一個簡單的範例來說明。",
    author: "Kai　2025.04.13 ",
    tags: "Angular"
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/SkQpE8STJg",
    category: "[AI] VScode + Github Copilot 中整合 MCP Server",
    description: "MCP Server 是一個可以讓我們在使用 AI Client 時，整合各家服務的介面類型 protocol，最近有點紅，就來玩一下。",
    author: "Kai　2025.03.29",
    tags: "AI git vscode github"
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/S1BlX7rTyl",
    category: "[踩雷] Spring Boot 啟動失敗：StackOverflowError 與循環變數問題紀錄",
    description: "最近專案上線進入Production，我出大包，居然無法啟動，想說改改環境變數應該不太需要重啟測試，結果就啟動失敗：StackOverflowError。",
    author: "Kai　2025.03.29",
    tags: "踩雷 Spring Java Bug Debug"
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/rymgNI92yx",
    category: "[GIT]產出兩個 Git 分支間的程式碼差異報告（含繁體中文 UTF-8 處理）",
    description: "介紹使用 diff2html 工具產出程式碼差異比較報告及處理繁體中文 UTF-8 編碼問題。",
    author: "Kai　2025.03.21",
    tags: "Git diff2html",
  }, 
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/BywgolDh1x",
    category: "[JAVA]Spring Boot Logback 常用功能與設定",
    description: "每次寫 Logback 的時候，都是東湊西湊，那乾脆把常用的功能與設定整理一下吧。",
    author: "Kai　2025.03.18",
    tags: "Java Spring boot Logback",
  },  
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/H1dDPoHh1g",
    category: "[JAVA]pring Boot Jackson 常用功能與使用方法",
    description: "在做各種專案的時候，都常常用到 Jackson 這個套件，這邊就來整理一下 Jackson 的常用功能與使用方法。",
    author: "Kai　2025.03.17",
    tags: "Java Spring boot Jackson"
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/HkRAX-E3Jg",
    category: "[Git] Git `rebase`、`reset`、`revert` 差異",
    description: "真的在開發的時候，好像也不常用到這些指令，但需要用到的時候還是得分清楚挖!",
    author: "Kai　2025.03.16",
    tags: "Git rebase reset revert",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/ryZ4gpM3yg",
    category: "[Java] Hashing",
    description: "偶爾會用到 Hashing，不過都沒去搞懂他到底要幹嘛，哪些場景適合使用，就來寫一篇吧。也包含一般會員系統會怎麼處理密碼的部分。", 
    author: "Kai　2025.03.15",
    tags: "Java Hashing",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/rkLMRWdj1e",
    category: "[Git] Git Tag 使用指南",
    description: "這篇主要是在介紹 Git Tag 的使用方式，以及如何在專案中使用 Tag 來做版本控制。",
    author: "Kai　2025.03.08",
    tags: "Git Tag 版本控制",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/S1J7f5d9yx",
    category: "[Uncategorized] 專案壓力測試指南",
    description: "這篇主要是在介紹 Java 專案壓力測試的進行流程與規劃，其中使用的壓力測試工具是 JMeter。",
    author: "Kai　2025.02.23",
    tags: "Java 壓力測試 JMeter 性能測試 壓力測試流程 壓力測試文件 JVM參數 性能優化",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/SyqKpzwvJx",
    category: "[Spring] Spring Boot Test：從基礎到實戰",
    description: "這篇主要是介紹 Spring Boot Test 的基礎，並且實際寫一個簡單的測試案例。",
    author: "Kai　2025.01.29",
    tags: "Spring, Java, Test, Junit, JacCoCo",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/rk4sl16wye",
    category: "[Nginx] Nginx HTTPS 設定",
    description: "使用 Nginx 來設定 HTTPS，並藉由反向代理來導向我們的 Domain Name。",
    author: "Kai　20250121",
    tags: "Nginx",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/r18obH_Lye",
    category: "[Spring] Spring Cache 學習指南",
    description:
      "Cache 那麼重要，都還沒有好好地寫一篇文章，剛好最近有個專案會有大量用戶，且有壓測需求，那就來把 Cache 的文章寫一下吧。",
    author: "Kai　20250109",
    tags: "Spring, Java",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/B1Z-jtoSkg",
    category: "[Uncategorized] UUID, GUID, ULID 是甚麼?",
    description: "最近專案在 LOG 紀錄時，想要用一些唯一值的方式來提升辨識度，所以查了一下 UUID, GUID, ULID 的差異，這邊做個筆記。",
    author: "Kai　2024.12.27",
    tags: "Uncategorized",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/HJ5F3anekx",
    category: "[K8S] CKAD exam note part 2",
    description: "準備 CKAD 考試的時候寫的筆記，滿多滿雜的，但都是考試範圍內的東西。希望對大家有幫助。",
    author: "Kai　2024.11.18",
    tags: "k8s",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/ry0hLXSC0",
    category: "[K8S] CKAD exam note part 1",
    description: "準備 CKAD 考試的時候寫的筆記，滿多滿雜的，但都是考試範圍內的東西。希望對大家有幫助。",
    author: "Kai　2024.11.18",
    tags: "k8s",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/rJZ5hEgsC",
    category: "[CI/CD] Github action practice",
    description: "這篇主要是介紹如何使用 Github Action 來做 CI/CD，其中包含 Angular, Spring Boot, Containerication, gmail notify，會在部屬完成後寄信通知。",
    author: "Kai　2024.8.19",
    tags: "CICD, Angular, Spring, Docker",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/rJ1T3yJi0",
    category: "[Docker] Package Angular project and upload to Docker Hub",
    description: "這篇主要是介紹如何將Angular專案打包成Docker Image，並上傳到Docker Hub，讓大家可以使用。",
    author: "Kai　2024.8.18",
    tags: "Docker, Angular",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/SJJKhJJiR",
    category: "[Docker] Package Spring boot project upload to Docker Hub",
    description: "這篇主要是介紹如何將Spring Boot專案打包成Docker Image，並上傳到Docker Hub，讓大家可以使用。",
    author: "Kai　2024.8.18",
    tags: "Docker, Spring, Java",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/rJB-gvJt0",
    category: "[Java] Springboot Fileter VS Interceptor VS Aspect",
    description: "這兩天專案上遇到要在很多地方處理 JWT，我提出 Filter 跟 Interceptor 都可以使用。查一查發現，對吼，我還有 Aspect 也可以達到一樣的目的。那到底，這三種到底有甚麼差別?",
    author: "Kai　2024.7.25",
    tags: "Java, Spring",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/Sk8YMn__A",
    category: "[Java] 如果前端是送來 Post Request，要怎麼在 Java 端 Redirect ?",
    description: "前端送來 Get Request，可以直接回應 \"redirect:/url\"，但如果是 Post Request，要怎麼在 Java 端 Redirect 呢?",
    author: "Kai　2024.7.20",
    tags: "Java",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/rJskRb_dC",
    category: "[Java]Customize Annotation In Spring Boot",
    description: "平常很常使用 Spring boot 提供給我們的 Annotation，實在是有夠方便。如果也可以自己做一些 Annotation，就可以幫我做完一堆事情，感覺就很潮!",
    author: "Kai　2024.7.20",
    tags: "Java, Spring",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/SkQtZ-us5",
    category: "[Redis] Redis with Spring Boot",
    description: "這篇主要是介紹如何在Spring Boot專案中使用Redis，簡單介紹各種操作，應該可以算是挺實用的!",
    author: "Kai　2024.6.20",
    tags: "Java, Spring, Redis",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/B1RLhKqBA",
    category: "[其他] 從瀏覽器網址列輸入URL到網頁顯示的過程",
    description: "當我們在瀏覽器的網址列輸入一個URL，然後按下Enter鍵，瀏覽器就會開始載入網頁。大概寫寫發生甚麼事情~",
    author: "Kai　2024.6.15",
    tags: "Uncategorized",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/ByCfCFOrC",
    category: "[Java] 列舉 Enum",
    description: "枚舉是一種特殊的類型，它可以用來表示一組固定的常數。枚舉在Java中是一個非常有用的功能，常常在各種情況下扮演重要的輔助腳色。",
    author: "Kai　2024.6.15",
    tags: "Java",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/SkQNb98BR",
    category: "[Uncategorized] Angular專案如何即時呈現在手機上",
    description: "最近的專案是所謂的 \"小網\"，也就是一個嵌入在手機 APP 裡面的網頁。這個網頁同時有網頁版及手機版，但我們也不是專業的手機 APP 開發者，想要可以讓網及在開發階段即時呈現在手機上該怎麼做呢?",
    author: "Kai　2024.6.12",
    tags: "Uncategorized",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/ry6nz4HBC",
    category: "[Java] 物件導向設計",
    description: "物件導向設計(Object-Oriented Design, OOD)是一種軟體設計方法，它將軟體系統中的元素組織為物件(Object)。",
    author: "Kai　2024.6.11",
    tags: "Java",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/ByRN-y7S0",
    category: "[Java] JIB - Java Image Builder",
    description: "JIB 是一個專為 Java 開發者設計的 Docker Image Builder，它可以幫助開發者快速、簡單地構建 Java 應用的 Docker Image。",
    author: "Kai　2024.6.9",
    tags: "Java",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/H1KnBCz4R",
    category: "[Nginx] Nginx基礎介紹",
    description: "Nginx是一個高性能的HTTP和反向代理伺服器，也是一個IMAP/POP3/SMTP伺服器。",
    author: "Kai　2024.6.6",
    tags: "Nginx",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/ryQQ8-INA",
    category: "[Java] 字串",
    description: "在 Java 中，字串代表一組字元，是 java.lang.String 類別的實例，Java 中的物件特性他都具備，不過字串有一些特殊的特性，是為了效能考量而設計的。",
    author: "Kai　2024.5.30",
    tags: "Java",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/HyQjYhN4C",
    category: "[Java] 陣列物件",
    description: "陣列在 Java 中是一種物件，它是一種容器，可以容納多個相同型別的元素。陣列的元素可以是基本型別或物件型別。",
    author: "Kai　2024.5.29",
    tags: "Java",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/rJpuO4VE0",
    category: "[Uncategorized] C4 model",
    description: "C4 model是一種用於視覺化和描述軟件架構的方法，它提供了一套標準化的語言來描繪系統的各個層面。",
    author: "Kai　2024.5.29",
    tags: "Uncategorized",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/S1726v7NC",
    category: "[Java] 基本型別包裹類別",
    description: "Java基本型別包裹類別，包含基本型別、基本型別包裹類別、基本型別轉換、基本型別包裹類別轉換。",
    author: "Kai　2024.5.28",
    tags: "Java",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/ByurAal4R",
    category: "[Java] 基礎語法",
    description: "Java基礎語法，包含型別、運算子、流程控制。",
    author: "Kai　2024.5.27",
    tags: "Java",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/rJa79veVC",
    category: "[Java] JVM/JDK/JRE,PATH",
    description: "簡介一下JVM、JDK、JRE的關係，以及如何設定PATH。",
    author: "Kai　2024.5.26",
    tags: "Java",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/B1yTAxtii",
    category: "[Clean Code]涵式",
    description: "一個函式應該只做一件事，做好這件事，只做一件事。 -資料來源 - Clean code 無瑕的程式碼。",
    author: "Kai　2024.4.23",
    tags: "Clean Code",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/S1XG2kYjs",
    category: "[Clean Code]有意義的命名",
    description: "讓名稱代表意圖-使之名副其實。 -資料來源 - Clean code 無瑕的程式碼。",
    author: "Kai　2024.4.23",
    tags: "Clean Code",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/HJYK6cNWR",
    category: "[Splunk] Install splunk by docker with persistence",
    description: "Use the docker to install the splunk, and use the volume to persist the data.",
    author: "Kai　2024.4.23",
    tags: "Docker, Splunk",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/SJ5SR87WA",
    category: "[Linux] How to install docker in a disk other than the root disk(Azure VM)",
    description: "When we install docker in the Linux, the default disk is the root disk. If we want to install docker in another disk, we can use the following steps.",
    author: "Kai　2024.4.22",
    tags: "Linux, Docker",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/H1JfNCFna",
    category: "[Angular] How to set the customize breakpoint when using bootstrap in Angular",
    description: "When we use bootstrap in Angular, we can use the customize breakpoint to set the responsive design.",
    author: "Kai　2024.3.3",
    tags: "Angular",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/rkz2HK-a6",
    category: "[Docker] Remove Rencher-desktop leave the wsl problem",
    description: "I use docker-desktop in the beginning, another day, I need to install Rancher-desktop for one day. After that, I remove the Rancher-desktop, and I found that the wsl has some problem.",
    author: "Kai　2024.3.3",
    tags: "Docker",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/Hk7MxHUq6",
    category: "[Redis] Redis with Lua script",
    description: "Introduction to Redis Lua script, and how to use it in Spring Boot.",
    author: "Kai　2024.1.30",
    tags: "db",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/Bk1ZhSWca",
    category: "[Redis] Skeleton of Spring Boot + Redis OM + Redis Stack",
    description: "This project is a skeleton of Spring Boot + Redis OM + Redis stack. The purpose of this project is to provide some demo code for the Redis OM and the Redis stack.",
    author: "Kai　2024.1.26",
    tags: "db",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/SkI88LCtT",
    category: "[Redis] Redis Stack(partial)",
    description: "Redis stack is an enhanced version of redis, add  a lot of modules to redis, such as: search, graph, time series, JSON, AI, etc.",
    author: "Kai　2024.1.20",
    tags: "db",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/Syy6u4IKp",
    category: "[Redis] Redis",
    description: "Redis is an open source, in-memory data structure store, no relational database management system, it can be used as a database, cache and message broker.",
    author: "Kai　2024.1.18",
    tags: "db",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/rkcpcvmYT",
    category: "[Kubernetes] Deploy Kubernetes-dashboard",
    description: "Kubernetes-dashboard is a web-base UI for Kubernetes. We can use it to monitor our cluster, manage our resources, and troubleshoot our cluster.",
    author: "Kai　2024.1.16",
    tags: "K8s",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/H1x7ZbaOa",
    category: "[Repostitory] SonaType Nexus Repository Manager (Docker)",
    description: "SonaType Nexus Repository Manager 是一個用來管理軟體套件的私有倉庫，可以用來存放各種軟體套件，例如：Java、Node.js、Python、Docker、Maven、Gradle等等。",
    author: "Kai　2024.1.11",
    tags: "Docker, Repository",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/HysLiEzps",
    category: "[Kafka] Kafka 例外處理",
    description: "原生的 Kafka 並沒有提供例外處理的功能，但是我們可以透過自定義的方式來達到例外處理的效果。",
    author: "Kai　2022.2.3",
    tags: "Kafka, Spring boot, Java",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/Sy40MBnH6",
    category: "[Uncategorized]資料倉儲( Data Warehouse )",
    description: "資料倉儲是一個用來存放大量資料的系統，這些資料來自於不同的資料來源，並且經過處理後，可以用來進行分析、報表、BI等等的應用。",
    author: "Kai　2023.12.5",
    tags: "Uncategorized",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/HyIK0gWN6",
    category: "[git] github copilot for cli",
    description: "github copilot for cli 是一個可以在終端機上使用的工具，可以幫助我們快速或理解command line的指令。",
    author: "Kai　2023.11.14",
    tags: "Git",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/rJ6JE6xVp",
    category: "[Design Pattern] 設計模式",
    description: "這是一篇以Java出發，整理各種設計模式的文章，目前還在持續更新中，有興趣的可以看看，有錯誤的地方歡迎指正，謝謝。",
    author: "Kai　2023.11.14",
    tags: "Java, Design Pattern",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/r12NpHlVa",
    category: "[Java] Udemy Jenkins 筆記(未完)",
    description: "Jenkins是一個開源的自動化伺服器，用於自動化各種任務，包括建置、測試和部署軟體。",
    author: "Kai　2023.11.4",
    tags: "CICD",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/rJBwuckX6",
    category: "[Java] JUC-多線程",
    description: "JUC是Java.util.concurrent的縮寫，是Java5之後提供的並發處理API，包含了許多實用的工具類，可以讓我們更方便的進行並發程式的開發。",
    author: "Kai　2023.11.1",
    tags: "Java",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/rkhtpmyXa",
    category: "[Git] Conventional Commits 常規式提交",
    description: "Conventional Commits 是一種規範化的提交訊息格式，它可以讓你的提交訊息更加清晰、更容易被機器解析，並且可以生成 CHANGELOG。",
    author: "Kai　2023.11.1",
    tags: "Git",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/HJ03uK5a2",
    category: "[Nginx] 使用docker, nginx讀取靜態檔案",
    description: "使用docker啟動nginx，讀取靜態檔案。",
    author: "Kai　2023.8.29",
    tags: "Docker, Nginx",
  },
  {
    href: "https://hackmd.io/lF873v9dT0SSFMFrSVS3AA",
    category: "[Java] Java 8 - 17 jeps 重點整理",
    description: "不負責任的整理了一下 Java 8 - 17 的 jeps，有興趣的可以看看，有錯誤的地方歡迎指正，謝謝。",
    author: "Kai　2023.5.10",
    tags: "Java",
  },
  {
    href: "https://hackmd.io/@ohQEG7SsQoeXVwVP2-v06A/S170WynZ3",
    category: "[Cypress] cypress 前端測試 with angular 簡單介紹及教學",
    description: "Cypress是一個開源的端對端測試框架，它可以幫助開發人員在網頁應用程序上進行自動化測試。Cypress與其他測試框架不同之處在於它直接在瀏覽器中運行。",
    author: "Kai　2023.4.30",
    tags: "Angular, Cypress",
  },
  {
    href: "https://hackmd.io/5hPk51G5RO-FQwr3sADncQ",
    category: "[Angular] FormGroup的同步驗證與非同步驗證範例",
    description: "就......就是一個簡單的範例而已啦，不要太期待。",
    author: "Kai　2023.5.1",
    tags: "Angular",
  },
  {
    href: "https://hackmd.io/yQCyMH4QREOjTKwuS2Otwg",
    category: "[Gradle] 為自己學Gradle",
    description: "Gradle是一款開源的自動化建構、測試和部署軟體專案的建構工具。它基於 Groovy (或Kotlin)語言和簡潔的領域特定語言 (DSL)，具有靈活且強大的功能。",
    author: "Kai　2023.5.1",
    tags: "Gradle",
  },
  {
    href: "https://hackmd.io/Q2pVevNuRNe4ycTSPeONXA",
    category: "[Kafka] 尚硅谷kafka筆記",
    description: "kafka是一個分散式的基於發布訂閱模式的消息列隊，主要應用於大數據處裡，也特別適合微服務架構下的應用場景，用於取代傳統的消息中間件。",
    author: "Kai　2023.2.28",
    tags: "Java, Kafka",
  },
  {
    href: "https://hackmd.io/YzL0zKfyS36kgfVhpBGWXQ",
    category: "[K8s] spring boot k8s 101",
    description: "利用docker desktop for windows 來建立一個k8s的環境，並且利用spring boot來建立一個簡單的web server，並且將其部署到k8s上。",
    author: "Kai　2022.9.30",
    tags: "Java, Spring, Docker, k8s",
  },
  {
    href: "https://hackmd.io/9abXfYDpRgyscKi6iAvTsw",
    category: "[k8s] k8s 簡介",
    description: "簡介k8s的基本概念，並且介紹k8s的架構。",
    author: "Kai　2022.9.30",
    tags: "k8s",
  },
  {
    href: "https://hackmd.io/qAKvTWosT9-eEw5wlY66Lw",
    category: "[Spring boot] Spring Boot配置與XML配置",
    description: "Spring Boot 配置類與XML配置簡介。",
    author: "Kai　2022.8.31",
    tags: "Spring",
  },
  {
    href: "https://hackmd.io/qQiSUjy8R4y2hE5zMBTzlw",
    category: "[Lambda] java 8 Lambda簡介",
    description: "java 8 Lambda簡介結構與使用方法。",
    author: "Kai　2022.7.31",
    tags: "Java, Lambda",
  },
  {
    href: "https://hackmd.io/s7vfJ3xkTZCegAC6npnKWQ",
    category: "[Angular] Angular 安裝",
    description: "Angular 安裝步驟及建立一個新的Angular專案。",
    author: "Kai　2022.7.31",
    tags: "Angular",
  },
  {
    href: "https://hackmd.io/4_7YdydnSzGQEOrg_QBcWA",
    category: "[Angular] Angular Schematics 101",
    description: "學習使用Angular Schematics。",
    author: "Kai　2022.7.31",
    tags: "Angular",
  },
  {
    href: "https://hackmd.io/JrZjsP3GQQOGvtp4TVDn8w",
    category: "[Redis] Spring boot Redis Docker Example",
    description: "Spring boot 搭配 Docker 部署 Redis。",
    author: "Kai　2022.7.31",
    tags: "Spring, Docker",
  },
  {
    href: "https://hackmd.io/YitwxGAvT0atTU1VqRA-Gg",
    category: "[Optional] java 8 optional",
    description: "java 8 optional簡介及使用範例。",
    author: "Kai　2022.7.31",
    tags: "Java, Optional",
  },
  {
    href: "https://hackmd.io/kLcpMpjBSiGkHmU0mVa16A",
    category: "[Docker] docker 101(PostgreSQL)",
    description: "簡介Docker及使用Docker部署PostgreSQL。",
    author: "Kai　2022.7.31",
    tags: "Docker",
  },
  {
    href: "https://hackmd.io/8_ABzjRmRMqSQ6piOZGctQ",
    category: "[Apache] 安裝Apache(與tomcat的差別)",
    description: "簡介Apache與Tomcat的差別，並安裝Apache。",
    author: "Kai　2022.7.31",
    tags: "Apache, Tomcat",
  },
  {
    href: "https://hackmd.io/wUbrRyHJTnmC6chbmijOtw",
    category: "[Spring] Spring boot 連線池",
    description: "簡介Spring boot中連線池的優先順序。",
    author: "Kai　2022.7.31",
    tags: "Spring",
  },
  {
    href: "https://hackmd.io/5i-ITdsbQaCJZdPzJa79Zw",
    category: "[Spring data] Spring Data Jpa常用關鍵字",
    description: "Spring Data Jpa常用關鍵字範例。",
    author: "Kai　2022.7.31",
    tags: "Spring, Jpa",
  },
  {
    href: "https://hackmd.io/fYSAeQFnQPe1c0ZyC3MC5g",
    category: "[RabbitMQ] RabbitMQ 消息列隊練習",
    description: "RabbitMQ 消息列隊簡介與結合spring boot使用練習。",
    author: "Kai　2022.7.31",
    tags: "RabbitMQ, Spring",
  },
  {
    href: "https://hackmd.io/tEBYj6uZRj-a8TvSXI4yHw",
    category: "[Line bot] Spring boot line bot",
    description: "練習使用Spring boot建立line bot，並結合mongodb。",
    author: "Kai　2022.7.31",
    tags: "Spring, Line bot",
  }
];

const itemsPerPage = 5;
let currentPage = 1;
let currentCategory = "";
let currentSearchTerm = "";

const renderBlogPage = (page, category, searchTerm) => {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  let filteredData = category
    ? blogData.filter((blog) => blog.tags.includes(category))
    : blogData;

  if (searchTerm) {
    filteredData = filteredData.filter((blog) =>
      blog.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.tags.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  const paginatedData = filteredData.slice(startIndex, endIndex);

  const blogContainer = document.getElementById("blog-container");
  blogContainer.innerHTML = ""; // 清空內容

  paginatedData.forEach((blog) => {
    const tempDiv = document.createElement("div");
    tempDiv.style.position = "absolute";
    tempDiv.style.visibility = "hidden";
    tempDiv.style.width = "100%";
    tempDiv.innerHTML = `<h6 class="category" style="overflow-wrap: break-word;">${blog.category}</h6>`;
    document.body.appendChild(tempDiv);
    const categoryHeight = tempDiv.offsetHeight / 16; // 將像素轉換為 rem
    document.body.removeChild(tempDiv);

    const blogHTML = `
      <div class="col-md-12">
        <a href="${blog.href}" target="_blank">
          <div class="card card-blog">
            <div class="card-body">
              <div class="card-category-article-box">
                <div class="card-category">
                  <h6 class="category" style="overflow-wrap: break-word;">${blog.category}</h6>
                </div>
              </div>
              <div class="card-description-wrapper" 
                style="margin-top: ${categoryHeight + 1}rem;">
                <p class="card-description mt-3 text-wrap">${blog.description}</p>
              </div>
            </div>
            <div class="card-footer">
              <div class="post-author">
                <span class="author">${blog.author}</span>
              </div>
              <div class="post-date">
                <span class="bi bi-tag"></span> ${blog.tags}
              </div>
            </div>
          </div>
        </a>
      </div>
    `;
    blogContainer.innerHTML += blogHTML;
  });

  document.getElementById("pagination").innerHTML = `
    <div class="pagination-controls text-center">
      ${currentPage > 1 ? `<button class="btn btn-secondary mx-2" style="background-color: #6c757d; color: white;" onclick="changePage(${currentPage - 1})">上一頁</button>` : ""}
      <span style="font-weight: bold;">頁數: ${currentPage} / ${Math.ceil(filteredData.length / itemsPerPage)}</span>
      ${currentPage < Math.ceil(filteredData.length / itemsPerPage) ? `<button class="btn btn-secondary mx-2" style="background-color: #6c757d; color: white;" onclick="changePage(${currentPage + 1})">下一頁</button>` : ""}
    </div>
  `;
};

const changePage = (page) => {
  currentPage = page;
  renderBlogPage(currentPage, currentCategory, currentSearchTerm);

  const blogSection = document.getElementById("blog");
  if (blogSection) {
    blogSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const categories = [
  "全部", "Java", "Spring", "Docker", "Repository", "k8s", "Angular", "Apache", "Kafka", "Gradle", "Git", "CICD", "Design Pattern", "db", "Clean Code", "Uncategorized"
];

// 搜尋功能
const searchContainer = document.createElement("div");
searchContainer.classList.add("text-center", "my-3");

// document.querySelector("#blog .title-box").appendChild(searchContainer);

const searchInput = document.getElementById("search-input");

document.addEventListener("DOMContentLoaded", () => {
    const categories = [
      "全部", "Java", "Spring", "踩雷", "AI", "Docker", "Repository", "k8s", "Angular", "Apache", "Kafka", "Gradle", "Git", "CICD", "Design Pattern", "db", "Clean Code", "Uncategorized"
    ];
    const categoryContainer = document.getElementById("category-container");
    
    categories.forEach((category) => {
      const button = document.createElement("button");
      button.textContent = category;
      button.classList.add("btn", "btn-outline-secondary", "m-1", "category-button");
      button.onclick = () => {
        document.querySelectorAll(".category-button").forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
        currentCategory = category === "全部" ? "" : category;
        currentPage = 1;
        renderBlogPage(currentPage, currentCategory, currentSearchTerm);
      };
      categoryContainer.appendChild(button);
    });

    // 添加左右箭頭
    const leftArrow = document.createElement("button");
    leftArrow.classList.add("scroll-arrow", "left");
    leftArrow.innerHTML = "&larr;";
    leftArrow.onclick = () => {
      categoryContainer.scrollBy({ left: -100, behavior: "smooth" });
    };
    document.getElementById("category-container-wrapper").appendChild(leftArrow);

    const rightArrow = document.createElement("button");
    rightArrow.classList.add("scroll-arrow", "right");
    rightArrow.innerHTML = "&rarr;";
    rightArrow.onclick = () => {
      categoryContainer.scrollBy({ left: 100, behavior: "smooth" });
    };
    document.getElementById("category-container-wrapper").appendChild(rightArrow);

    // 更新箭頭顯示狀態
    const updateArrows = () => {
      if (categoryContainer.scrollLeft > 0) {
        leftArrow.style.display = "block";
      } else {
        leftArrow.style.display = "none";
      }
      if (categoryContainer.scrollLeft + categoryContainer.clientWidth < categoryContainer.scrollWidth) {
        rightArrow.style.display = "block";
      } else {
        rightArrow.style.display = "none";
      }
    };

    categoryContainer.addEventListener("scroll", updateArrows);
    window.addEventListener("resize", updateArrows);
    updateArrows();
    
    // 搜尋功能
    const searchInput = document.getElementById("search-input");
    searchInput.addEventListener("input", (e) => {
      currentSearchTerm = e.target.value;
      currentPage = 1;
      renderBlogPage(currentPage, currentCategory, currentSearchTerm);
    });
  });

  // 初始化
  renderBlogPage(currentPage, currentCategory, currentSearchTerm);



// ----懸浮圖片功能 start----
  document.addEventListener('DOMContentLoaded', function() {
    const hoverContainer = document.getElementById('hover-image-container');
    const hoverImage = document.getElementById('hover-image');
    const hoverCaption = document.getElementById('hover-caption');
    const triggers = document.querySelectorAll('.hover-trigger');
    let isMobile = window.innerWidth < 768;
    let activeElement = null;
    
    // 判斷設備類型
    window.addEventListener('resize', function() {
      isMobile = window.innerWidth < 768;
    });
    
    // 滑鼠懸停顯示圖片
    triggers.forEach(trigger => {
      // 滑鼠事件 (桌面版)
      trigger.addEventListener('mouseenter', function(e) {
        if (isMobile) return;
        
        const imageSrc = this.getAttribute('data-image');
        const caption = this.getAttribute('data-caption');
        
        showImage(imageSrc, caption, e);
      });
      
      trigger.addEventListener('mousemove', function(e) {
        if (isMobile) return;
        
        // 更新圖片位置
        updatePosition(e);
      });
      
      trigger.addEventListener('mouseleave', function() {
        if (isMobile) return;
        
        hideImage();
      });
      
      // 觸摸事件 (手機版)
      trigger.addEventListener('touchstart', function(e) {
        e.preventDefault();
        
        const imageSrc = this.getAttribute('data-image');
        const caption = this.getAttribute('data-caption');
        
        // 如果已有活動元素且不是當前元素，移除活動狀態
        if (activeElement && activeElement !== this) {
          activeElement.classList.remove('active');
          hideImage();
        }
        
        // 切換當前元素狀態
        if (this.classList.contains('active')) {
          this.classList.remove('active');
          hideImage();
          activeElement = null;
        } else {
          this.classList.add('active');
          showImage(imageSrc, caption);
          activeElement = this;
        }
      });
    });
    
    // 點擊其他區域關閉圖片 (手機版)
    document.addEventListener('touchstart', function(e) {
      if (activeElement && !activeElement.contains(e.target) && !hoverContainer.contains(e.target)) {
        activeElement.classList.remove('active');
        hideImage();
        activeElement = null;
      }
    });
    
    // 顯示圖片
    function showImage(src, caption, event) {
      hoverImage.src = src;
      hoverCaption.textContent = caption || '';
      
      hoverImage.onload = function() {
        hoverContainer.style.display = 'block';
        
        if (event && !isMobile) {
          updatePosition(event);
        }
      };
    }
    
    // 隱藏圖片
    function hideImage() {
      hoverContainer.style.display = 'none';
    }
    
    // 更新圖片位置 (桌面版)
    function updatePosition(e) {
      const x = e.clientX;
      const y = e.clientY;
      
      // 根據滑鼠位置計算容器位置
      let posX = x + 20; // 滑鼠右側20px
      let posY = y + 20; // 滑鼠下方20px
      
      // 檢查是否超出視窗右側
      if (posX + hoverContainer.offsetWidth > window.innerWidth) {
        posX = x - hoverContainer.offsetWidth - 10;
      }
      
      // 檢查是否超出視窗底部
      if (posY + hoverContainer.offsetHeight > window.innerHeight) {
        posY = y - hoverContainer.offsetHeight - 10;
      }
      
      // 設置容器位置
      hoverContainer.style.left = posX + 'px';
      hoverContainer.style.top = posY + 'px';
    }
  });
// ----懸浮圖片功能 end----