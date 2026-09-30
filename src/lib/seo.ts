import type { Metadata } from 'next'
import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { routing } from '@/i18n/routing'

type PageKey = 'home' | 'services' | 'contact' | 'booking'

const OG_LOCALE = { fr: 'fr_FR', en: 'en_US' } as const

// "/services" → "/fr/services" · "/" → "/fr"
const localized = (locale: string, path: string) => `/${locale}${path === '/' ? '' : path}`

/** Title, description, canonical, hreflang, Open Graph and Twitter card for one page in one language */
export async function pageMetadata(requestedLocale: string, path: string, page: PageKey): Promise<Metadata> {
  const locale = hasLocale(routing.locales, requestedLocale) ? requestedLocale : routing.defaultLocale
  const t = await getTranslations({ locale, namespace: 'Meta' })

  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({ slug: 'site-settings' })

  const title = t(`${page}Title` as const)
  const description = t(`${page}Description` as const)
  const url = localized(locale, path)
  const image = { url: `/${locale}/og`, width: 1200, height: 630, alt: settings.businessName ?? title }

  return {
    title,
    description,
    alternates: {
      canonical: url,
      // Tells Google the FR and EN pages are the same page in two languages
      languages: {
        ...Object.fromEntries(routing.locales.map((l) => [l, localized(l, path)])),
        'x-default': localized(routing.defaultLocale, path),
      },
    },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: settings.businessName ?? undefined,
      locale: OG_LOCALE[locale],
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image.url],
    },
  }
}