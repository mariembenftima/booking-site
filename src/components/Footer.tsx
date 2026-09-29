import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

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
    <footer className="bg-foreground text-background">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2">
        <div>
          {/* TODO Week 2: business name comes from Payload SiteSettings */}
          <p className="font-heading text-3xl font-semibold">Maison Sauge</p>
          <p className="mt-2 text-background/70">{t('tagline')}</p>
        </div>

        <nav aria-label={t('explore')} className="md:justify-self-end">
          <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-background/60">
            {t('explore')}
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-background/80 transition-colors hover:text-background">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-background/15">
        <p className="mx-auto max-w-6xl px-6 py-6 text-sm text-background/60">
          {t('rights', { year })}
        </p>
      </div>
    </footer>
  )
}