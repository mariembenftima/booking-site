'use client'

import { useRef, useState, useTransition } from 'react'
import { useFormatter, useLocale, useTranslations } from 'next-intl'
import { enUS, fr } from 'react-day-picker/locale'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Slot } from '@/lib/availability'
import { fetchSlots } from '@/app/(frontend)/[locale]/booking/actions'

export type BookingService = {
  slug: string
  name: string
  durationMinutes: number
  price: number
}

// A calendar day picked by the visitor → "YYYY-MM-DD"
const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const labelStyle = 'text-[13px] font-medium uppercase tracking-[0.08em] text-muted-foreground'

export function BookingPicker({
  services,
  openWeekdays,
  closedDates,
  today,
  initialService,
}: {
  services: BookingService[]
  openWeekdays: number[] // 1 = Monday … 7 = Sunday
  closedDates: string[] // "YYYY-MM-DD"
  today: string // "YYYY-MM-DD" in the business time zone
  initialService?: string
}) {
  const t = useTranslations('Booking')
  const format = useFormatter()
  const locale = useLocale()

  const [serviceSlug, setServiceSlug] = useState<string>(
    () => services.find((s) => s.slug === initialService)?.slug ?? '',
  )
  const [date, setDate] = useState<Date | undefined>()
  const [slots, setSlots] = useState<Slot[] | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const requestId = useRef(0) // ignore answers from older requests

  const service = services.find((s) => s.slug === serviceSlug)
  const selectedSlot = slots?.find((s) => s.start === selected)

  function load(slug: string, day: Date | undefined) {
    setSelected(null)
    if (!slug || !day) {
      setSlots(null)
      return
    }
    const id = ++requestId.current
    startTransition(async () => {
      const result = await fetchSlots(slug, toDateStr(day))
      if (id === requestId.current) setSlots(result)
    })
  }

  const chooseService = (slug: string) => {
    setServiceSlug(slug)
    load(slug, date)
  }

  const chooseDate = (day: Date | undefined) => {
    setDate(day)
    load(serviceSlug, day)
  }

  // Past days, closed weekdays and holidays can't be picked
  const isDisabled = (day: Date) => {
    const str = toDateStr(day)
    const weekday = day.getDay() === 0 ? 7 : day.getDay()
    return str < today || !openWeekdays.includes(weekday) || closedDates.includes(str)
  }

  // Show the chosen day safely (noon UTC avoids any time-zone day shift)
  const dateLabel = date
    ? format.dateTime(new Date(`${toDateStr(date)}T12:00:00Z`), {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        timeZone: 'UTC',
      })
    : ''

  const lastMonth = new Date()
  lastMonth.setMonth(lastMonth.getMonth() + 3)

  return (
    <div className="mt-12 flex flex-col gap-10">
      {/* 1. Service */}
      <section>
        <h2 className={labelStyle}>{t('step1')}</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => {
            const active = s.slug === serviceSlug
            return (
              <li key={s.slug}>
                <button
                  type="button"
                  onClick={() => chooseService(s.slug)}
                  aria-pressed={active}
                  className={cn(
                    'w-full rounded-lg border bg-card p-4 text-left transition-colors',
                    active ? 'border-sage-strong bg-accent' : 'border-border hover:border-primary/40',
                  )}
                >
                  <span className="block font-semibold">{s.name}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {t('duration', { minutes: s.durationMinutes })} · {t('price', { price: s.price })}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 2. Date */}
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className={labelStyle}>{t('step2')}</h2>
          <div className="mt-4 flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={chooseDate}
              disabled={isDisabled}
              locale={locale === 'fr' ? fr : enUS}
              startMonth={new Date()}
              endMonth={lastMonth}
            />
          </div>
        </section>

        {/* 3. Time */}
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className={labelStyle}>{t('step3')}</h2>
          <div className="mt-4" aria-live="polite">
            {!service ? (
              <p className="text-muted-foreground">{t('pickServiceFirst')}</p>
            ) : !date ? (
              <p className="text-muted-foreground">{t('pickDateFirst')}</p>
            ) : isPending ? (
              <p className="text-muted-foreground">{t('loading')}</p>
            ) : slots && slots.length === 0 ? (
              <p className="text-muted-foreground">{t('noSlots')}</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {slots?.map((slot) => {
                  const active = slot.start === selected
                  return (
                    <li key={slot.start}>
                      <button
                        type="button"
                        onClick={() => setSelected(slot.start)}
                        aria-pressed={active}
                        className={cn(
                          'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                          active ? 'border-sage-strong bg-accent' : 'border-input hover:border-primary',
                        )}
                      >
                        {slot.time}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </section>
      </div>

      {/* Summary */}
      {service && date && selectedSlot && (
        <section className="flex flex-col gap-4 rounded-[20px] bg-accent p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className={labelStyle}>{t('summary')}</p>
            <p className="mt-1 text-lg font-semibold">
              {service.name} · <span className="capitalize">{dateLabel}</span> · {selectedSlot.time}
            </p>
          </div>
          <div className="flex flex-col items-start gap-1 md:items-end">
            <Button size="lg" disabled>
              {t('continue')}
            </Button>
            <span className="text-xs text-muted-foreground">{t('continueSoon')}</span>
          </div>
        </section>
      )}
    </div>
  )
}