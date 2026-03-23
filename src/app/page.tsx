import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'
import { getAllCulturePosts } from '@/lib/culture'
import { getAllProjects } from '@/lib/projects'
import PostCard from '@/components/blog/PostCard'
import CultureCard from '@/components/culture/CultureCard'
import EmberParticles from '@/components/particles/EmberParticles'
import styles from './page.module.css'

export default function Home() {
  const posts    = getAllPosts().slice(0, 3)
  const culture  = getAllCulturePosts().slice(0, 3)
  const projects = getAllProjects().filter(p => p.featured).slice(0, 3)

  return (
    <>
      {/* ── Hero ── */}
      <section className={styles.hero} aria-label="Hero">
        <div className={styles.heroEmber} aria-hidden="true">
          <EmberParticles variant="hero" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} />
        </div>
        <div className={`container ${styles.heroContent}`}>
          <p className={styles.heroPre}>Hello, I am</p>
          <h1 className={`display-title ${styles.heroTitle}`}>Kai</h1>
          <p className={styles.heroSub}>Java 後端工程師，邊聽後搖邊寫程式，週末可能在某座山上。</p>
          <div className={styles.heroCta}>
            <Link href="/blog" className="btn btn-primary">Tech Writing</Link>
            <Link href="/profile" className="btn btn-outline">About Me</Link>
          </div>
        </div>
        <div className={styles.heroCorner} aria-hidden="true" />
      </section>

      {/* ── Tech Blog ── */}
      <section className={`container ${styles.section}`}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Tech Blog</h2>
          <Link href="/blog" className={styles.sectionMore}>所有文章 →</Link>
        </div>
        {posts.length === 0 ? (
          <p className={styles.empty}>尚無文章。</p>
        ) : (
          <div className={styles.grid}>
            {posts.map(p => <PostCard key={p.slug} post={p} />)}
          </div>
        )}
      </section>

      <hr className="section-divider container" />

      {/* ── Culture Blog ── */}
      <section className={`container ${styles.section}`}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Culture Blog</h2>
          <Link href="/culture" className={styles.sectionMore}>所有評論 →</Link>
        </div>
        {culture.length === 0 ? (
          <p className={styles.empty}>尚無評論。</p>
        ) : (
          <div className={styles.grid}>
            {culture.map(p => <CultureCard key={p.slug} post={p} />)}
          </div>
        )}
      </section>

      <hr className="section-divider container" />

      {/* ── Projects ── */}
      {projects.length > 0 && (
        <section className={`container ${styles.section}`}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>精選專案</h2>
            <Link href="/projects" className={styles.sectionMore}>所有專案 →</Link>
          </div>
          <div className={styles.projectList}>
            {projects.map(proj => (
              <div key={proj.id} className={`card ${styles.projectCard}`}>
                <div className={styles.projectTop}>
                  <h3 className={styles.projectName}>{proj.name}</h3>
                  <span className={styles.projectYear}>{proj.year}</span>
                </div>
                <p className={styles.projectTagline}>{proj.tagline}</p>
                <div className={styles.techTags}>
                  {proj.tech.map(t => <span key={t} className="tag">{t}</span>)}
                </div>
                <div className={styles.projectLinks}>
                  {proj.links.github && (
                    <a href={proj.links.github} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">GitHub</a>
                  )}
                  {proj.links.demo && (
                    <a href={proj.links.demo} target="_blank" rel="noopener noreferrer" className="btn btn-outline">Demo</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
