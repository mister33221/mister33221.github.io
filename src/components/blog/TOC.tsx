'use client'

import { useEffect, useState } from 'react'
import type { TOCItem } from '@/lib/markdown'
import styles from './TOC.module.css'

type Props = { items: TOCItem[] }

export default function TOC({ items }: Props) {
  const [active, setActive] = useState<string>('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (items.length === 0) return
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: '0px 0px -60% 0px', threshold: 0 }
    )
    items.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [items])

  if (items.length === 0) return null

  return (
    <>
      {/* Mobile: collapsible at top */}
      <div className={styles.mobile}>
        <button className={styles.toggle} onClick={() => setOpen(v => !v)} aria-expanded={open}>
          <span>目錄</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: '300ms' }}>
            <path d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
        {open && <TOCList items={items} active={active} />}
      </div>

      {/* Desktop: floating sidebar */}
      <aside className={styles.desktop} aria-label="目錄">
        <p className={styles.heading}>目錄</p>
        <TOCList items={items} active={active} />
      </aside>
    </>
  )
}

function TOCList({ items, active }: { items: TOCItem[]; active: string }) {
  return (
    <nav>
      <ul className={styles.list}>
        {items.map(item => (
          <li key={item.id} className={item.level === 3 ? styles.sub : ''}>
            <a
              href={`#${item.id}`}
              className={`${styles.item} ${active === item.id ? styles.active : ''}`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
