import type { Metadata } from 'next'
import fs from 'fs'
import path from 'path'
import { renderMarkdown } from '@/lib/markdown'
import styles from './page.module.css'

export const metadata: Metadata = { title: 'Profile' }

type Profile = {
  name: string
  title: string
  avatar: string
  bio: string
  location: string
  skills: Record<string, string[]>
  interests: string[]
  links: Record<string, string>
  resume_pdf?: string
}

function getProfile(): Profile {
  const raw = fs.readFileSync(path.join(process.cwd(), 'data', 'profile.json'), 'utf8')
  return JSON.parse(raw)
}

function getBio(bioPath: string): string {
  const file = path.join(process.cwd(), bioPath.replace(/^\//, ''))
  try { return renderMarkdown(fs.readFileSync(file, 'utf8')) } catch { return '' }
}

export default function ProfilePage() {
  const profile = getProfile()
  const bioHtml = getBio(profile.bio)

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
      <div className={styles.layout}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          {profile.avatar && (
            <img
              src={profile.avatar}
              alt={`${profile.name} 的頭像`}
              className={styles.avatar}
              width={160}
              height={160}
            />
          )}
          <h1 className={styles.name}>{profile.name}</h1>
          <p className={styles.title}>{profile.title}</p>
          {profile.location && (
            <p className={styles.location}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M12 21s-8-6.8-8-12a8 8 0 1116 0c0 5.2-8 12-8 12z"/>
                <circle cx="12" cy="9" r="2.5"/>
              </svg>
              {profile.location}
            </p>
          )}

          {/* Links */}
          <div className={styles.links}>
            {profile.links.github && (
              <a href={profile.links.github} target="_blank" rel="noopener noreferrer" className={styles.linkItem} aria-label="GitHub">
                GitHub
              </a>
            )}
            {profile.links.linkedin && (
              <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer" className={styles.linkItem} aria-label="LinkedIn">
                LinkedIn
              </a>
            )}
            {profile.links.email && (
              <a href={`mailto:${profile.links.email}`} className={styles.linkItem} aria-label="Email">
                Email
              </a>
            )}
          </div>

          {profile.resume_pdf && (
            <a href={profile.resume_pdf} download className="btn btn-outline" style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}>
              下載履歷 PDF
            </a>
          )}
        </aside>

        {/* Main */}
        <main className={styles.main}>
          {/* Bio */}
          {bioHtml && (
            <section className={styles.section}>
              <div className={`article-body ${styles.bio}`} dangerouslySetInnerHTML={{ __html: bioHtml }} />
            </section>
          )}

          {/* Skills */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Skills</h2>
            <div className={styles.skillGroups}>
              {Object.entries(profile.skills).map(([group, items]) => (
                <div key={group} className={styles.skillGroup}>
                  <h3 className={styles.skillGroupTitle}>{group}</h3>
                  <div className={styles.skillTags}>
                    {items.map(skill => (
                      <span key={skill} className="tag">{skill}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Interests */}
          {profile.interests?.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Interests</h2>
              <div className={styles.interestTags}>
                {profile.interests.map(i => (
                  <span key={i} className="tag tag-mood">{i}</span>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
