import type { Metadata } from 'next'
import { getAllProjects, getProjectContent } from '@/lib/projects'
import ProjectsClient from '@/components/projects/ProjectsClient'
import styles from './page.module.css'

export const metadata: Metadata = { title: 'Projects' }

export default function ProjectsPage() {
  const projects = getAllProjects()
  const contentsMap: Record<string, string> = {}
  projects.forEach(p => {
    const html = getProjectContent(p)
    if (html) contentsMap[p.id] = html
  })

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
      <header className={styles.header}>
        <h1 className={`display-title ${styles.title}`}>Projects</h1>
        <p className={styles.sub}>探索、建造、學習，然後再重來一遍。</p>
      </header>
      <ProjectsClient projects={projects} contentsMap={contentsMap} />
    </div>
  )
}
