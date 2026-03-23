'use client'

import { useEffect } from 'react'

type Props = { html: string }

export default function ArticleContent({ html }: Props) {
  // Attach copy button logic after mount
  useEffect(() => {
    const btns = document.querySelectorAll<HTMLButtonElement>('.copy-btn')
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.dataset.code ?? ''
        navigator.clipboard.writeText(code).then(() => {
          btn.textContent = 'copied!'
          btn.classList.add('copied')
          setTimeout(() => {
            btn.textContent = 'copy'
            btn.classList.remove('copied')
          }, 2000)
        })
      })
    })
    return () => {
      btns.forEach(btn => {
        const clone = btn.cloneNode(true) as HTMLButtonElement
        btn.parentNode?.replaceChild(clone, btn)
      })
    }
  }, [html])

  return (
    <div
      className="article-body"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
