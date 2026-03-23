import fs from 'fs'
import path from 'path'
import { renderMarkdown } from './markdown'

const PROJECTS_FILE = path.join(process.cwd(), 'data', 'projects.json')
const PROJECTS_CONTENT_DIR = path.join(process.cwd(), 'content', 'projects')

export type Project = {
  id: string
  name: string
  tagline: string
  description: string   // path to MD file
  tech: string[]
  highlights: string[]
  status: 'completed' | 'in-progress' | 'archived'
  links: { github?: string; demo?: string }
  cover?: string
  featured: boolean
  year: number
  type: 'work' | 'side'
}

export type ProjectWithContent = Project & { html: string }

export function getAllProjects(): Project[] {
  try {
    const raw = fs.readFileSync(PROJECTS_FILE, 'utf8')
    return JSON.parse(raw) as Project[]
  } catch { return [] }
}

export function getProjectContent(project: Project): string {
  const mdPath = project.description.startsWith('/')
    ? path.join(process.cwd(), 'content', 'projects', path.basename(project.description))
    : path.join(PROJECTS_CONTENT_DIR, project.description)
  try {
    const src = fs.readFileSync(mdPath, 'utf8')
    return renderMarkdown(src)
  } catch { return '' }
}
