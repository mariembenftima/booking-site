import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { routing } from '@/i18n/routing'

export const revalidate = 3600 // rebuild the sitemap at most once an hour

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

// "/services" → "https://…/fr/services" · "/" → "https://…/fr"
const url = (locale: string, path: string) => `${SITE_URL}/${locale}${path === '/' ? '' : path}`

// Most recent of several dates (falls back to now)
const latest = (...dates: (string | null | undefined)[]) => {
  const times = dates.filter((d): d is string => Boolean(d)).map((d) => new Date(d).getTime())
  return times.length ? new Date(Math.max(...times)) : new Date()
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })
  const [services, settings, hours] = await Promise.all([
    payload.find({
      collection: 'services',
      where: { active: { equals: true } },
      sort: '-updatedAt',
      limit: 1,
      depth: 0,
    }),
    payload.findGlobal({ slug: 'site-settings' }),
    payload.findGlobal({ slug: 'business-hours' }),
  ])
  const lastServiceChange = services.docs[0]?.updatedAt

  // "Last modified" comes from real Payload data
  const pages = [
    { path: '/', lastModified: latest(settings.updatedAt, lastServiceChange), priority: 1 },
    { path: '/services', lastModified: latest(lastServiceChange), priority: 0.9 },
    { path: '/booking', lastModified: latest(lastServiceChange, hours.updatedAt), priority: 0.8 },
    { path: '/contact', lastModified: latest(settings.updatedAt, hours.updatedAt), priority: 0.6 },
  ]

  return pages.flatMap((page) =>
    routing.locales.map((locale) => ({
      url: url(locale, page.path),
      lastModified: page.lastModified,
      changeFrequency: 'weekly' as const,
      priority: page.priority,
      alternates: {
        languages: Object.fromEntries(routing.locales.map((l) => [l, url(l, page.path)])),
      },
    })),
  )
}