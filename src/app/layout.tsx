import type { Metadata } from 'next'
import './globals.css'
import './hljs-theme.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: {
    template: '%s | Your Name',
    default: 'Your Name — Software Engineer',
  },
  description: '個人網站：技術筆記、影視音樂評論、作品集與線上履歷',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <Navbar />
        <main style={{ paddingTop: 'var(--nav-h)' }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
