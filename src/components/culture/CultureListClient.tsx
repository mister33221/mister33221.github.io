'use client'

import { useState, useMemo } from 'react'
import type { CultureMeta } from '@/lib/culture'
import CultureCard from './CultureCard'
import styles from './CultureListClient.module.css'

type Props = {
  posts: CultureMeta[]
  categories: string[]
}

export default function CultureListClient({ posts, categories }: Props) {
  const [query, setQuery]      = useState('')
  const [category, setCategory] = useState('')
  const [sort, setSort]        = useState<'newest' | 'oldest' | 'rating'>('newest')

  const filtered = useMemo(() => {
    let result = [...posts]
    if (sort === 'oldest') result.reverse()
    if (sort === 'rating') result.sort((a, b) => b.rating - a.rating)
    if (category) result = result.filter(p => p.category === category)
    if (query.trim()) {
      const q = query.toLowerCase()
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.workInfo?.creator?.toLowerCase().includes(q)
      )
    }
    return result
  }, [posts, sort, category, query])

  return (
    <div>
      <div className={styles.filters}>
        <input
          className={styles.search}
          type="search"
          placeholder="搜尋作品..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          aria-label="搜尋作品"
        />
        <div className={styles.row}>
          <div className={styles.categories}>
            <button className={`tag tag-culture ${!category ? 'active' : ''}`} onClick={() => setCategory('')}>全部</button>
            {categories.map(c => (
              <button
                key={c}
                className={`tag tag-culture ${category === c ? 'active' : ''}`}
                onClick={() => setCategory(c === category ? '' : c)}
              >{c}</button>
            ))}
          </div>
          <select
            className={styles.sort}
            value={sort}
            onChange={e => setSort(e.target.value as typeof sort)}
            aria-label="排序"
          >
            <option value="newest">最新</option>
            <option value="oldest">最舊</option>
            <option value="rating">評分</option>
          </select>
        </div>
      </div>

      <p className={styles.count}>{filtered.length} 篇評論</p>
      {filtered.length === 0 ? (
        <p className={styles.empty}>沒有符合條件的評論。</p>
      ) : (
        <div className={styles.grid}>
          {filtered.map(post => <CultureCard key={post.slug} post={post} />)}
        </div>
      )}
    </div>
  )
}
