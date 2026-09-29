import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/ui/button'

export default async function HomePage() {
  const t = await getTranslations('Home')

  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-4xl font-bold">{t('title')}</h1>
      <p className="max-w-md text-muted-foreground">{t('subtitle')}</p>
      <Button size="lg">{t('cta')}</Button>
    </main>
  )
}