import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAllPosts, getPostBySlug } from '@/lib/posts'
import { renderMarkdown, extractTOC } from '@/lib/markdown'
import TOC from '@/components/blog/TOC'
import ArticleContent from '@/components/blog/ArticleContent'
import EmberParticles from '@/components/particles/EmberParticles'
import Tag from '@/components/ui/Tag'
import GiscusComments from '@/components/ui/GiscusComments'
import styles from './page.module.css'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return getAllPosts().map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}
  const url = `https://mister33221.github.io/blog/${slug}`
  return {
    title: post.title,
    description: post.summary || post.title,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: post.title,
      description: post.summary || post.title,
      publishedTime: post.date,
      authors: ['謝凱威 Kai'],
      tags: post.tags,
    },
    twitter: {
      card: 'summary',
      title: post.title,
      description: post.summary || post.title,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const html = renderMarkdown(post.content)
  const toc  = extractTOC(post.content)

  // Series navigation
  const allPosts = getAllPosts()
  const idx = allPosts.findIndex(p => p.slug === slug)
  const prev = allPosts[idx + 1] ?? null
  const next = allPosts[idx - 1] ?? null

  // Series posts if applicable
  const seriesPosts = post.series
    ? allPosts.filter(p => p.series === post.series).sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0))
    : []

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.twoCol}>
        {/* ── Left: TOC sidebar ── */}
        <aside className={styles.tocCol} aria-label="文章目錄">
          <TOC items={toc} />
        </aside>

        {/* ── Right: Article ── */}
        <div className={styles.articleCol}>
          {/* Header */}
          <header className={styles.header}>
            <div className={styles.meta}>
              <Tag label={post.category} variant="category" />
              <span className={styles.date}>{formatDate(post.date)}</span>
              {post.updatedAt && <span className={styles.date}>更新：{formatDate(post.updatedAt)}</span>}
              <span className={styles.rt}>{post.readingTime}</span>
            </div>
            <h1 className={styles.title}>{post.title}</h1>
            {post.summary && <p className={styles.summary}>{post.summary}</p>}
            {post.tags.length > 0 && (
              <div className={styles.tags}>
                {post.tags.map(t => <Tag key={t} label={t} />)}
              </div>
            )}
          </header>

          {/* Series block */}
          {seriesPosts.length > 0 && (
            <aside className={styles.series}>
              <p className={styles.seriesTitle}>連載：{post.series}</p>
              <ol className={styles.seriesList}>
                {seriesPosts.map(sp => (
                  <li key={sp.slug} className={sp.slug === slug ? styles.seriesCurrent : ''}>
                    {sp.slug === slug
                      ? <span>{sp.seriesOrder}. {sp.title}</span>
                      : <Link href={`/blog/${sp.slug}`}>{sp.seriesOrder}. {sp.title}</Link>}
                  </li>
                ))}
              </ol>
            </aside>
          )}

          {/* Article body */}
          <ArticleContent html={html} />

          {/* Prev/Next */}
          <nav className={styles.postNav} aria-label="文章導航">
            <div className={styles.postNavEmber} aria-hidden="true">
              <EmberParticles variant="article-nav" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} />
            </div>
            <div className={styles.postNavInner}>
              {prev ? (
                <Link href={`/blog/${prev.slug}`} className={styles.navLink}>
                  <span className={styles.navLabel}>← 上一篇</span>
                  <span className={styles.navTitle}>{prev.title}</span>
                </Link>
              ) : <div />}
              {next ? (
                <Link href={`/blog/${next.slug}`} className={`${styles.navLink} ${styles.navRight}`}>
                  <span className={styles.navLabel}>下一篇 →</span>
                  <span className={styles.navTitle}>{next.title}</span>
                </Link>
              ) : <div />}
            </div>
          </nav>

          {/* Giscus 留言 */}
          <GiscusComments term={`blog-${post.slug}`} />

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <Link href="/blog" className="btn btn-ghost">← 返回列表</Link>
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
