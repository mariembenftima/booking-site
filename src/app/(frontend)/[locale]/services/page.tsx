import Image from 'next/image'
import { hasLocale } from 'next-intl'
import { getLocale, getTranslations } from 'next-intl/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { ArrowRight, Clock, Leaf } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

export default async function ServicesPage() {
  const requested = await getLocale()
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale
  const t = await getTranslations('Services')

  // Real data: only active services, in the visitor's language (depth 1 = include the image)
  const payload = await getPayload({ config })
  const { docs: services } = await payload.find({
    collection: 'services',
    locale,
    where: { active: { equals: true } },
    sort: 'name',
    depth: 1,
    limit: 100,
  })

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      {/* Page intro */}
      <div className="max-w-2xl">
        <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          {t('eyebrow')}
        </p>
        <h1 className="mt-3 text-4xl leading-tight md:text-5xl">{t('title')}</h1>
        <p className="mt-4 text-muted-foreground">{t('subtitle')}</p>
      </div>

      {services.length === 0 ? (
        <p className="mt-12 rounded-lg border border-border bg-card p-6 text-muted-foreground">
          {t('empty')}
        </p>
      ) : (
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            // image is either a populated Media object, an id, or empty
            const image = service.image && typeof service.image === 'object' ? service.image : null

            return (
              <li
                key={service.id}
                className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors duration-300 hover:border-primary/40"
              >
                {/* Photo (or placeholder) */}
                <div className="relative aspect-[4/3] overflow-hidden bg-accent">
                  {image?.url ? (
                    <Image
                      src={image.url}
                      alt={image.alt ?? ''}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-primary/40">
                      <Leaf className="size-12" strokeWidth={1} aria-hidden="true" />
                    </div>
                  )}
                </div>

                {/* Text */}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl font-semibold">{service.name}</h3>
                  <p className="mt-2 flex-1 text-muted-foreground">{service.description}</p>

                  <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="size-4" strokeWidth={1.5} aria-hidden="true" />
                      {t('duration', { minutes: service.durationMinutes })}
                    </span>
                    <span className="font-medium">{t('price', { price: service.price })}</span>
                  </div>

                  <Link
                    href={{ pathname: '/booking', query: { service: service.slug } }}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-sage-strong"
                  >
                    {t('book')}
                    <ArrowRight
                      className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}