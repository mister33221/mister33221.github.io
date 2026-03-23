import type { Metadata } from 'next'
import { getAllCulturePosts, getAllCultureCategories } from '@/lib/culture'
import CultureListClient from '@/components/culture/CultureListClient'
import styles from './page.module.css'

export const metadata: Metadata = { title: 'Culture Blog' }

export default function CulturePage() {
  const posts      = getAllCulturePosts()
  const categories = getAllCultureCategories(posts)
  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
      <header className={styles.header}>
        <h1 className={`display-title ${styles.title}`}>Culture Blog</h1>
        <p className={styles.sub}>電影、音樂、書籍，以及那些在深夜裡觸動你的事物。</p>
      </header>
      <CultureListClient posts={posts} categories={categories} />
    </div>
  )
}
