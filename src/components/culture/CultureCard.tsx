import Link from 'next/link'
import type { CultureMeta } from '@/lib/culture'
import RatingStars from './RatingStars'
import Tag from '@/components/ui/Tag'
import styles from './CultureCard.module.css'

type Props = { post: CultureMeta }

export default function CultureCard({ post }: Props) {
  return (
    <article className={`card ${styles.card}`}>
      <Link href={`/culture/${post.slug}`} className={styles.link}>
        <header>
          <div className={styles.meta}>
            <Tag label={post.category} variant="culture" />
            <span className={styles.date}>{formatDate(post.date)}</span>
          </div>
          <h2 className={styles.title}>{post.title}</h2>
          {post.workInfo?.creator && (
            <p className={styles.creator}>
              {post.workInfo.creator}
              {post.workInfo.year ? ` · ${post.workInfo.year}` : ''}
              {post.workInfo.genre ? ` · ${post.workInfo.genre}` : ''}
            </p>
          )}
          {post.rating > 0 && (
            <div className={styles.rating}>
              <RatingStars rating={post.rating} />
            </div>
          )}
          {post.summary && <p className={styles.summary}>{post.summary}</p>}
        </header>
        <footer className={styles.footer}>
          <div className={styles.tags}>
            {post.tags.map(t => <Tag key={t} label={t} variant="culture" />)}
          </div>
          {post.moodTags.length > 0 && (
            <div className={styles.moodTags}>
              {post.moodTags.map(t => <Tag key={t} label={`# ${t}`} variant="mood" />)}
            </div>
          )}
        </footer>
      </Link>
    </article>
  )
}

function formatDate(d: string) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
}
