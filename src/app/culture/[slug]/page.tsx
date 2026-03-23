import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAllCulturePosts, getCulturePostBySlug } from '@/lib/culture'
import { renderMarkdown, extractTOC } from '@/lib/markdown'
import TOC from '@/components/blog/TOC'
import ArticleContent from '@/components/blog/ArticleContent'
import RatingStars from '@/components/culture/RatingStars'
import Tag from '@/components/ui/Tag'
import GiscusComments from '@/components/ui/GiscusComments'
import styles from './page.module.css'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return getAllCulturePosts().map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getCulturePostBySlug(slug)
  if (!post) return {}
  return { title: post.title, description: post.summary }
}

export default async function CulturePostPage({ params }: Props) {
  const { slug } = await params
  const post = getCulturePostBySlug(slug)
  if (!post) notFound()

  const html = renderMarkdown(post.content)
  const toc  = extractTOC(post.content)
  const { externalLinks: el, workInfo: wi } = post

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.twoCol}>
        {/* ── Left: TOC sidebar ── */}
        <aside className={styles.tocCol} aria-label="文章目錄">
          <TOC items={toc} />
        </aside>

        {/* ── Right: Article ── */}
        <div className={styles.articleCol}>
          <header className={styles.header}>
            <div className={styles.meta}>
              <Tag label={post.category} variant="culture" />
              <span className={styles.date}>{formatDate(post.date)}</span>
              <span className={styles.rt}>{post.readingTime}</span>
            </div>
            <h1 className={styles.title}>{post.title}</h1>
            {post.rating > 0 && (
              <div className={styles.rating}><RatingStars rating={post.rating} /></div>
            )}
            {post.summary && <p className={styles.summary}>{post.summary}</p>}

            {/* Work info card */}
            {wi && (
              <div className={styles.workInfo}>
                {wi.creator && <div><span className={styles.wiLabel}>作者／創作者</span><span>{wi.creator}</span></div>}
                {wi.year > 0 && <div><span className={styles.wiLabel}>年份</span><span>{wi.year}</span></div>}
                {wi.genre   && <div><span className={styles.wiLabel}>類型</span><span>{wi.genre}</span></div>}
                {wi.origin  && <div><span className={styles.wiLabel}>來源地</span><span>{wi.origin}</span></div>}
              </div>
            )}

            {/* External links */}
            <div className={styles.extLinks}>
              {el?.spotify    && <a href={el.spotify}    target="_blank" rel="noopener noreferrer" className="btn btn-ghost">Spotify</a>}
              {el?.youtube    && <a href={el.youtube}    target="_blank" rel="noopener noreferrer" className="btn btn-ghost">YouTube</a>}
              {el?.imdb       && <a href={el.imdb}       target="_blank" rel="noopener noreferrer" className="btn btn-ghost">IMDb</a>}
              {el?.letterboxd && <a href={el.letterboxd} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">Letterboxd</a>}
            </div>

            {/* Tags */}
            <div className={styles.tagArea}>
              {post.tags.map(t => <Tag key={t} label={t} variant="culture" />)}
              {post.moodTags.map(t => <Tag key={t} label={`# ${t}`} variant="mood" />)}
            </div>
          </header>

          <ArticleContent html={html} />

          {/* Giscus 留言 */}
          <GiscusComments term={`culture-${post.slug}`} />

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <Link href="/culture" className="btn btn-ghost">← 返回列表</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatDate(d: string) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
}
