import { marked } from 'marked'
import hljs from 'highlight.js'

// ── Custom renderer (marked v12 uses positional args: heading(text, level, raw)) ──
marked.use({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  renderer: {
    heading(text: any, level: any) {
      const t = String(text ?? '')
      const d = Number(level ?? 2)
      const slug = t
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fff\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-{2,}/g, '-')
        .replace(/^-+|-+$/g, '')
      return `<h${d} id="${slug}">${t}</h${d}>\n`
    },

    code(code: any, infostring: any) {
      const src  = String(code ?? '')
      const lang = String(infostring ?? '').match(/^\S*/)?.[0] ?? ''
      const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext'
      const highlighted = hljs.highlight(src, { language }).value
      const langLabel   = lang || 'text'
      const escaped     = src.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
      return [
        `<div class="code-block-wrapper">`,
        `<pre><code class="hljs language-${langLabel}">${highlighted}</code></pre>`,
        `<button class="copy-btn" data-code="${escaped}">copy</button>`,
        `</div>\n`,
      ].join('')
    },
  },
})

export function renderMarkdown(source: string): string {
  return marked.parse(source) as string
}

export type TOCItem = {
  id: string
  text: string
  level: 2 | 3
}

export function extractTOC(source: string): TOCItem[] {
  const items: TOCItem[] = []
  const re = /^(#{2,3})\s+(.+)$/gm
  let m: RegExpExecArray | null
  while ((m = re.exec(source)) !== null) {
    const level = m[1].length as 2 | 3
    const raw   = m[2].trim().replace(/\*\*/g, '').replace(/`/g, '').replace(/_/g, '')
    const id    = raw
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fff\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-{2,}/g, '-')
      .replace(/^-+|-+$/g, '')
    items.push({ id, text: raw, level })
  }
  return items
}
