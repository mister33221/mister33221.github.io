import type { Metadata } from 'next'
import fs from 'fs'
import path from 'path'
import PrintButton from '@/components/ui/PrintButton'
import styles from './page.module.css'

export const metadata: Metadata = { title: 'Resume' }

type Resume = {
  basics: { name: string; title: string; email: string; location: string; summary: string }
  experience: { company: string; role: string; period: string; location: string; points: string[] }[]
  education: { school: string; degree: string; period: string }[]
  skills: Record<string, string[]>
  languages: { language: string; level: string }[]
  interests: string[]
}

function getResume(): Resume {
  const raw = fs.readFileSync(path.join(process.cwd(), 'data', 'resume.json'), 'utf8')
  return JSON.parse(raw)
}

export default function ResumePage() {
  const r = getResume()

  return (
    <div className={styles.page}>
      {/* Print button */}
      <div className={`container no-print ${styles.printBar}`}>
        <PrintButton />
      </div>

      <div className={`${styles.resume} container-narrow`}>
        {/* Header */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.name}>{r.basics.name}</h1>
            <p className={styles.jobTitle}>{r.basics.title}</p>
          </div>
          <div className={styles.contact}>
            {r.basics.email   && <span>{r.basics.email}</span>}
            {r.basics.location && <span>{r.basics.location}</span>}
          </div>
        </header>

        {r.basics.summary && (
          <section className={styles.section}>
            <p className={styles.summary}>{r.basics.summary}</p>
          </section>
        )}

        {/* Experience */}
        {r.experience?.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>工作經歷</h2>
            <div className={styles.timeline}>
              {r.experience.map((exp, i) => (
                <div key={i} className={styles.timelineItem}>
                  <div className={styles.timelineDot} aria-hidden="true" />
                  <div className={styles.timelineContent}>
                    <div className={styles.expHeader}>
                      <div>
                        <h3 className={styles.expRole}>{exp.role}</h3>
                        <p className={styles.expCompany}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</p>
                      </div>
                      <span className={styles.expPeriod}>{exp.period}</span>
                    </div>
                    <ul className={styles.points}>
                      {exp.points.map((pt, j) => <li key={j}>{pt}</li>)}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {r.education?.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>學歷</h2>
            <div className={styles.eduList}>
              {r.education.map((edu, i) => (
                <div key={i} className={styles.eduItem}>
                  <div>
                    <h3 className={styles.eduSchool}>{edu.school}</h3>
                    <p className={styles.eduDegree}>{edu.degree}</p>
                  </div>
                  <span className={styles.eduPeriod}>{edu.period}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {r.skills && Object.keys(r.skills).length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>技能</h2>
            <div className={styles.skillGroups}>
              {Object.entries(r.skills).map(([group, items]) => (
                <div key={group} className={styles.skillGroup}>
                  <span className={styles.skillGroupName}>{group}</span>
                  <div className={styles.skillTags}>
                    {items.map(s => <span key={s} className="tag">{s}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Languages */}
        {r.languages?.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>語言能力</h2>
            <div className={styles.langList}>
              {r.languages.map((l, i) => (
                <div key={i} className={styles.langItem}>
                  <span className={styles.langName}>{l.language}</span>
                  <span className={styles.langLevel}>{l.level}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Interests */}
        {r.interests?.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>興趣</h2>
            <p className={styles.interestText}>{r.interests.join(' · ')}</p>
          </section>
        )}
      </div>

    </div>
  )
}
