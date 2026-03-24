import type { Metadata } from 'next'
import './globals.css'
import './hljs-theme.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const BASE_URL = 'https://mister33221.github.io'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    template: '%s | 謝凱威 Kai',
    default: '謝凱威 Kai — Java 後端工程師',
  },
  description: '謝凱威的個人網站：Java 後端工程師，技術筆記、Spring Boot、Docker、Redis、Kafka、Angular，以及生活與音樂。',
  keywords: ['Java', 'Spring Boot', 'Backend', '後端工程師', 'Docker', 'Redis', 'Kafka', 'Angular', '謝凱威', 'Kai'],
  authors: [{ name: '謝凱威 Kai', url: BASE_URL }],
  openGraph: {
    type: 'website',
    locale: 'zh_TW',
    url: BASE_URL,
    siteName: '謝凱威 Kai',
    title: '謝凱威 Kai — Java 後端工程師',
    description: '謝凱威的個人網站：Java 後端工程師，技術筆記、Spring Boot、Docker、Redis、Kafka、Angular，以及生活與音樂。',
    images: [{ url: '/images/avatar.jpg', width: 400, height: 400, alt: '謝凱威 Kai' }],
  },
  twitter: {
    card: 'summary',
    title: '謝凱威 Kai — Java 後端工程師',
    description: '謝凱威的個人網站：Java 後端工程師，技術筆記、Spring Boot、Docker、Redis、Kafka、Angular，以及生活與音樂。',
    images: ['/images/avatar.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: BASE_URL,
  },
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
