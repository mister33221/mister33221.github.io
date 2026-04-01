---
title: "Spring Boot Logback 常用功能與設定"
date: "2026-03-24"
category: "Java"
tags: ["Java", "Concurrency"]
summary: "- `TRACE`：最詳細的日誌，幾乎所有調試訊息都會顯示。"
published: true
---

# Spring Boot Logback 常用功能與設定

## 1. 日誌分級（Logging Levels）
- `TRACE`：最詳細的日誌，幾乎所有調試訊息都會顯示。
- `DEBUG`：一般開發與測試階段常用的等級，記錄系統的細節訊息。
- `INFO`：用於記錄關鍵業務流程或系統狀態變化，適合正式環境。
- `WARN`：當出現潛在問題時，例如記憶體用量接近上限、磁碟空間不足。
- `ERROR`：系統錯誤或異常，會影響功能但不一定導致崩潰。
- `OFF`：完全關閉日誌。

---

## 2. 控制台與檔案輸出
- **ConsoleAppender**（輸出到控制台）
- **FileAppender**（輸出到檔案）
- **RollingFileAppender**（分批輸出，避免檔案過大）

---

## 3. 日誌輪轉（Log Rotation）
- 使用 `RollingFileAppender`，設定檔案大小與保存數量，避免單一日誌檔案過大。

---

## 4. JSON 格式化輸出
- 使用 `logstash-logback-encoder` 來支援 JSON 格式日誌，適合與 ELK（Elasticsearch + Logstash + Kibana）整合。

---

## 5. 不同環境的日誌設定
- 使用 `spring.profiles.active` 來切換不同環境的 `logback-spring.xml` 配置，例如 `dev` 和 `prod`。

---

## 6. 記錄特定 package 的日誌
- 針對特定的 package 或 class 設定不同的日誌等級。

---

## Logback XML 配置範例
這是一個常見的 `logback-spring.xml` 設定檔。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>

    <!-- 設定 Spring Profile -->
    <springProperty name="LOG_LEVEL" source="logging.level.root" defaultValue="INFO"/>

    <!-- 設定 Console 輸出 -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- 設定檔案輸出 -->
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>logs/app.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
            <!-- 按日期輪轉日誌，目前這樣設定，log檔的名稱會是 app-2021-01-01.0.log -->
            <fileNamePattern>logs/app-%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <maxFileSize>10MB</maxFileSize>  <!-- 單個日誌檔案的最大大小 -->
            <maxHistory>30</maxHistory>  <!-- 最多保留 30 天的日誌 -->
            <totalSizeCap>1GB</totalSizeCap>  <!-- 總共最多保留 1GB 日誌，超過則刪除最舊的 -->
        </rollingPolicy>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n</pattern> 
        </encoder>
    </appender>

    <!-- 設定不同 package 的日誌級別 -->
    <logger name="com.example.service" level="DEBUG"/>
    <logger name="org.springframework" level="WARN"/>

    <!-- 根日誌設定 -->
    <root level="${LOG_LEVEL}">
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="FILE"/>
    </root>

</configuration>
```

---

## 進階設定

### 1. JSON 格式輸出（適用於 ELK）

#### **步驟 1：引入 Logstash 依賴**
在 `pom.xml` 中加入：

```xml
<dependency>
    <groupId>net.logstash.logback</groupId>
    <artifactId>logstash-logback-encoder</artifactId>
    <version>7.3</version>
</dependency>
```

#### **步驟 2：修改 `logback-spring.xml`**

```xml
<appender name="JSON_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <file>logs/json-app.log</file>
    <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
        <fileNamePattern>logs/json-app-%d{yyyy-MM-dd}.log</fileNamePattern>
        <maxHistory>30</maxHistory>
    </rollingPolicy>
    <encoder class="net.logstash.logback.encoder.LogstashEncoder"/>
</appender>

<root level="INFO">
    <appender-ref ref="JSON_FILE"/>
</root>
```

---

### 2. 不同環境的日誌設定

#### **方式 1：透過 `logback-spring.xml` 自動載入**
```xml
<springProfile name="dev">
    <logger name="com.example" level="DEBUG"/>
</springProfile>

<springProfile name="prod">
    <logger name="com.example" level="WARN"/>
</springProfile>
```
在 `application.properties` 設定：
```properties
spring.profiles.active=dev
```

#### **方式 2：使用不同的 logback 配置檔**
1. `logback-dev.xml`
2. `logback-prod.xml`
3. `logback-test.xml`

Spring Boot 會根據 `spring.profiles.active` 自動載入對應的日誌設定。

#### **方式 3：設定異步日誌**
- 如果怕寫日誌會影響效能，可以使用 `AsyncAppender` 來實現異步日誌輸出。
- 讓日誌先進入一個佇列 (queueSize=500)，然後由背景執行緒寫入檔案。
```xml
<appender name="ASYNC_FILE" class="ch.qos.logback.classic.AsyncAppender">
    <queueSize>500</queueSize>  <!-- 設定緩衝區大小 -->
    <discardingThreshold>0</discardingThreshold>  <!-- 避免丟失訊息 -->
    <appender-ref ref="FILE"/>
</appender>

<root level="INFO">
    <appender-ref ref="ASYNC_FILE"/>
</root>
```

---

## 總結
1. **日誌級別**（TRACE, DEBUG, INFO, WARN, ERROR）
2. **控制台與檔案輸出**
3. **日誌輪轉**（避免日誌過大）
4. **JSON 格式輸出**（適合 ELK 整合）
5. **不同環境的日誌設定**（透過 Spring Profiles）
6. **記錄特定 package 的日誌**
7. **異步日誌輸出**（避免影響效能）

這些功能能幫助你的 Spring Boot 應用程式更好地管理與分析日誌！
