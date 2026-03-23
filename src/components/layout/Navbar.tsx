'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import EmberParticles from '@/components/particles/EmberParticles'
import styles from './Navbar.module.css'

const NAV_LINKS = [
  { href: '/blog',     label: 'Blog' },
  { href: '/culture',  label: 'Culture' },
  { href: '/projects', label: 'Projects' },
  { href: '/profile',  label: 'Profile' },
  { href: '/resume',   label: 'Resume' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className={styles.nav} role="navigation" aria-label="Main navigation">
      <div className={styles.inner}>
        {/* Logo */}
        <Link href="/" className={styles.logo} aria-label="Home">
          <span className={styles.logoText}>KW</span>
          <div className={styles.logoEmber} aria-hidden="true">
            <EmberParticles variant="logo" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} />
          </div>
        </Link>

        {/* Nav links */}
        <ul className={styles.links} role="list">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`${styles.link} ${active ? styles.active : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
