import { hasLocale } from 'next-intl'
import { getLocale, getTranslations } from 'next-intl/server'
import { ArrowRight, Clock } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

// Placeholder data: replaced by payload.find({ collection: 'services' }) in Week 2
const SERVICES = [
  {
    id: 'facial',
    name: { fr: 'Soin du visage éclat', en: 'Radiance facial' },
    description: {
      fr: 'Nettoyage, gommage doux et masque hydratant pour une peau lumineuse.',
      en: 'Cleansing, gentle exfoliation and a hydrating mask for glowing skin.',
    },
    durationMinutes: 60,
    price: 90,
  },
  {
    id: 'massage',
    name: { fr: 'Massage relaxant', en: 'Relaxing massage' },
    description: {
      fr: 'Un massage du corps aux huiles chaudes pour relâcher les tensions.',
      en: 'A full-body massage with warm oils to release tension.',
    },
    durationMinutes: 90,
    price: 120,
  },
  {
    id: 'hammam',
    name: { fr: 'Hammam traditionnel', en: 'Traditional hammam' },
    description: {
      fr: 'Bain de vapeur, savon noir et gommage au kessa.',
      en: 'Steam bath, black soap and a kessa-glove scrub.',
    },
    durationMinutes: 60,
    price: 70,
  },
  {
    id: 'haircut',
    name: { fr: 'Coupe & brushing', en: 'Cut & blow-dry' },
    description: {
      fr: 'Une coupe adaptée à votre visage, suivie d’un brushing soigné.',
      en: 'A cut tailored to your face, finished with a careful blow-dry.',
    },
    durationMinutes: 45,
    price: 50,
  },
  {
    id: 'manicure',
    name: { fr: 'Manucure', en: 'Manicure' },
    description: {
      fr: 'Soin des ongles et des cuticules, pose de vernis au choix.',
      en: 'Nail and cuticle care, with the polish of your choice.',
    },
    durationMinutes: 30,
    price: 35,
  },
  {
    id: 'pedicure',
    name: { fr: 'Pédicure spa', en: 'Spa pedicure' },
    description: {
      fr: 'Bain de pieds, gommage et massage pour des pieds tout doux.',
      en: 'Foot soak, scrub and massage for soft, rested feet.',
    },
    durationMinutes: 45,
    price: 45,
  },
] as const

export default async function ServicesPage() {
  const requested = await getLocale()
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale
  const t = await getTranslations('Services')

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

      {/* Service cards */}
      <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((service) => (
          <li
            key={service.id}
            className="group flex flex-col rounded-lg border border-border bg-card p-6 transition-colors duration-300 hover:border-primary/40"
          >
            <h3 className="text-xl font-semibold">{service.name[locale]}</h3>
            <p className="mt-2 flex-1 text-muted-foreground">{service.description[locale]}</p>

            <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="size-4" strokeWidth={1.5} aria-hidden="true" />
                {t('duration', { minutes: service.durationMinutes })}
              </span>
              <span className="font-medium">{t('price', { price: service.price })}</span>
            </div>

            <Link
              href="/booking"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-sage-strong"
            >
              {t('book')}
              <ArrowRight
                className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}