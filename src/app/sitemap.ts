import type { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/posts'
import { getAllCulturePosts } from '@/lib/culture'

const BASE = 'https://mister33221.github.io'

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts()
  const culture = getAllCulturePosts()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,                  lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/blog`,        lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/culture`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/projects`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/profile`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/resume`,      lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ]

  const postRoutes: MetadataRoute.Sitemap = posts.map(p => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: p.date ? new Date(p.date) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const cultureRoutes: MetadataRoute.Sitemap = culture.map(p => ({
    url: `${BASE}/culture/${p.slug}`,
    lastModified: p.date ? new Date(p.date) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...postRoutes, ...cultureRoutes]
}
