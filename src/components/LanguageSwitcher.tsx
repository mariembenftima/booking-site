'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { FlagFR, FlagUS } from '@/components/flags'

export function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  const nextLocale = locale === 'fr' ? 'en' : 'fr'
  const label = nextLocale === 'en' ? 'Switch to English' : 'Passer en français'

  return (
    <Button
      variant="outline"
      size="sm"
      aria-label={label}
      title={label}
      onClick={() => router.replace(pathname, { locale: nextLocale })}
    >
      {locale === 'en' ? <FlagUS /> : <FlagFR />}
      <span>{locale.toUpperCase()}</span>
    </Button>
  )
}
