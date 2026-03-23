import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'

const CULTURE_DIR = path.join(process.cwd(), 'content', 'culture')

export type CultureMeta = {
  slug: string
  title: string
  date: string
  category: string
  tags: string[]
  moodTags: string[]
  rating: number
  workInfo: {
    creator: string
    year: number
    genre: string
    origin: string
  }
  externalLinks: {
    spotify?: string
    youtube?: string
    letterboxd?: string
    imdb?: string
  }
  summary: string
  cover?: string
  published: boolean
  readingTime: string
}

export type CulturePost = CultureMeta & { content: string }

function safeReadDir(dir: string): string[] {
  try { return fs.readdirSync(dir) } catch { return [] }
}

export function getAllCulturePosts(): CultureMeta[] {
  const files = safeReadDir(CULTURE_DIR).filter(f => f.endsWith('.md'))
  return files
    .map(file => {
      const slug = file.replace(/\.md$/, '')
      const raw = fs.readFileSync(path.join(CULTURE_DIR, file), 'utf8')
      const { data, content } = matter(raw)
      return {
        slug,
        title: data.title ?? slug,
        date: data.date ?? '',
        category: data.category ?? '音樂專輯',
        tags: data.tags ?? [],
        moodTags: data.moodTags ?? [],
        rating: data.rating ?? 0,
        workInfo: data.workInfo ?? { creator: '', year: 0, genre: '', origin: '' },
        externalLinks: data.externalLinks ?? {},
        summary: data.summary ?? '',
        cover: data.cover,
        published: data.published !== false,
        readingTime: readingTime(content).text,
      } as CultureMeta
    })
    .filter(p => p.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getCulturePostBySlug(slug: string): CulturePost | null {
  const file = path.join(CULTURE_DIR, `${slug}.md`)
  if (!fs.existsSync(file)) return null
  const raw = fs.readFileSync(file, 'utf8')
  const { data, content } = matter(raw)
  return {
    slug,
    title: data.title ?? slug,
    date: data.date ?? '',
    category: data.category ?? '音樂專輯',
    tags: data.tags ?? [],
    moodTags: data.moodTags ?? [],
    rating: data.rating ?? 0,
    workInfo: data.workInfo ?? { creator: '', year: 0, genre: '', origin: '' },
    externalLinks: data.externalLinks ?? {},
    summary: data.summary ?? '',
    cover: data.cover,
    published: data.published !== false,
    readingTime: readingTime(content).text,
    content,
  }
}

export function getAllCultureCategories(posts: CultureMeta[]): string[] {
  return [...new Set(posts.map(p => p.category))].sort()
}
