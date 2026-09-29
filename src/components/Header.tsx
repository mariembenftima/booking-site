import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export async function Header() {
  const t = await getTranslations('Nav')

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        {/* TODO Week 2: business name comes from Payload SiteSettings */}
        <Link href="/" className="font-heading text-2xl font-semibold">
          Maison Sauge
        </Link>

        <nav className="hidden items-center gap-8 text-sm md:flex">
          <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">
            {t('home')}
          </Link>
          <Link href="/services" className="text-muted-foreground transition-colors hover:text-foreground">
            {t('services')}
          </Link>
          <Link href="/contact" className="text-muted-foreground transition-colors hover:text-foreground">
            {t('contact')}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Button asChild variant="outline" size="sm">
            <Link href="/booking">{t('book')}</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}