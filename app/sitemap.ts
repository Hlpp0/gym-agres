import type { MetadataRoute } from 'next'
import { getAllElements } from '@/lib/elements'
import { AGRES } from '@/lib/agres'

const BASE = 'https://www.getuma.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const elements = getAllElements()

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: 'monthly', priority: 1.0 },
    { url: `${BASE}/elements`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/a-propos`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/mentions-legales`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/politique-de-confidentialite`, changeFrequency: 'monthly', priority: 0.3 },
  ]

  const agresPages: MetadataRoute.Sitemap = AGRES.map(a => ({
    url: `${BASE}/agres/${a.slug}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const elementPages: MetadataRoute.Sitemap = elements.map(el => ({
    url: `${BASE}/elements/${el.slug}`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [...staticPages, ...agresPages, ...elementPages]
}
