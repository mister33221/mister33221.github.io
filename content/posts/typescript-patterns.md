---
title: "TypeScript 進階型別技巧：我最常用的幾個 Pattern"
date: "2024-02-08"
category: "Frontend"
tags: ["TypeScript", "Type System", "Best Practices"]
summary: "整理了幾個在實際專案中反覆使用的 TypeScript 型別技巧，包含 Discriminated Union、Template Literal Types 等。"
published: true
---

## 前言

用 TypeScript 寫了幾年程式之後，我發現有一些型別技巧是我幾乎每個專案都會用到的。這篇文章把它們整理下來，方便自己查閱，也希望對你有幫助。

## 1. Discriminated Union — 最佳化狀態管理

這是我最喜歡的 TypeScript 技巧之一。當你有多種狀態時，用 Discriminated Union 可以讓編譯器幫你做**窮舉檢查**。

```typescript
type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error }

function renderResult<T>(state: RequestState<T>) {
  switch (state.status) {
    case 'idle':    return <p>尚未請求</p>
    case 'loading': return <Spinner />
    case 'success': return <DataView data={state.data} />
    case 'error':   return <ErrorView error={state.error} />
    // TypeScript 在這裡知道所有 case 都被處理了
  }
}
```

### 為什麼不用 boolean flags？

```typescript
// ❌ 這樣的設計容易出現不可能的狀態
type BadState = {
  isLoading: boolean
  isError: boolean
  data?: SomeData
  error?: Error
}

// ✅ Discriminated Union 消除不可能的狀態
type GoodState<T> = RequestState<T>
```

## 2. Template Literal Types — 型別安全的字串

TypeScript 4.1 引入的 Template Literal Types 讓你可以對字串做型別推論：

```typescript
type EventName = 'click' | 'focus' | 'blur'
type EventHandler = `on${Capitalize<EventName>}`
// 推論結果：'onClick' | 'onFocus' | 'onBlur'

type CSSProperty = 'margin' | 'padding'
type CSSDirectional = `${CSSProperty}-${'top' | 'right' | 'bottom' | 'left'}`
// 'margin-top' | 'margin-right' | ... | 'padding-bottom' | 'padding-left'
```

實際應用：

```typescript
type ApiEndpoint = '/users' | '/posts' | '/comments'
type HttpMethod  = 'GET' | 'POST' | 'PUT' | 'DELETE'
type Route = `${HttpMethod} ${ApiEndpoint}`
// 'GET /users' | 'POST /users' | ... 總共 12 種組合

const handler: Record<Route, () => void> = {
  'GET /users': () => { /* ... */ },
  // TypeScript 會要求你補齊所有組合
}
```

## 3. Infer — 從型別中提取資訊

`infer` 關鍵字讓你可以在 Conditional Types 中「推斷」並捕獲型別：

```typescript
// 提取 Promise 的 resolve 型別
type Awaited<T> = T extends Promise<infer R> ? R : T

type A = Awaited<Promise<string>>  // string
type B = Awaited<Promise<number[]>> // number[]

// 提取函式的回傳型別
type ReturnType<T> = T extends (...args: unknown[]) => infer R ? R : never

// 提取陣列元素型別
type ElementType<T> = T extends (infer E)[] ? E : never
type C = ElementType<string[]>  // string
```

## 4. Satisfies Operator — 型別驗證但保留推斷

TypeScript 4.9 的 `satisfies` 讓你可以驗證一個值符合某個型別，同時**保留更精確的推斷型別**：

```typescript
type Config = {
  colors: Record<string, string>
  sizes: Record<string, number>
}

const theme = {
  colors: {
    primary: '#c4622d',
    secondary: '#b5a07a',
  },
  sizes: {
    sm: 14,
    md: 16,
  },
} satisfies Config

// theme.colors.primary 的型別是 string（符合 Config）
// 但同時 theme.colors 的 key 有正確的自動補全
```

## 總結

這些技巧的共同點：**讓編譯器盡可能多地替你做檢查**。

好的型別設計不只是「寫了型別」，而是讓不合法的狀態在型別層面就無法存在。這個思考方式在設計資料結構和 API 時非常有用。
