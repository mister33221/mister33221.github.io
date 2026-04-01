---
title: "Redis with Lua script (Spring boot)"
date: "2026-03-24"
category: "Tool"
tags: ["Git"]
summary: "- After Redis 2.6, Redis has provided a new feature that let us use Lua script to do some operations"
published: true
---


## Redis with Lua script (Spring boot)

- After Redis 2.6, Redis has provided a new feature that let us use Lua script to do some operations. 
- Lua is a lightweight, high-level, multi-paradigm programming language designed primarily for embedded use in applications.
- If you had played with World of Warcraft, you may know lua script is used a lot in the game.
- Lua's features
  - lightweight
  - multi-paradigm
  - atomic: If redis is running a lua script, it will not run another lua script at the same time. So please make sure you use the script carefully.
- Find the practice project [here](https://github.com/mister33221/sprng-boot-spring--data-redis-lua-script-practice.git)

### Types of lua script

- nil: It means null.
- boolean: True or false.
- number
- string
- table: It is a key-value data structure.

### Declare a variable

- There are two ways to declare a variable in lua script.
  - local: It means the variable is only available in the current scope.
  - global: It means the variable is available in the whole script.
- In a script for redis, try not to use global variable. Because local variable is more efficient than global variable.

### Type - table

- Table is a key-value data structure.
- It can store any type of data even like below.
  - table = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
  - table = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, "hello", true, nil}
- Example
```lua
-- 創建一個 table
local t = {}

-- 給 table 添加元素
t["key"] = "value"
t[1] = "one"
t[2] = "two"

-- 讀取 table 中的元素
print(t["key"])  -- 輸出 "value"
print(t[1])  -- 輸出 "one"
print(t[2])  -- 輸出 "two"
```

### If statement

- Example
```lua
if condition then
  -- do something
elseif condition then
    -- do something
    else
    -- do something
    end
```
- Eample with redis
```lua
if redis.call("EXISTS", KEYS[1]) == 1 then
    return redis.call("GET", KEYS[1])
else
    return redis.call("SET", KEYS[1], ARGV[1])
end
```

### For loop

- In lua script, there are two ways to use for loop.
  - numeric for loop
  - generic for loop
#### Numeric for loop

- Example
```lua
for i = 1, 10 do
    print(i)
end
```

#### Generic for loop

- Example
```lua
local t = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
for k, v in pairs(t) do
    print(k, v)
end
```
- Example with redis
```lua
local t = redis.call("KEYS", "*")
for k, v in pairs(t) do
    redis.call("DEL", v)
end
```

### Return value

- In lua, it can return multiple values. but in redis, don't suggest to return multiple values. Because it will make the script more complex.
