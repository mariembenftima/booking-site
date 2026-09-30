import { getTranslations } from 'next-intl/server'
import { ArrowRight, CalendarCheck, Flower2, Leaf } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(locale, '/', 'home')
}

const LEAF = 'M0 40A40 40 0 0 1 40 0A40 40 0 0 1 0 40Z'

// Decorative composition from the Maison Sauge charter cover: colour blocks + sage leaves
function HeroArt() {
  return (
    <svg
      viewBox="0 0 480 400"
      aria-hidden="true"
      className="w-full max-w-md animate-in fade-in zoom-in-95 duration-1000 motion-reduce:animate-none"
    >
      <rect className="fill-primary" x="24" y="0" width="184" height="360" rx="20" />
      <rect className="fill-accent" x="232" y="152" width="160" height="208" rx="20" />
      <rect className="fill-foreground" x="416" y="72" width="64" height="288" rx="20" />
      <rect className="fill-clay" x="264" y="64" width="56" height="56" rx="28" />
      <g className="fill-accent">
        <path transform="translate(56 184)" d={LEAF} />
        <path transform="translate(136 184)" d={LEAF} />
        <path transform="translate(96 232)" d={LEAF} />
        <path transform="translate(56 280)" d={LEAF} />
        <path transform="translate(136 280)" d={LEAF} />
      </g>
      <g className="fill-primary">
        <path transform="translate(256 296)" d={LEAF} />
        <path transform="translate(304 248)" d={LEAF} />
        <path transform="translate(344 200)" d={LEAF} />
      </g>
    </svg>
  )
}

export default async function HomePage() {
  const t = await getTranslations('Home')

  const features = [
    { icon: Flower2, title: t('calmTitle'), text: t('calmText') },
    { icon: Leaf, title: t('naturalTitle'), text: t('naturalText') },
    { icon: CalendarCheck, title: t('onlineTitle'), text: t('onlineText') },
  ]

  return (
    <main>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 motion-reduce:animate-none">
          <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {t('eyebrow')}
          </p>
          <h1 className="mt-4 text-5xl leading-[1.05] md:text-[3.5rem]">{t('title')}</h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
            {t('subtitle')}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button asChild size="lg">
              <Link href="/booking">{t('cta')}</Link>
            </Button>
            <Link
              href="/services"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-sage-strong"
            >
              {t('secondary')}
              <ArrowRight
                className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>

        <div className="flex justify-center md:justify-end">
          <HeroArt />
        </div>
      </section>

      {/* Why us */}
      <section className="bg-muted">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <h2 className="text-3xl md:text-4xl">{t('whyTitle')}</h2>
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <li key={title} className="rounded-lg border border-border bg-card p-6">
                <span className="flex size-10 items-center justify-center rounded-full bg-accent text-primary">
                  <Icon className="size-5" strokeWidth={1.5} aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-muted-foreground">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}