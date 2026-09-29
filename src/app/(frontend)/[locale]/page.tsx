import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/ui/button'

export default async function HomePage() {
  const t = await getTranslations('Home')

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">{t('title')}</h1>
      <Button>Test</Button>
    </main>
  )
}
