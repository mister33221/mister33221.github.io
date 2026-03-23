import type { Metadata } from 'next'
import { getAllPosts, getAllCategories, getAllTags } from '@/lib/posts'
import BlogListClient from '@/components/blog/BlogListClient'
import styles from './page.module.css'

export const metadata: Metadata = { title: 'Tech Blog' }

export default function BlogPage() {
  const posts      = getAllPosts()
  const categories = getAllCategories(posts)
  const tags       = getAllTags(posts)

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
      <header className={styles.header}>
        <h1 className={`display-title ${styles.title}`}>Tech Blog</h1>
        <p className={styles.sub}>程式筆記、架構思考、踩坑記錄。</p>
      </header>
      <BlogListClient posts={posts} categories={categories} tags={tags} />
    </div>
  )
}
