import { hasLocale } from 'next-intl'
import { getLocale, getTranslations } from 'next-intl/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { routing } from '@/i18n/routing'
import { BUSINESS_TIMEZONE, todayInZone } from '@/lib/time'
import { BookingPicker } from '@/components/booking/BookingPicker'
import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(locale, '/booking', 'booking')
}
export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const initialService = typeof params.service === 'string' ? params.service : undefined

  const requested = await getLocale()
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale
  const t = await getTranslations('Booking')

  const payload = await getPayload({ config })
  const [services, hours] = await Promise.all([
    payload.find({
      collection: 'services',
      locale,
      where: { active: { equals: true } },
      sort: 'name',
      depth: 0,
      limit: 100,
    }),
    payload.findGlobal({ slug: 'business-hours', depth: 0 }),
  ])

  const openWeekdays = [...new Set((hours.weeklyHours ?? []).map((row) => Number(row.weekday)))]
  const closedDates = (hours.closedDates ?? []).map((c) =>
    new Intl.DateTimeFormat('en-CA', { timeZone: BUSINESS_TIMEZONE }).format(new Date(c.date)),
  )

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="max-w-2xl">
        <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          {t('eyebrow')}
        </p>
        <h1 className="mt-3 text-4xl leading-tight md:text-5xl">{t('title')}</h1>
        <p className="mt-4 text-muted-foreground">{t('subtitle')}</p>
      </div>

      <BookingPicker
        services={services.docs.map((s) => ({
          slug: s.slug,
          name: s.name,
          durationMinutes: s.durationMinutes,
          price: s.price,
        }))}
        openWeekdays={openWeekdays}
        closedDates={closedDates}
        today={todayInZone()}
        initialService={initialService}
      />
    </main>
  )
}