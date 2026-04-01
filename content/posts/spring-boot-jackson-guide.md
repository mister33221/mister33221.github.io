---
title: "Spring Boot Jackson 常用功能與使用方法"
date: "2026-03-24"
category: "Java"
tags: ["Java"]
summary: "在 Spring Boot 中，**Jackson** 是最常用的 JSON 解析與序列化/反序列化工具，Sprin"
published: true
---

# Spring Boot Jackson 常用功能與使用方法

在 Spring Boot 中，**Jackson** 是最常用的 JSON 解析與序列化/反序列化工具，Spring Boot 內建支援 Jackson，並透過 `spring-boot-starter-json` 依賴自動配置。

本文將介紹一些 **常用、重要** 的 Jackson 功能，包含使用情境與範例。

---

## 1. 控制 JSON 字段
**情境**： 只想讓某些字段被序列化/反序列化，例如隱藏密碼。  
**解法**： 使用 `@JsonIgnore` 或 `@JsonProperty`

### 範例
```java
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

public class User {
    private String username;

    @JsonIgnore  // 這個字段不會被序列化到 JSON
    private String password;

    @JsonProperty("full_name") // 變更 JSON 字段名稱
    private String fullName;

    // Getter / Setter
}
```

### 輸出 JSON
```json
{
    "full_name": "John Doe",
    "username": "johndoe"
}
```
(不會輸出 password 欄位)

---

## 2. 日期格式化
**情境**： Java 內的 LocalDateTime 無法直接被 JSON 處理，想要格式化日期。  
**解法**： 使用 `@JsonFormat`

### 範例
```java
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

public class Event {
    private String name;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime eventDate;

    // Constructor, Getter / Setter
}
```

### 輸出 JSON
```json
{
    "name": "Spring Boot Workshop",
    "eventDate": "2025-03-17 10:30:00"
}
```

---

## 3. 忽略 NULL 值
**情境**： JSON 回應時不想顯示 null 值，讓 JSON 更乾淨。  
**解法**： `@JsonInclude(JsonInclude.Include.NON_NULL)`

### 範例
```java
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class Product {
    private String name;
    private Double price; // 如果 price 為 null，則不會輸出 JSON

    // Constructor, Getter / Setter
}
```

### 輸出 JSON
```json
{
    "name": "Laptop"
}
```
(當 price = null 時，price 欄位不會出現在 JSON 中)

---

## 4. 自訂 JSON 序列化與反序列化
**情境**： 需要客製化物件的轉換邏輯，例如 Boolean 轉換為 Yes/No。  
**解法**： 自訂 `JsonSerializer` 和 `JsonDeserializer`

### 自訂 Boolean 序列化
```java
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import java.io.IOException;

public class BooleanToYesNoSerializer extends JsonSerializer<Boolean> {
    @Override
    public void serialize(Boolean value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
        gen.writeString(value ? "Yes" : "No");
    }
}
```

### 應用在 Model
```java
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

public class UserPreference {
    private String username;

    @JsonSerialize(using = BooleanToYesNoSerializer.class)
    private Boolean notificationsEnabled;

    // Constructor, Getter / Setter
}
```

### 輸出 JSON
```json
{
    "username": "johndoe",
    "notificationsEnabled": "Yes"
}
```

---

## 5. 全域日期格式設定
**情境**： 想要讓整個應用程式的日期格式統一，不用每個類別都加 `@JsonFormat`。  
**解法**： 自訂 `ObjectMapper`

### 設定
```java
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.text.SimpleDateFormat;

@Configuration
public class JacksonConfig {
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule()); // 支援 Java 8 日期時間
        objectMapper.setDateFormat(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"));
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return objectMapper;
    }
}
```
這樣所有 `Date` 或 `LocalDateTime` 物件都會輸出成 "yyyy-MM-dd HH:mm:ss" 格式。

---

## 6. 全域忽略未知字段
**情境**： 當 JSON 傳入額外字段時，不想讓 `ObjectMapper` 解析時拋出錯誤。  
**解法**： `@JsonIgnoreProperties(ignoreUnknown = true)`

### 範例
```java
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Person {
    private String name;
    private int age;

    // Constructor, Getter / Setter
}
```

### JSON 輸入
```json
{
    "name": "Alice",
    "age": 25,
    "extraField": "Should be ignored"
}
```
即使 `extraField` 在 `Person` 類別內沒有定義，仍可正常解析，不會拋出 `UnrecognizedPropertyException`。

---

## 7. 啟用 JSON Pretty Print
**情境**： 想讓 JSON 變得更好閱讀（美化格式）。  
**解法**： 使用 `SerializationFeature.INDENT_OUTPUT`

### 範例
```java
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

public class JsonPrettyPrintExample {
    public static void main(String[] args) throws Exception {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.enable(SerializationFeature.INDENT_OUTPUT);

        User user = new User("johndoe", "John Doe");
        String json = objectMapper.writeValueAsString(user);
        System.out.println(json);
    }
}
```

### 輸出 JSON
```json
{
    "username": "johndoe",
    "full_name": "John Doe"
}
```
(格式化 JSON 輸出，方便閱讀)

---

## 8. 使用 `ObjectMapper` 進行類別轉換
**情境**： 在不同的類別之間進行轉換，例如從 `Entity` 轉換為 `DTO`。

### **1. 類別轉換**
```java
import com.fasterxml.jackson.databind.ObjectMapper;

public class JacksonMapperExample {
    public static void main(String[] args) {
        ObjectMapper objectMapper = new ObjectMapper();

        UserEntity entity = new UserEntity(1L, "johndoe", "John Doe", "password123");
        UserDTO dto = objectMapper.convertValue(entity, UserDTO.class);
        System.out.println(dto);
    }
}
```

### **9. List 轉換**
```java
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Arrays;
import java.util.List;

public class JacksonListMapperExample {
    public static void main(String[] args) {
        ObjectMapper objectMapper = new ObjectMapper();
        List<UserEntity> entityList = Arrays.asList(
            new UserEntity(1L, "johndoe", "John Doe", "password123"),
            new UserEntity(2L, "janedoe", "Jane Doe", "password456")
        );
        List<UserDTO> dtoList = objectMapper.convertValue(entityList, new TypeReference<List<UserDTO>>() {});
        dtoList.forEach(System.out::println);
    }
}
```

### **10. JSON 轉換為 Class**
```java
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;

public class JsonToClassExample {
    public static void main(String[] args) throws Exception {
        ObjectMapper objectMapper = new ObjectMapper();

        // JSON 字串
        String json = "{\"id\":3, \"username\":\"alice\", \"fullName\":\"Alice Wonderland\"}";

        // 先轉換為 Map
        Map<String, Object> map = objectMapper.readValue(json, Map.class);

        // 再轉換為 UserDTO
        UserDTO dto = objectMapper.convertValue(map, UserDTO.class);

        System.out.println(dto);
    }
}
```

### **輸出結果**
```json
{
    "id": 3,
    "username": "alice",
    "fullName": "Alice Wonderland"
}
```

---

## 結論
Spring Boot 內建 Jackson 並提供許多強大的功能，讓我們可以輕鬆地：  
✅ 控制 JSON 字段（@JsonIgnore, @JsonProperty）  
✅ 格式化日期（@JsonFormat）  
✅ 忽略 null 值（@JsonInclude）  
✅ 自訂序列化/反序列化  
✅ 全域日期設定（ObjectMapper）  
✅ 忽略未知字段（@JsonIgnoreProperties）  
✅ 啟用 JSON 美化輸出  
✅ 使用 ObjectMapper 進行類別轉換

這些技巧在開發 API 時都很實用，可以根據不同需求選擇適合的方式！ 🚀
