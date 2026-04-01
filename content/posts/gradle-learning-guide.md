---
title: "為自己學Gradle (還可以許願開發上遇到甚麼相關問題)"
date: "2026-03-24"
category: "Backend"
tags: ["Spring Boot", "Logback"]
summary: "Gradle是一款開源的自動化建構、測試和部署軟體專案的建構工具。它基於 Gro"
published: true
---

{%hackmd BJzAwtWvp %}
# 為自己學Gradle (還可以許願開發上遇到甚麼相關問題)
Gradle是一款開源的自動化建構、測試和部署軟體專案的建構工具。它基於 Groovy (或Kotlin)語言和簡潔的領域特定語言 (DSL)，具有靈活且強大的功能。
## Gradle簡介
Gradle 旨在提供一種高度可配置且可擴展的建構系統，以滿足不同專案的需求。它使用基於簡潔 DSL 的 Gradle 构建腳本，使您能夠以簡單直觀的方式定義專案的結構、依賴關係和任務。

Gradle還有以下幾個特色
* 靈活性和可擴展性
    * Gradle 的插件機制允許您根據需要自定義構建邏輯，並與其他工具和技術整合。
* 自動化依賴管理
    * Gradle 使用 Maven 中央存儲庫 (Central Repository) 作為默認的依賴管理系統，同時也支持其他存儲庫。
* 增量構建
    * Gradle 通過緩存編譯輸出和任務輸入/輸出的方式實現增量構建，僅執行必要的任務，從而提高構建效率。也因此，spring、spring boot的源碼使用了gradle取代maven。
* 多專案支持
    * Gradle 可以輕鬆處理包含多個子專案的大型專案，並在專案之間共享配置和依賴關係。
* 多語言支持
    * Gradle 不僅可以用於 Java 專案，還支持其他語言和技術，如 Kotlin、Groovy、C/C++、Android 和 Web 開發。

## 跟Maven差在哪裡?
|功能/特點|Gradle|Maven|
|------|------|------|
|建構腳本語言|Groovy或kolin|XML|
|配置和自定義彈性|較高|較低|
|增量建構|有|有|
|平行建構|有|無|
|處理大型項目性能|較高|較低|
|組件化建構|有|有|
|緩存機制|較快的依賴項目解析速度、支援跨專案緩存共享|快速的依賴項目解析速度，但緩存無法在專案間共享|
|儲存庫管理|支援本地和遠程儲存庫，自定義儲存庫和儲存庫格式|支援本地和遠程儲存庫，預設使用中央儲存庫，無法自定義儲存庫|
|套件生態系統|豐富的套件生態系統，易於擴展和整合不同的工具和框架|廣泛的套件生態系統，但不如Gradle豐富，需要額外編寫套件以滿足特定需求|
|跨平台支援|支援Windows、macOS和Linux等多個平台|支援Windows、macOS和Linux等多個平台|
|社區支援和文件|大型且活躍的社區，詳細的官方文檔和示例|大型且活躍的社區，詳細的官方文檔和示例|
|雲端建構和CI/CD集成|與許多CI/CD工具和雲服務（如Jenkins、Travis CI和CircleCI等）集成良好|與許多CI/CD工具和雲服務（如Jenkins、Travis CI和CircleCI等）集成良好|
|學習曲線|相對陡峭，但易於上手和開始使用|相對平緩，但較為傳統和基於XML，需要更多學習和配置的時間|
|項目的廣泛應用|適用於各種類型的項目，尤其是大型和複雜的項目|適用於各種類型的項目，尤其是傳統的Java項目|


## 使用intellij建立gradle專案


1. 使用spring initializr來建立spring + gradle的專案
2. 使用intellij開啟這個專案
3. 以下有幾個與gradle相關的檔案
    1. build.gradle
        這是Gradle建構腳本的主要檔案，其中包含了項目的配置和依賴項的管理。在build.gradle檔案中，您可以指定項目的依賴項、插件、建構任務、測試配置和其他相關設定。這是Gradle專案中最重要的檔案之一，它定義了整個建構過程的行為和設定。
        以最基本的幾個配置來介紹使用方法
        ```java
        // plugins area is used to apply plugins to the project
        // id means the plugin id, you can find the plugin id in the gradle plugin portal
        // version means the plugin version
        plugins {
            id 'java'
            id 'org.springframework.boot' version '3.1.0'
            id 'io.spring.dependency-management' version '1.1.0'
        }

        // group means the group id of the project
        group = 'com.kai'
        // version means the version of the project
        version = '0.0.1-SNAPSHOT'
        // sourceCompatibility means the java version
        sourceCompatibility = '17'

        // configurations area is used to configure the project
        // there are some types of configurations: configurations {
            // define the dependency for the compile time
            compileOnly {
                extendsFrom annotationProcessor
            }

            // define the dependency for the test compile time
            testImplementation {
                exclude group: 'org.junit.vintage', module: 'junit-vintage-engine'
            }

            // define the dependency for the test runtime
            runtimeOnly {
                exclude group: 'org.springframework.boot', module: 'spring-boot-starter-logging'
            }

            // define the dependency for the test compile time
            customConfig {
                extendsFrom compileClasspath
            }
        }

        // repositories area is used to configure where to find the dependencies
        repositories {
            mavenCentral()
        }

        // dependencies area is used to configure the dependencies
        // there are some types of dependencies: implementation, compileOnly, runtimeOnly, testImplementation, testCompileOnly, testRuntimeOnly
        // implementation means the dependency is used in the compile time and runtime, it is the default configuration
        // compileOnly means the dependency is used in the compile time only, it is used to reduce the compile time
        // runtimeOnly means the dependency is used in the runtime only, it is used to reduce the size of the jar file
        // testImplementation means the dependency is used in the test compile time and runtime
        // testCompileOnly means the dependency is used in the test compile time only, it is used to reduce the test compile time
        // testRuntimeOnly means the dependency is used in the test runtime only, it is used to reduce the size of the test jar file
        dependencies {
            implementation 'org.springframework.boot:spring-boot-starter-web'
            compileOnly 'org.projectlombok:lombok'
            developmentOnly 'org.springframework.boot:spring-boot-devtools'
            annotationProcessor 'org.projectlombok:lombok'
            testImplementation 'org.springframework.boot:spring-boot-starter-test'
        }

        // tasks area is used to configure the tasks
        // named means the task name
        // useJUnitPlatform means the task uses the junit platform
        //tasks.named('test') {
        //	useJUnitPlatform()
        //}
        tasks.register('customTask') {
            doLast {
                println 'custom task  :D'
            }
        }

        ```

    2. gradlew
        這是Gradle的Wrapper腳本（Wrapper Script），它是一個可執行的腳本（通常是Unix/Linux上的shell腳本），用於在不安裝Gradle的情況下執行Gradle建構。它可以確保在不同環境中都能使用相同版本的Gradle進行建構，而不需要手動安裝Gradle。當您執行gradlew腳本時，它會檢查項目中的gradle/wrapper目錄，如果需要，它會自動下載和安裝Gradle。

    3. gradlew.bat
        這是Windows版本的Gradle Wrapper腳本，用於在Windows環境中執行Gradle建構。與gradlew腳本相似，gradlew.bat腳本也可以自動下載和安裝Gradle，並確保使用正確的版本進行建構。

        
    4. settings.gradle
        這是Gradle項目的設定檔，它用於定義項目的結構和模塊（Module）配置。在settings.gradle檔案中，您可以指定項目的根目錄、子模塊（如果有的話）以及其他項目屬性。它允許您將項目劃分為不同的模塊，並指定它們之間的相依關係。

 
### 使用intellij開啟gradle專案後，右側的gradle tab中的一些實用功能
* application
    * bootRun
        就是啟動該專案，與啟動專案中的main是一樣的。
    * bootRunTestRun
        運行 Spring Boot 測試。它會運行您的測試代碼並生成相應的測試報告。
* build
    * bootBuildImage
        用於構建Docker映像。它會構建一個Docker映像，並將應用程序的可執行文件和依賴項打包到映像中。
        運行後，在build/libs目錄中會生成一個jar檔案，然後將該jar檔案複製到Docker映像中。
        接著 docker images 可以看到剛剛建立的image
    * bootJar
        用於構建可執行的jar檔案。它會構建一個可執行的jar檔案，並將應用程序的可執行文件和依賴項打包到jar檔案中。
        接著在build/libs目錄中會生成一個jar檔案
        bootJar Task 用於構建 Spring Boot 應用程序的可運行 JAR 文件。
        使用 bootJar Task 構建的 JAR 文件包含了 Spring Boot 應用程序及其所有依賴，並且可以通過 java -jar 命令運行。
        bootJar Task 會自動設置主要類（Main Class），以便在運行 JAR 文件時自動啟動 Spring Boot 應用程序。
    * build
        使用 build Task 會執行一系列的子 Task，包括編譯源代碼、執行測試、打包 JAR 文件等。
        build Task 通常是項目的頂層 Task，可以作為構建整個項目的入口點。
    * classes
        classes 是 Gradle 中的一個 Task，用於編譯源代碼並生成編譯後的類文件。它是構建過程中的一個關鍵步驟，用於將源代碼轉換為可執行的 Java 類。
        通常情況下，classes Task 會在執行 build Task 或其他依賴於編譯的 Task 之前自動執行。它會掃描專案的源代碼目錄（預設為 src/main/java）中的 Java 源文件，並將其編譯為對應的類文件。
        較少單獨使用。
    * clean
        clean Task 用於清理項目的構建輸出。它會刪除 build 目錄及其子目錄中的所有文件，包括編譯後的類文件、打包的 JAR 文件、測試報告等。
        clean Task 通常是構建過程的第一步，用於清理之前構建過程產生的輸出，以確保每次構建都是從頭開始的。
    * jar
        jar Task 用於打包項目的源代碼。它會將項目的源代碼打包為一個 JAR 文件，並將其複製到 build/libs 目錄中。
        jar Task 通常是構建過程的最後一步，用於打包項目的源代碼。它會在執行 build Task 或其他依賴於打包的 Task 之前自動執行。
    * init
        init Task 用於初始化 Gradle 項目。它會生成一個 build.gradle 文件，並將其放置在項目的根目錄中。
    * wrapper
        wrapper Task 用於生成 Gradle Wrapper 腳本。它會生成一個 gradlew 腳本和一個 gradle/wrapper 目錄，並將其放置在項目的根目錄中。
        Gradle Wrapper 腳本用於在不安裝 Gradle 的情況下執行 Gradle 命令。它會自動下載和安裝 Gradle，並確保使用正確的版本進行構建。 
        不過通常情況下，Gradle Wrapper 腳本是由 Gradle IDE 插件自動生成的，無需手動執行 wrapper Task。
    * javadoc
        javadoc Task 用於生成項目的 Javadoc 文檔。它會掃描項目的源代碼目錄（預設為 src/main/java）中的 Java 源文件，並生成對應的 Javadoc 文檔。
        javadoc Task 通常是構建過程的一部分，用於生成項目的 Javadoc 文檔。它會在執行 build Task 或其他依賴於 javadoc Task 的 Task 之前自動執行。
        依照以下路徑可以找到index.html
        點開的畫面如下，會把你的程式碼整理並輸出成html檔案

    * buildEnvironment
        buildEnvironment Task 用於顯示項目的構建環境。它會顯示 Gradle 版本、Java 版本、操作系統、環境變量等信息。
        buildEnvironment Task 通常是構建過程的一部分，用於顯示項目的構建環境。它會在執行 build Task 或其他依賴於 buildEnvironment Task 的 Task 之前自動執行。
    * dependencies
        dependencies Task 用於顯示項目的依賴關係。它會顯示項目的依賴關係圖，包括依賴的庫、依賴的項目、依賴的配置等。
        dependencies Task 通常是構建過程的一部分，用於顯示項目的依賴關係。它會在執行 build Task 或其他依賴於 dependencies Task 的 Task 之前自動執行。
* other
    * 自訂task
        在build.gradle中加入以下程式碼
        ```groovy=
        tasks.register('fromPlugin') {
            doLast {
                println 'hello task from plugin  :D'
            }
        }
        ```
        執行gradle hello
        會發現多了一個hello的task
        執行gradle hello後會印出Hello world!
        
        常見的自訂任務有以下幾種
        
        * 執行測試單元
            ```groovy=
            task runUnitTests(type: Test) {
                testClassesDirs = sourceSets.test.output.classesDirs
                classpath = sourceSets.test.runtimeClasspath
                outputs.upToDateWhen { false }
            }
            ```
        * 壓縮生成文件
            ```groovy=
            tasks.register('createArchive', Zip) {
                from 'build/libs/'
                into 'build/archive/'
                include '*.jar'
            }
            ```
        * 執行自定義腳本
            ```groovy=
            tasks.register('runCustomScript', Exec) {
                commandLine 'sh', 'custom_script.sh'
            }
            ```
        * 清理生成文件
            ```groovy=
            tasks.register('cleanBuildDir', Delete) {
                delete 'build/'
            }
            ```

## 新建一個gradle文件，專門用來寫任務，並引入到主要gradle中
1. 新建一個你想要的文件名稱，這邊我們叫做aplugin.gradle，並寫入以下任務
2. 到你想要引入該任務文件的build.gradle檔案中寫上以下指令，
    ```groovy=
    apply from: 'aplugin.gradle'
    ```
3. 接整重整一下你intellij右側的任務欄，就會在other底下出現fromPlugin的任務，點擊執行他，就可以看到你要的結果囉
    
* 以上方法可以用來整理gradle中引入的東西，將各種任務分門別類，更好閱讀

## Authoring Tasks
* 來不及寫，參考[官方文件](https://docs.gradle.org/current/userguide/more_about_tasks.html)

## 建立gradle.properties來控管變數
1. 建立一個檔名為gradle.properties的檔案在根目錄
2. 宣告一些變數在裡面
    ``` groovy=
    gradlePropertiesProp=gradlePropertiesValue
    sysProp=shouldBeOverWrittenBySysProp
    systemProp.system=systemValue
    ```
3. 到build.gradle中取得這些資料並println
    ``` groovy=
    def gradlePropertiesProp = project.properties['gradlePropertiesProp']
    def commandLineProjectProp = project.findProperty('sysProp')
    def systemProjectProp = System.getProperty('system')

    tasks.register('helloTask') {
        doLast {
            println 'hello task doLast  :D'

            println(commandLineProjectProp)
            println(gradlePropertiesProp)
            println(systemProjectProp)
            println(System.getProperty("system"))
        }
    }
    ```   
4. 刷新一下gralde並執行這個helloTask的結果


## 宣告依賴的幾種方式
* 範例如下
    ```groovy=
    dependencies {
        // 依賴線上的依賴庫項目
        implementation group: 
          'org.springframework', name: 'spring-core', version: '4.3.5.RELEASE'
        implementation 'org.springframework:spring-core:4.3.5.RELEASE',
                'org.springframework:spring-aop:4.3.5.RELEASE'
        implementation(
            [group: 'org.springframework', name: 'spring-core', version: '4.3.5.RELEASE'],
            [group: 'org.springframework', name: 'spring-aop', version: '4.3.5.RELEASE']
        )
        testImplementation('org.hibernate:hibernate-core:5.2.12.Final') {
            transitive = true
        }
        runtimeOnly(group: 'org.hibernate', name: 'hibernate-core', version: '5.2.12.Final') {
            transitive = false
        }
        // 依賴本機上的資料
        implementation files('libs/joda-time-2.2.jar', 'libs/junit-4.12.jar')
	    implementation fileTree(dir: 'libs', include: '*.jar')
    }
    ```


## 一些基本的 gradle CMD 指令
* gradle tasks
    列出所有任務
    ```groovy=
    上午 10:22:36: Executing 'tasks'...


    > Task :tasks

    ------------------------------------------------------------
    Tasks runnable from root project 'gradle-practice'
    ------------------------------------------------------------

    Application tasks
    -----------------
    bootRun - Runs this project as a Spring Boot application.
    bootTestRun - Runs this project as a Spring Boot application using the test runtime classpath.

    Build tasks
    -----------
    assemble - Assembles the outputs of this project.
    bootBuildImage - Builds an OCI image of the application using the output of the bootJar task
    bootJar - Assembles an executable jar archive containing the main classes and their dependencies.
    build - Assembles and tests this project.
    buildDependents - Assembles and tests this project and all projects that depend on it.
    buildNeeded - Assembles and tests this project and all projects it depends on.
    classes - Assembles main classes.
    clean - Deletes the build directory.
    jar - Assembles a jar archive containing the main classes.
    resolveMainClassName - Resolves the name of the application's main class.
    resolveTestMainClassName - Resolves the name of the application's test main class.
    testClasses - Assembles test classes.

    Build Setup tasks
    -----------------
    init - Initializes a new Gradle build.
    wrapper - Generates Gradle wrapper files.

    Documentation tasks
    -------------------
    javadoc - Generates Javadoc API documentation for the main source code.

    Help tasks
    ----------
    buildEnvironment - Displays all buildscript dependencies declared in root project 'gradle-practice'.
    dependencies - Displays all dependencies declared in root project 'gradle-practice'.
    dependencyInsight - Displays the insight into a specific dependency in root project 'gradle-practice'.
    dependencyManagement - Displays the dependency management declared in root project 'gradle-practice'.
    help - Displays a help message.
    javaToolchains - Displays the detected java toolchains.
    outgoingVariants - Displays the outgoing variants of root project 'gradle-practice'.
    projects - Displays the sub-projects of root project 'gradle-practice'.
    properties - Displays the properties of root project 'gradle-practice'.
    resolvableConfigurations - Displays the configurations that can be resolved in root project 'gradle-practice'.
    tasks - Displays the tasks runnable from root project 'gradle-practice'.

    Verification tasks
    ------------------
    check - Runs all checks.
    test - Runs the test suite.

    Rules
    -----
    Pattern: clean<TaskName>: Cleans the output files of a task.
    Pattern: build<ConfigurationName>: Assembles the artifacts of a configuration.

    To see all tasks and more detail, run gradle tasks --all

    To see more detail about a task, run gradle help --task <task>

    BUILD SUCCESSFUL in 98ms
    1 actionable task: 1 executed
    上午 10:22:37: Execution finished 'tasks'.
    ```

* gradle tasks -all
    指令預設不會顯示沒有被歸類到群組的任務，假如想要查詢完成的任務清單，請在執行 tasks 指令時加上 --all 參數
    
* gradle help --task [task name]
    上面介紹的任務，如果想了解不清楚或沒介紹的任務，可以使用這個指令得知該任務的功能。
    下面是我run了 gradle help --task bootRun
    ```groovy=
    上午 10:18:58: Executing 'help --task bootRun'...


    > Task :help
    Detailed task information for bootRun

    Path
         :bootRun

    Type
         BootRun (org.springframework.boot.gradle.tasks.run.BootRun)

    Options
         --args     Command line arguments passed to the main class.

         --debug-jvm     Enable debugging for the process. The process is started suspended and listening on port 5005.

         --rerun     Causes the task to be re-run even if up-to-date.

    Description
         Runs this project as a Spring Boot application.

    Group
         application

    BUILD SUCCESSFUL in 109ms
    1 actionable task: 1 executed
    上午 10:18:59: Execution finished 'help --task bootRun'.

    ```
* Build Scan
    Gradle 官方提供了 Build Scan。Build Scan 可以在執行 Build 過程中一併掃描和紀錄所有細節，並將分析報告及運行環境等資訊傳送到 scans.gradle.com 這個服務。這是免費的線上服務，每當報告上傳上去後，就會產生一個可被分享的 Build 紀錄，其提供了更多細節資訊，解釋了其中發生了什麼以及為什麼，協助開發者更了解 Build 的細節。
    
    根據 Gradle 官方的說明，透過 Build Scan 上傳的資料只能透過當下隨機產生的連結來瀏覽，只要您沒有被隨意散佈，基本上不容易被其他人取得。而傳送到 scans.gradle.com 的分析報告假如沒有被瀏覽的話，3 個月後就會被自動刪除。不過一旦 Build Scan 報告被瀏覽過，它就會被永遠留存。當然， 您也可以在觀看之後依照意願將其刪除，仍有一定的安全性。
    
    當然，最終極的作法就是購買 Gradle Enterprise 方案囉！您可以把 Build Scan 服務架在公司內部，所有資料就只會上傳到自己的主機也只能在內網瀏覽，這樣就不會有資料隱私及外洩的疑慮了。
    1. 輸入以下指令
        ```linux
        gradle build --scan
        ```
    2. 接著他會問你接不接受他們的條款，而必須輸入yes才會繼續進行scan
    3. 幫掃描完成會提供以上圖中的網址，點擊後就可以連結到gradle為你掃描後，產生的結果報告
        


---------------------------

## 某經手的微服務、多buildgradle配置

#### level-1 project-name/build.gradle
    ```groovy=
    // 這是一個多模組專案，而這個project-name/build.gradle是最外層的build.gradle
    // 這邊引入的 plugins 會被所有子模組繼承
    // apply false 代表該 plugin 不會被當前模組使用，而是被子模組繼承
    plugins {
        id 'org.springframework.boot' version '3.0.3' apply false
        id 'io.spring.dependency-management' version '1.1.0' apply false
        id 'io.freefair.lombok' version "6.5.0.2" apply false
        id 'com.google.cloud.tools.jib' version '3.3.1' apply false
    }

    // allprojects 代表所有子模組都會繼承這個配置
    // apply plugin 代表引入的 plugin 會被所有子模組繼承
    allprojects{
        apply plugin: 'java'
        apply plugin: 'application'
        apply plugin: 'org.springframework.boot'
        apply plugin: 'io.spring.dependency-management'
        apply plugin: 'io.freefair.lombok'

        group 'com.systex.cso-e-commerce-platform'
        version '1.0-SNAPSHOT'

        // mavenCentral() 代表引入 maven 中央倉庫
        // maven {} 代表引入指定的 maven 倉庫
        // mavenLocal() 代表引入 maven 本地倉庫，即 ~/.m2/repository(不過照理說不應該引入本地倉庫，除非你有特殊需求而撰寫了一個自己的 maven 倉庫，或客戶端沒有網路連線或不允許連線到 maven 中央倉庫)
        repositories {
            mavenCentral()
            maven {
                url "https://jaspersoft.jfrog.io/jaspersoft/jaspersoft-repo"
            }
            mavenLocal()
        }

        javadoc.options.encoding = 'UTF-8'
        compileJava.options.encoding = 'UTF-8'
        sourceCompatibility = '17'
    }

    // dependencyManagement 代表所有子模組都會繼承這個配置
    dependencyManagement {
        dependencies {
            dependency 'org.flywaydb:flyway-core:9.16.1'
            dependency 'org.flywaydb:flyway-sqlserver:9.16.1'
        }
    }
    ```
#### level-2 project-name/shared-kernel/common/build.gradle
    ```groovy=
    // 這是一個共用的模組，而這個project-name/shared-kernel/common/build.gradle是common模組的build.gradle
    // 這邊引入的東西，是要給自己及其他模組共同使用的
    dependencies {
        // implementation project 代表引入其他模組
        // :shared-kernel 這裡的名稱是由模組的目錄結構決定的，即 estate-management-system/shared-kernel
        implementation project(':shared-kernel:dddcore')

        implementation 'org.springframework.boot:spring-boot-starter-web'
        implementation 'org.springframework.boot:spring-boot-starter-security'
        implementation 'org.springframework.kafka:spring-kafka'
        implementation 'org.springdoc:springdoc-openapi-starter-webmvc-ui:2.0.3'
        implementation 'io.jsonwebtoken:jjwt-api:0.11.2'
        implementation 'io.jsonwebtoken:jjwt-impl:0.11.2'
        implementation 'io.jsonwebtoken:jjwt-jackson:0.11.2'
        implementation('net.sf.jasperreports:jasperreports:6.20.0') {
            exclude group: 'com.lowagie', module: 'itext'
        }
        implementation 'com.itextpdf:itextpdf:5.5.13'
        implementation 'net.sf.jasperreports:jasperreports-fonts:6.20.0'
        implementation 'net.sf.jasperreports:jasperreports-functions:6.20.0'
        implementation 'org.projectlombok:lombok:1.18.26'


        compileOnly 'org.springframework.boot:spring-boot-starter-data-jpa'
        compileOnly 'org.flywaydb:flyway-core'

        testImplementation 'org.junit.jupiter:junit-jupiter-api:5.8.1'
        testRuntimeOnly 'org.junit.jupiter:junit-jupiter-engine:5.8.1'
        testImplementation 'com.h2database:h2:1.4.200'

    }
    ```

#### level-2 project-name/shared-kernel/dddcore/build.gradle
    ```groovy=
    // 這是一個共用的模組，而這個project-name/shared-kernel/dddcore/build.gradle是ddcore模組的build.gradle
    // 這邊引入的東西，是要給自己及其他模組共同使用的
    dependencies {
        implementation 'org.springframework.boot:spring-boot-starter-validation'
        implementation 'org.springframework.boot:spring-boot-starter-web'
        implementation 'org.modelmapper:modelmapper:2.3.0'
        implementation 'org.eclipse.persistence:javax.persistence:2.2.1'
        implementation 'org.springdoc:springdoc-openapi-starter-webmvc-ui:2.0.3'
    }
    ```

#### level-3 project-name/common-domain/build.gradle
    ```groovy=
    // 這是一個給 project-name/common-domain 底下的所有模組繼承的 build.gradle
    allprojects {
        // com.google.cloud.tools.jib 是一個專門用來打包 docker image 的 plugin
        apply plugin: 'com.google.cloud.tools.jib'
        dependencies {
            implementation project(':shared-kernel:dddcore')
            implementation project(':shared-kernel:common')

            testImplementation 'org.junit.jupiter:junit-jupiter-api:5.8.1'
            testRuntimeOnly 'org.junit.jupiter:junit-jupiter-engine:5.8.1'
            implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
        }

        test {
            useJUnitPlatform()
        }

        // 這邊是用來打包 docker image 的設定，給gitlab-ci.yml使用，變數的部分是從gitlab的CI/CD設定中設定的
        jib {
            from {
                // eclipse-temurin:17.0.6_10-jre 是一個 docker image，代表java 17的環境
                image 'eclipse-temurin:17.0.6_10-jre'
            }
            to {
                image "${System.env.IMAGE_REGISTRY}/ems-${project.name}-api:${System.env.IMAGE_TAG}"
                auth {
                    username "${System.env.ACR_USER}"
                    password "${System.env.ACR_PASSWORD}"
                }
            }
        }
    }
    ```
#### level-4 project-name/common-domain/authentication/build.gradle
    ```groovy=
    // 這個build.gradle是給自己使用的最小單位，理論上來說，只引入自己會用到的東西
    dependencies {
        testImplementation 'org.springframework.boot:spring-boot-starter-test:2.7.0'
        implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
        implementation 'org.springframework.boot:spring-boot-starter-web'
        implementation 'org.springframework.boot:spring-boot-starter-security'
        implementation 'com.microsoft.sqlserver:mssql-jdbc:9.4.1.jre8'
        implementation 'org.springdoc:springdoc-openapi-starter-webmvc-ui:2.0.3'
        implementation 'org.flywaydb:flyway-core'
        implementation 'org.flywaydb:flyway-sqlserver'
        implementation 'org.springframework.kafka:spring-kafka'
    }

    // jib是一個專門用來打包 docker image 的 plugin
    // container ports 是用來設定 docker image 要開啟的 port 
    jib {
        container {
            ports = ['8000']
        }
    }
    ```
    
    
-------
### 參考資料
* [https://docs.gradle.org/current/userguide/userguide.html](https://docs.gradle.org/current/userguide/userguide.html)
* [https://www.baeldung.com/gradle](https://www.baeldung.com/gradle)
* [https://scans.gradle.com/](https://scans.gradle.com/)
* [https://ithelp.ithome.com.tw/users/20107229/ironman/4303](https://ithelp.ithome.com.tw/users/20107229/ironman/4303)
