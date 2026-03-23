import Link from 'next/link'
import type { PostMeta } from '@/lib/posts'
import Tag from '@/components/ui/Tag'
import styles from './PostCard.module.css'

type Props = { post: PostMeta; basePath?: string }

export default function PostCard({ post, basePath = '/blog' }: Props) {
  return (
    <article className={`card ${styles.card}`}>
      <Link href={`${basePath}/${post.slug}`} className={styles.link}>
        <header>
          <div className={styles.meta}>
            <Tag label={post.category} variant="category" />
            <span className={styles.date}>{formatDate(post.date)}</span>
            <span className={styles.rt}>{post.readingTime}</span>
          </div>
          <h2 className={styles.title}>{post.title}</h2>
          {post.summary && <p className={styles.summary}>{post.summary}</p>}
        </header>
        {post.tags.length > 0 && (
          <footer className={styles.tags}>
            {post.tags.map(t => <Tag key={t} label={t} />)}
          </footer>
        )}
        {post.series && (
          <div className={styles.series}>
            <span>連載：{post.series}</span>
            {post.seriesOrder && <span> · 第 {post.seriesOrder} 篇</span>}
          </div>
        )}
      </Link>
    </article>
  )
}

function formatDate(d: string) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
}
