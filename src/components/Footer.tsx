import { getTranslations } from 'next-intl/server'
import { Mail, Phone } from 'lucide-react'
import { Link } from '@/i18n/navigation'

// Placeholder data: replaced by Payload SiteSettings in Week 2
const BUSINESS = {
  name: 'Maison Sauge',
  owner: 'Leïla Mansour',
  phone: '+216 71 000 000',
  email: 'bonjour@maisonsauge.tn',
}

const LEAF = 'M20 180C20 90 90 20 180 20C180 110 110 180 20 180Z'

function DecorativeLeaves() {
  return (
    <svg
      viewBox="0 0 320 320"
      aria-hidden="true"
      className="pointer-events-none absolute -bottom-20 -right-16 size-64 text-primary opacity-40 md:size-80"
    >
      <g transform="translate(100 0)">
        <path d={LEAF} fill="currentColor" />
        <path d="M20 180L130 70" stroke="var(--foreground)" strokeWidth="3" strokeLinecap="round" />
      </g>
      <g transform="translate(20 150) scale(0.55) rotate(-25 100 100)">
        <path d={LEAF} fill="currentColor" />
        <path d="M20 180L130 70" stroke="var(--foreground)" strokeWidth="5" strokeLinecap="round" />
      </g>
    </svg>
  )
}

const linkStyle =
  'relative text-background/80 transition-colors hover:text-background after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-background after:transition-transform after:duration-300 hover:after:scale-x-100'

const labelStyle = 'text-[13px] font-medium uppercase tracking-[0.08em] text-background/60'

export async function Footer() {
  const t = await getTranslations('Footer')
  const nav = await getTranslations('Nav')
  const year = new Date().getFullYear()

  const links = [
    { href: '/', label: nav('home') },
    { href: '/services', label: nav('services') },
    { href: '/contact', label: nav('contact') },
    { href: '/booking', label: nav('book') },
  ]

  return (
    <footer className="relative overflow-hidden bg-foreground text-background">
      {/* Watermark: giant wordmark cut off by the top edge */}
      <p
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -translate-y-[0.22em] select-none whitespace-nowrap text-center font-heading text-[clamp(4rem,14vw,12rem)] font-semibold leading-none text-background/[0.07]"
      >
        {BUSINESS.name}
      </p>

      <DecorativeLeaves />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-6 pb-12 pt-24 md:grid-cols-3 md:pt-32">
        {/* Brand */}
        <div>
          <p className="font-heading text-3xl font-semibold">{BUSINESS.name}</p>
          <p className="mt-2 max-w-xs text-background/70">{t('tagline')}</p>
        </div>

        {/* Contact */}
        <div>
          <p className={labelStyle}>{nav('contact')}</p>
          <p className="mt-4 font-medium">{BUSINESS.owner}</p>
          <p className="text-sm text-background/60">{t('founder')}</p>
          <ul className="mt-4 flex flex-col items-start gap-2">
            <li className="flex items-center gap-2">
              <Phone className="size-4 text-background/60" strokeWidth={1.5} aria-hidden="true" />
              <a href={`tel:${BUSINESS.phone.replace(/\s/g, '')}`} className={linkStyle}>
                {BUSINESS.phone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 text-background/60" strokeWidth={1.5} aria-hidden="true" />
              <a href={`mailto:${BUSINESS.email}`} className={linkStyle}>
                {BUSINESS.email}
              </a>
            </li>
          </ul>
        </div>

        {/* Explore */}
        <nav aria-label={t('explore')} className="md:justify-self-end">
          <p className={labelStyle}>{t('explore')}</p>
          <ul className="mt-4 flex flex-col items-start gap-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkStyle}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="relative border-t border-background/15">
        <p className="mx-auto max-w-6xl px-6 py-6 text-sm text-background/60">
          {t('rights', { year })}
        </p>
      </div>
    </footer>
  )
}