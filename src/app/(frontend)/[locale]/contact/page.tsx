import { hasLocale } from 'next-intl'
import { getFormatter, getLocale, getTranslations } from 'next-intl/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { Button } from '@/components/ui/button'

export default async function ContactPage() {
  const requested = await getLocale()
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale
  const t = await getTranslations('Contact')
  const format = await getFormatter()

  // Real data from Payload: Settings → Site settings + Business hours
  const payload = await getPayload({ config })
  const [settings, hours] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings', locale }),
    payload.findGlobal({ slug: 'business-hours', locale }),
  ])

  // 1 Jan 2024 was a Monday, so day N of Jan 2024 = weekday N. Gives the day name in the right language.
  const dayName = (weekday: number) =>
    format.dateTime(new Date(2024, 0, weekday), { weekday: 'long' })

  // Group opening periods by weekday (two rows on one day = lunch break)
  const week = [1, 2, 3, 4, 5, 6, 7].map((weekday) => {
    const periods = (hours.weeklyHours ?? [])
      .filter((row) => row.weekday === String(weekday))
      .sort((a, b) => a.opens.localeCompare(b.opens))
      .map((row) => `${row.opens} – ${row.closes}`)
    return { weekday, periods }
  })

  const details = [
    settings.address && { icon: MapPin, label: t('address'), value: settings.address, href: null },
    settings.phone && {
      icon: Phone,
      label: t('phone'),
      value: settings.phone,
      href: `tel:${settings.phone.replace(/\s/g, '')}`,
    },
    settings.email && { icon: Mail, label: t('email'), value: settings.email, href: `mailto:${settings.email}` },
  ].filter((item) => Boolean(item)) as {
    icon: typeof MapPin
    label: string
    value: string
    href: string | null
  }[]

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

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {/* Contact details */}
        <ul className="flex flex-col gap-4">
          {details.map(({ icon: Icon, label, value, href }) => (
            <li key={label} className="flex items-start gap-4 rounded-lg border border-border bg-card p-6">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
                <Icon className="size-5" strokeWidth={1.5} aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                {href ? (
                  <a href={href} className="font-medium transition-colors hover:text-primary">
                    {value}
                  </a>
                ) : (
                  <p className="whitespace-pre-line font-medium">{value}</p>
                )}
              </div>
            </li>
          ))}
        </ul>

        {/* Opening hours */}
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="flex items-center gap-2 font-sans text-xl">
            <Clock className="size-5 text-primary" strokeWidth={1.5} aria-hidden="true" />
            {t('hours')}
          </h2>
          <dl className="mt-4 divide-y divide-border">
            {week.map((day) => (
              <div key={day.weekday} className="flex justify-between gap-4 py-3 text-sm">
                <dt className="capitalize">{dayName(day.weekday)}</dt>
                <dd className={day.periods.length ? 'text-right font-medium' : 'text-muted-foreground'}>
                  {day.periods.length ? day.periods.join(', ') : t('closed')}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      {/* Call to action: the one sage button on this page */}
      <section className="mt-16 flex flex-col items-center gap-6 rounded-[20px] bg-accent px-6 py-12 text-center">
        <h2 className="text-3xl">{t('ctaTitle')}</h2>
        <Button asChild size="lg">
          <Link href="/booking">{t('cta')}</Link>
        </Button>
      </section>
    </main>
  )
}