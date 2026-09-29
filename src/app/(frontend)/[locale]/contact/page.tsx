import { getFormatter, getTranslations } from 'next-intl/server'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'

// Placeholder data: replaced by Payload SiteSettings + BusinessHours in Week 2
const CONTACT = {
  address: '12 rue des Jasmins, La Marsa, Tunis',
  phone: '+216 71 000 000',
  email: 'bonjour@maisonsauge.tn',
}

// weekday: 1 = Monday … 7 = Sunday. null = closed
const HOURS: { weekday: number; open: string | null; close: string | null }[] = [
  { weekday: 1, open: null, close: null },
  { weekday: 2, open: '09:00', close: '19:00' },
  { weekday: 3, open: '09:00', close: '19:00' },
  { weekday: 4, open: '09:00', close: '19:00' },
  { weekday: 5, open: '09:00', close: '19:00' },
  { weekday: 6, open: '09:00', close: '19:00' },
  { weekday: 7, open: '10:00', close: '16:00' },
]

export default async function ContactPage() {
  const t = await getTranslations('Contact')
  const format = await getFormatter()

  // 1 Jan 2024 was a Monday, so day N of Jan 2024 = weekday N. Gives the day name in the right language.
  const dayName = (weekday: number) =>
    format.dateTime(new Date(2024, 0, weekday), { weekday: 'long' })

  const details = [
    { icon: MapPin, label: t('address'), value: CONTACT.address, href: null },
    { icon: Phone, label: t('phone'), value: CONTACT.phone, href: `tel:${CONTACT.phone.replace(/\s/g, '')}` },
    { icon: Mail, label: t('email'), value: CONTACT.email, href: `mailto:${CONTACT.email}` },
  ]

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
                  <p className="font-medium">{value}</p>
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
            {HOURS.map((day) => (
              <div key={day.weekday} className="flex justify-between py-3 text-sm">
                <dt className="capitalize">{dayName(day.weekday)}</dt>
                <dd className={day.open ? 'font-medium' : 'text-muted-foreground'}>
                  {day.open ? `${day.open} – ${day.close}` : t('closed')}
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