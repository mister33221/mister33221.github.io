'use client'

import { useState, useMemo } from 'react'
import type { PostMeta } from '@/lib/posts'
import PostCard from './PostCard'
import styles from './BlogListClient.module.css'

type Props = {
  posts: PostMeta[]
  categories: string[]
  tags: string[]
}

export default function BlogListClient({ posts, categories, tags }: Props) {
  const [query, setQuery]      = useState('')
  const [category, setCategory] = useState('')
  const [activeTags, setActiveTags] = useState<string[]>([])
  const [sort, setSort]        = useState<'newest' | 'oldest'>('newest')

  const toggleTag = (t: string) =>
    setActiveTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])

  const filtered = useMemo(() => {
    let result = [...posts]
    if (sort === 'oldest') result.reverse()
    if (category) result = result.filter(p => p.category === category)
    if (activeTags.length) result = result.filter(p => activeTags.every(t => p.tags.includes(t)))
    if (query.trim()) {
      const q = query.toLowerCase()
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q)
      )
    }
    return result
  }, [posts, sort, category, activeTags, query])

  return (
    <div>
      {/* Filters */}
      <div className={styles.filters}>
        <input
          className={styles.search}
          type="search"
          placeholder="搜尋文章..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          aria-label="搜尋文章"
        />
        <div className={styles.row}>
          <div className={styles.categories}>
            <button
              className={`tag ${!category ? 'active' : ''}`}
              onClick={() => setCategory('')}
            >全部</button>
            {categories.map(c => (
              <button
                key={c}
                className={`tag tag-category ${category === c ? 'active' : ''}`}
                onClick={() => setCategory(c === category ? '' : c)}
              >{c}</button>
            ))}
          </div>
          <select
            className={styles.sort}
            value={sort}
            onChange={e => setSort(e.target.value as 'newest' | 'oldest')}
            aria-label="排序"
          >
            <option value="newest">最新</option>
            <option value="oldest">最舊</option>
          </select>
        </div>
        {tags.length > 0 && (
          <div className={styles.tagRow}>
            {tags.map(t => (
              <button
                key={t}
                className={`tag ${activeTags.includes(t) ? 'active' : ''}`}
                onClick={() => toggleTag(t)}
              >{t}</button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      <p className={styles.count}>{filtered.length} 篇文章</p>
      {filtered.length === 0 ? (
        <p className={styles.empty}>沒有符合條件的文章。</p>
      ) : (
        <div className={styles.grid}>
          {filtered.map(post => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
