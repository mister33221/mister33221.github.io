---
title: "[Java] 列舉 Enum"
date: "2026-03-24"
category: "Tool"
tags: ["Git"]
summary: "- [Enum 的定義](#Enum-的定義)"
published: true
---



# [Java] 列舉 Enum

## 目錄

- [Enum 的定義](#Enum-的定義)
- [Enum 的特性](#Enum-的特性)
- [來建立一個 Enum 吧](#來建立一個-Enum-吧)
- [常見的 Enum 使用情境](#常見的-Enum-使用情境)
- [結論](#結論)
- [Reference](#Reference)

## Enum 的定義

```java
public abstract class Enum<E extends Enum<E>>
    implements Comparable<E>, Serializable {
    private final String name;
    private final int ordinal;
    protected Enum(String name, int ordinal) {
        this.name = name;
        this.ordinal = ordinal;
    }
    public String name() {
        return name;
    }
    public int ordinal() {
        return ordinal;
    }
    public String toString() {
        return name;
    }
    public final boolean equals(Object other) {
        return this==other;
    }
    public final int hashCode() {
        return super.hashCode();
    }
    protected final Object clone() throws CloneNotSupportedException {
        throw new CloneNotSupportedException();
    }
    public final int compareTo(E o) {
        Enum other = (Enum)o;
        Enum self = this;
        if (self.getClass() != other.getClass() && // optimization
            self.getDeclaringClass() != other.getDeclaringClass())
            throw new ClassCastException();
        return self.ordinal - other.ordinal;
    }
    public final Class<E> getDeclaringClass() {
        Class clazz = getClass();
        Class zuper = clazz.getSuperclass();
        return (zuper == Enum.class) ? clazz : zuper;
    }
    public static <T extends Enum<T>> T valueOf(Class<T> enumType,
                                                String name) {
        T result = enumType.enumConstantDirectory().get(name);
        if (result != null)
            return result;
        if (name == null)
            throw new NullPointerException("Name is null");
        throw new IllegalArgumentException(
            "No enum constant " + enumType.getCanonicalName() + "." + name);
    }
    protected final void finalize() { }
}
```
這也太落落長了吧，我們稍微聊解一些重要的部分。

## Enum 的特性

1. `Enum` 類別是抽象類別，所以無法直接實例化。
2. `Enum` 類別繼承了 `Comparable` 介面，所以 Enum 類別可以進行比較。主要是針對 `Enum` 類別的 `ordinal` 進行比較。
    列舉在宣告時，會給予每個成員一個 `name` 和 `ordinal`，`name` 是成員的名稱，`ordinal` 是成員的編號，從 0 開始。
    可以透過 `name()` 取得成員的名稱，
    透過 `ordinal()` 取得成員的編號。
3. `Enum` 類別實作了 `Serializable` 介面，所以 Enum 類別可以進行序列化。
    為什麼我們要序列化 Enum 類別呢？因為我們會希望 `Enum` 類別可以透過序列化來使 `Enum` 包持單例，讓每個枚舉都只有一個實例。
    通常我們會把 `Enum` 用來定義常數，這樣就可以確保程式中的常數都是唯一的。
4. `Enum` 類別的建構子是 `protected`，所以無法直接建立 `Enum` 類別的實例。
5. `Enum` 類別有一個 `valueOf` 方法，可以透過 `name` 取得 `Enum` 的實例。
6. `Enum` 類別的 `equals` 方法被覆寫，且為 `final`，實作邏輯與 `Object` 類別的 `equals` 方法相同，都是比較記憶體位置。
7. `Enum` 類別的 `hashCode` 方法被覆寫，且為 `final`，實作邏輯與 `Object` 類別的 `hashCode` 方法相同，都是回傳記憶體位置的 hash code。
8. 定義 `Enum` 時，可以自定義 `constructor`，但是有個條件是不得為 `public`，且也不可於 `constructor` 中呼叫 `super()`。 

> `Comparable` 來[這裡TODO](我還沒寫)看看。     
> `Serializable` 來[這裡TODO](我還沒寫)看看。

## 來建立一些 Enum 範例吧

- `Priority1`
    - `Priority1` 是一個 Enum，裡面有五個成員，分別是 `MAX`、`HIGH`、`MEDIUM`、`LOW`、`MIN`，每個成員都有一個 `value`，代表優先權值。
    - `Priority1` 有一個 `constructor`，傳入一個 `int` 型態的參數，用來設定優先權值。
    - `Priority1` 有一個 `getValue` 方法，用來取得優先權值。
    - `Priority1` 有一個 `main` 方法，用來列印出每個成員的名稱和優先權值。
```java
public enum Priority1 {
    MAX(10), HIGH(8), MEDIUM(5), LOW(3), MIN(1);  // 呼叫建構子

    private final int value; // 儲存優先權值

    Priority1(int value) {  // 不為 public 的建構子
        this.value = value;
    }

    public int getValue() { // 自定義方法
        return value;
    }

    public static void main(String[] args) {
        for (Priority1 priority : Priority1.values()) {
            System.out.println(priority + " : " + priority.getValue());
        }
    }
}
```

- `Priority2`
    - `Priority2` 是一個 Enum，裡面有五個成員，分別是 `MAX`、`HIGH`、`MEDIUM`、`LOW`、`MIN`，每個成員都有一個 `value`，代表優先權值。
    - `Priority2` 有一個 `constructor`，傳入一個 `int` 型態的參數，用來設定優先權值。
    - `Priority2` 有一個 `getValue` 方法，用來取得優先權值。
    - `Priority2` 有一個 `main` 方法，用來列印出每個成員的名稱和優先權值，並且覆寫 `toString` 方法，讓 `toString` 方法可以印出成員的名稱和優先權值。
```java
public enum Priority2 {
    MAX(10) {
        public String toString() {
            return format("最高(%2d)", value);
        }
    },
    HIGH(8) {
        public String toString() {
            return format("高(%2d)", value);
        }
    },
    MEDIUM(5) {
        public String toString() {
            return format("中(%2d)", value);
        }
    },
    LOW(3) {
        public String toString() {
            return format("低(%2d)", value);
        }
    },
    MIN(1) {
        public String toString() {
            return format("最低(%2d)", value);
        }
    };

    protected int value; // 儲存優先權值

    Priority2(int value) {  // 不為 public 的建構子
        this.value = value;
    }

    public int getValue() { // 自定義方法
        return value;
    }

    public static void main(String[] args) {
        for (Priority2 priority : Priority2.values()) {
            System.out.println(priority);
        }
    }
}
```

- `Action1`
    - 在這個範例中，我們 implement 了 `Command` 介面，並且在 `Action1` 中實作了 `Command` 介面的 `execute` 方法。再搭配 `switch` 來實作不同的行為。
    - `Action1` 是一個 Enum，裡面有十個成員，分別是 `START`、`STOP`、`JUMP`、`SIT`、`RUN`、`WALK`、`SLEEP`、`EAT`、`DRINK`、`THINK`。
```java
public enum Action1 implements Command{
    START, STOP, JUMP, SIT, RUN, WALK, SLEEP, EAT, DRINK, THINK;


    @Override
    public void execute() {
        switch (this) {
            case START -> System.out.println("開始");
            case STOP -> System.out.println("停止");
            case JUMP -> System.out.println("跳躍");
            case SIT -> System.out.println("坐下");
            case RUN -> System.out.println("跑步");
            case WALK -> System.out.println("走路");
            case SLEEP -> System.out.println("睡覺");
            case EAT -> System.out.println("吃飯");
            case DRINK -> System.out.println("喝水");
            case THINK -> System.out.println("思考");
            default -> System.out.println("無法辨識");
        }
    }

    public static void main(String[] args) {
        for (Action1 action : Action1.values()) {
            action.execute();
        }
    }
}
```

- `Action2`
    - 在這個範例中，我們使用了特別值類別本體(Value-specific class body)語法，這個語法讓我們把每個枚舉都定義成一個特別的類別本體，方便我們在每個枚舉中定義不同的行為。
    - 在 `Action1` 中，我們使用 `switch` 來實作不同的行為，好處是程式碼簡潔易懂，但如果我們需要添加或修改行為時，就需要修改 `Action1` 這個類別，這樣就違反了開放封閉原則(SOLID中的O-Open/Closed Principle)。
    - 而在 `Action2` 中。我們使用了特別值類別本體(Value-specific class body)語法，這個語法讓我們可以在每個枚舉中定義不同的行為，如果我們需要添加或修改行為時，只需要在枚舉中定義新的類別本體即可，這樣就符合了開放封閉原則(SOLID中的O-Open/Closed Principle)。

```java
public enum Action2 implements Command{
//    特別值類別本體(Value-specific class body)語法
    START {
        public void execute() {
            System.out.println("開始");
        }
    },
    STOP {
        public void execute() {
            System.out.println("停止");
        }
    },
    JUMP {
        public void execute() {
            System.out.println("跳躍");
        }
    },
    SIT {
        public void execute() {
            System.out.println("坐下");
        }
    },
    RUN {
        public void execute() {
            System.out.println("跑步");
        }
    },
    WALK {
        public void execute() {
            System.out.println("走路");
        }
    },
    SLEEP {
        public void execute() {
            System.out.println("睡覺");
        }
    },
    EAT {
        public void execute() {
            System.out.println("吃飯");
        }
    },
    DRINK {
        public void execute() {
            System.out.println("喝水");
        }
    },
    THINK {
        public void execute() {
            System.out.println("思考");
        }
    },
    UNKNOWN {
        public void execute() {
            System.out.println("無法辨識");
        }
    };

    public static void main(String[] args) {
        for (Action2 action : Action2.values()) {
            action.execute();
        }
    }
}
```

## 常見的 Enum 使用情境

- 表示一組固定的選項：例如，一個應用程式可能有多種狀態，你可以使用枚舉來表示這些狀態
```java
public enum AppState {
    STARTING,
    RUNNING,
    SHUTTING_DOWN,
    STOPPED
}
```
- 作為switch語句的參數：枚舉常數可以作為switch語句的參數，這樣可以確保只有有效的值可以被傳遞給switch語句。
```java
// 如前述範例 Action1
```
- 實現策略模式：每個枚舉常數都可以有自己的行為，這使得枚舉可以用來實現策略模式。
```java
// 如前述範例 Action2，以下另外提供一個範例
public enum MathOperation {
    ADD {
        public int execute(int a, int b) { return a + b; }
    },
    SUBTRACT {
        public int execute(int a, int b) { return a - b; }
    },
    MULTIPLY {
        public int execute(int a, int b) { return a * b; }
    },
    DIVIDE {
        public int execute(int a, int b) { return a / b; }
    };

    public abstract int execute(int a, int b);
}
```
- 作為單例模式的實現方式：由於枚舉實例的創建和初始化都是由JVM保證的，因此，枚舉也可以用來實現單例模式。
> 另外，枚舉類型的實例是唯一的，所以它們是線程安全的。      
> 如果你是使用類別搭配 `@Scope("singleton")` 來實現單例模式，那麼你還是需要自己處理多執行緒的問題。但是如果你使用枚舉來實現單例模式，那麼你就不需要擔心多執行緒的問題了。
```java
public enum Singleton {
    INSTANCE;

    public void doSomething() {
        // do something
    }
}
```

## 結論

- 總之，枚舉是一種特殊的類型，它可以用來表示一組固定的常數。枚舉在Java中是一個非常有用的功能，常常在各種情況下扮演輔助的腳色。
- 我把 code 就放在[這裡](https://github.com/mister33221/enum-practice.git)囉!


## Reference

- [https://docs.oracle.com/javase%2F8%2Fdocs%2Fapi%2F%2F/java/lang/Enum.html](https://docs.oracle.com/javase%2F8%2Fdocs%2Fapi%2F%2Fjava/lang/Enum.html)
- Java SE 14 技術手冊 - 林信良 良葛格QQ
