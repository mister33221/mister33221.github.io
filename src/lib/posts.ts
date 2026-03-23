import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts')

export type PostMeta = {
  slug: string
  title: string
  date: string
  updatedAt?: string
  category: string
  tags: string[]
  series?: string
  seriesOrder?: number
  summary: string
  cover?: string
  published: boolean
  readingTime: string
}

export type Post = PostMeta & { content: string }

function safeReadDir(dir: string): string[] {
  try { return fs.readdirSync(dir) } catch { return [] }
}

export function getAllPosts(): PostMeta[] {
  const files = safeReadDir(POSTS_DIR).filter(f => f.endsWith('.md'))
  return files
    .map(file => {
      const slug = file.replace(/\.md$/, '')
      const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8')
      const { data, content } = matter(raw)
      return {
        slug,
        title: data.title ?? slug,
        date: data.date ?? '',
        updatedAt: data.updatedAt,
        category: data.category ?? 'Notes',
        tags: data.tags ?? [],
        series: data.series,
        seriesOrder: data.seriesOrder,
        summary: data.summary ?? '',
        cover: data.cover,
        published: data.published !== false,
        readingTime: readingTime(content).text,
      } as PostMeta
    })
    .filter(p => p.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPostBySlug(slug: string): Post | null {
  const file = path.join(POSTS_DIR, `${slug}.md`)
  if (!fs.existsSync(file)) return null
  const raw = fs.readFileSync(file, 'utf8')
  const { data, content } = matter(raw)
  return {
    slug,
    title: data.title ?? slug,
    date: data.date ?? '',
    updatedAt: data.updatedAt,
    category: data.category ?? 'Notes',
    tags: data.tags ?? [],
    series: data.series,
    seriesOrder: data.seriesOrder,
    summary: data.summary ?? '',
    cover: data.cover,
    published: data.published !== false,
    readingTime: readingTime(content).text,
    content,
  }
}

export function getAllCategories(posts: PostMeta[]): string[] {
  return [...new Set(posts.map(p => p.category))].sort()
}

export function getAllTags(posts: PostMeta[]): string[] {
  return [...new Set(posts.flatMap(p => p.tags))].sort()
}
