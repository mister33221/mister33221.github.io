---
title: "UUID, GUID, ULID 是甚麼?"
date: "2026-03-24"
category: "Backend"
tags: ["Java", "Spring Boot"]
summary: "UUID 是一個 128 位元的唯一識別碼，用來唯一標識某一個物件或實體。它由國"
published: true
---

# UUID, GUID, ULID 是甚麼?

## UUID（Universally Unique Identifier）

UUID 是一個 128 位元的唯一識別碼，用來唯一標識某一個物件或實體。它由國際標準化組織（ISO）和 IETF 定義，標準編號是 RFC 4122。

### UUID 的結構與格式

- UUID 是一個 128 位元的數字，通常以 16 進位表示，長度為 32 個字元。
- 最基礎的 UUID 由五個部分組成，以連字號 `-` 分隔，例如 `550e8400-e29b-41d4-a716-446655440000`。
    - 前 8 位：時間戳的一部份
    - 中 4 位：時間戳的另一部份
    - M 位：版本號，用來表明 UUID 的版本與生成方式
    - N 位：變體號，用來標識 UUID 標準的實現
    - 後 12 位：可能包含時間戳、MAC 地址、隨機數等
- 但是，UUID 有多種版本，不同版本的 UUID 有不同的結構和生成方式，前一點是指 UUIDv1。

#### UUIDv1

- 基於時間戳和 MAC 地址
- MAC 地址的暴露可能導致隱私泄露

#### UUIDv2

- 是基於 v1 的 UUID，但是將時間戳的一部分替換為 POSIX 的 UID 或 GID
- 不常用

#### UUIDv3

- 基於名稱和名稱空間（namespace）的 MD5 雜湊值

#### UUIDv4

- 大部分都是基於隨機數生成的
- 這是最常使用的 UUID 版本
- 碰撞率極低，約為 1/2^122

#### UUIDv5

- 與 v3 類似，但是使用 SHA-1 雜湊值

## GUID（Globally Unique Identifier）

GUID 是微軟實現的 UUID，二者在結構和使用上幾乎相同，可以視為 UUID 的一個實作版本。

## ULID（Universally Unique Lexicographically Sortable Identifier）

ULID 是一種新型的唯一識別碼，由 Crockford 提出，它結合了 UUID 和時間戳，具有以下特點：

- 128 位元，比 UUID 短
- 與 UUID 一樣具有唯一性
- 採用字典序，方便字母數字排序（Lexicographically Sortable）
- 可讀性高，比 UUID 更易於使用和分享。
- 可以用於分散式系統中，避免 ID 的碰撞
- 可以用於 URL，不需要編碼
- ULID 是為了解決 UUID 在排序和易讀性上的缺點而設計的，特別適用於需要排序的分散式系統和高並發場景。

### ULID 的結構與格式

- ULID 是 128 位元的數字，通常以 16 進位表示，長度為 26 個字元。
- ULID 由兩部分組成，，形如 `01H9WJZ4RT6P7V0D8QFZ2MNXCJ`。
    - 前 10 個字元：48 位元數的時間戳，是基於 Unix 時間戳
    - 後 16 個字元：80 位元的隨機數

## UUID 與 ULID 的比較

特性	UUID v4	ULID
長度	36 字元（含連字符）	26 字元
排序性	不支持	支援基於時間排序
唯一性	極低碰撞概率	極低碰撞概率
可讀性	較差（含隨機字元和連字符）	更簡潔，適合人類閱讀
時間信息	不包含	包含時間戳

| 特性 | UUID v4 | ULID |
| --- | --- | --- |
| 長度 | 36 字元（含連字符） | 26 字元 |
| 排序性 | 不支持 | 支援基於時間排序 |
| 唯一性 | 極低碰撞概率 | 極低碰撞概率 |
| 可讀性 | 較差（含隨機字元和連字符） | 更簡潔，適合人類閱讀 |
| 時間信息 | 不包含 | 包含時間戳 |

> UUIDv1 和 UUIDv2 包含時間戳，但 UUIDv3、UUIDv4 和 UUIDv5 不包含時間戳。
