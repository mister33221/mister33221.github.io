'use client'

import { useState, useMemo } from 'react'
import type { Project } from '@/lib/projects'
import styles from './ProjectsClient.module.css'

type Props = { projects: Project[]; contentsMap: Record<string, string> }

type Tab = 'work' | 'side'

const STATUS_LABEL: Record<string, string> = {
  completed:     '完成',
  'in-progress': '進行中',
  archived:      '封存',
}

export default function ProjectsClient({ projects, contentsMap }: Props) {
  const [tab, setTab]           = useState<Tab>('work')
  const [activeTech, setActiveTech] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  // Reset tech filter & expanded on tab change
  const handleTabChange = (t: Tab) => {
    setTab(t)
    setActiveTech('')
    setExpanded(null)
  }

  const tabProjects = useMemo(
    () => projects.filter(p => p.type === tab),
    [projects, tab]
  )

  const allTech = useMemo(
    () => [...new Set(tabProjects.flatMap(p => p.tech))].sort(),
    [tabProjects]
  )

  const filtered = useMemo(() => {
    const list = activeTech ? tabProjects.filter(p => p.tech.includes(activeTech)) : tabProjects
    return [...list].sort((a, b) => b.year - a.year)
  }, [tabProjects, activeTech])

  const workCount = projects.filter(p => p.type === 'work').length
  const sideCount = projects.filter(p => p.type === 'side').length

  return (
    <div>
      {/* ── Tabs ── */}
      <div className={styles.tabs} role="tablist">
        <button
          role="tab"
          aria-selected={tab === 'work'}
          className={`${styles.tab} ${tab === 'work' ? styles.tabActive : ''}`}
          onClick={() => handleTabChange('work')}
        >
          工作經歷開發
          <span className={styles.tabCount}>{workCount}</span>
        </button>
        <button
          role="tab"
          aria-selected={tab === 'side'}
          className={`${styles.tab} ${tab === 'side' ? styles.tabActive : ''}`}
          onClick={() => handleTabChange('side')}
        >
          Side Projects
          <span className={styles.tabCount}>{sideCount}</span>
        </button>
      </div>

      {/* ── Tech filter ── */}
      {allTech.length > 0 && (
        <div className={styles.filters}>
          <button
            className={`tag ${!activeTech ? 'active' : ''}`}
            onClick={() => setActiveTech('')}
          >全部</button>
          {allTech.map(t => (
            <button
              key={t}
              className={`tag ${activeTech === t ? 'active' : ''}`}
              onClick={() => setActiveTech(t === activeTech ? '' : t)}
            >{t}</button>
          ))}
        </div>
      )}

      {/* ── Project list ── */}
      {filtered.length === 0 ? (
        <p className={styles.empty}>此分類尚無專案。</p>
      ) : (
        <div className={styles.list}>
          {filtered.map(proj => (
            <div
              key={proj.id}
              className={`card ${styles.project} ${expanded === proj.id ? styles.open : ''}`}
            >
              <div
                className={styles.header}
                onClick={() => setExpanded(expanded === proj.id ? null : proj.id)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && setExpanded(expanded === proj.id ? null : proj.id)}
                aria-expanded={expanded === proj.id}
              >
                <div className={styles.left}>
                  <div className={styles.titleRow}>
                    <h2 className={styles.name}>{proj.name}</h2>
                    <span className={`${styles.status} ${styles[proj.status.replace('-', '_') as keyof typeof styles]}`}>
                      {STATUS_LABEL[proj.status] ?? proj.status}
                    </span>
                    <span className={styles.year}>{proj.year}</span>
                  </div>
                  <p className={styles.tagline}>{proj.tagline}</p>
                  <div className={styles.tech}>
                    {proj.tech.map(t => <span key={t} className="tag">{t}</span>)}
                  </div>
                </div>
                <svg
                  className={styles.chevron}
                  width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="1.5"
                  style={{ transform: expanded === proj.id ? 'rotate(180deg)' : 'rotate(0)', transition: '300ms' }}
                  aria-hidden="true"
                >
                  <path d="M19 9l-7 7-7-7"/>
                </svg>
              </div>

              {expanded === proj.id && (
                <div className={styles.detail}>
                  {/* Links */}
                  {(proj.links.github || proj.links.demo) && (
                    <div className={styles.links}>
                      {proj.links.github && (
                        <a href={proj.links.github} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">GitHub</a>
                      )}
                      {proj.links.demo && (
                        <a href={proj.links.demo} target="_blank" rel="noopener noreferrer" className="btn btn-outline">Demo</a>
                      )}
                    </div>
                  )}
                  {/* Highlights */}
                  {proj.highlights?.length > 0 && (
                    <ul className={styles.highlights}>
                      {proj.highlights.map((h, i) => <li key={i}>{h}</li>)}
                    </ul>
                  )}
                  {/* Full MD content */}
                  {contentsMap[proj.id] && (
                    <div
                      className={`article-body ${styles.body}`}
                      dangerouslySetInnerHTML={{ __html: contentsMap[proj.id] }}
                    />
                  )}
                  {/* Collapse button */}
                  <div className={styles.collapseRow}>
                    <button
                      className={styles.collapseBtn}
                      onClick={() => setExpanded(null)}
                      aria-label="收起"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                        <path d="M5 15l7-7 7 7"/>
                      </svg>
                      收起
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
