## 專案背景

我試用了很多筆記工具——Notion、Obsidian、Roam Research——但每一個都有讓我不滿意的地方。不是太重，就是離線能力太弱，或者客製化空間太小。

Fogboard 的目標是：**一個純前端、無伺服器、以 Markdown 為核心的個人知識管理工具**。所有資料儲存在你的瀏覽器，不依賴任何雲端服務。

## 技術架構

### 儲存層：IndexedDB

所有的 note 和 graph 資料都存在 IndexedDB。使用 `idb` 這個 wrapper library 讓非同步操作更好寫：

```typescript
const db = await openDB<FogboardDB>('fogboard', 1, {
  upgrade(db) {
    db.createObjectStore('notes', { keyPath: 'id' })
    db.createObjectStore('links', { keyPath: 'id' })
  },
})
```

### 雙向連結系統

每個 note 可以用 `[[note-title]]` 語法連結到其他 note。系統會在儲存時解析所有連結，建立雙向的 link graph：

```typescript
function extractLinks(content: string): string[] {
  const matches = content.matchAll(/\[\[([^\]]+)\]\]/g)
  return [...matches].map(m => m[1])
}
```

### Markdown 編輯器

使用 CodeMirror 6 作為底層編輯器，加上自定義的 Vim keybinding extension 和 Markdown syntax highlighting。

## 遇到的難題

### 難題 1：搜尋效能

當 note 數量超過 1000 時，全文搜尋的效能開始下降。解法是使用 [Orama](https://github.com/oramaSearch/orama) 這個純 JS 的全文搜尋引擎，在記憶體中建立索引。

## 學到了什麼

最大的收穫是對 IndexedDB 的深入理解，以及如何在純前端架構中設計一個可擴展的資料模型。也學到了 **不要過早最佳化**——第一版的搜尋是最簡單的線性搜尋，只有當真正遇到效能問題時才引入搜尋引擎。
