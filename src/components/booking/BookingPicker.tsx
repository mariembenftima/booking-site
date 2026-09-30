'use client'

import { useRef, useState, useTransition } from 'react'
import { useFormatter, useLocale, useTranslations } from 'next-intl'
import { enUS, fr } from 'react-day-picker/locale'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { Slot } from '@/lib/availability'
import {
  createBooking,
  fetchSlots,
  findNextAvailable,
  type BookingField,
} from '@/app/(frontend)/[locale]/booking/actions'

export type BookingService = {
  slug: string
  name: string
  durationMinutes: number
  price: number
}

// A calendar day picked by the visitor → "YYYY-MM-DD"
const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

// "YYYY-MM-DD" → a local calendar day (for the calendar component)
const fromDateStr = (str: string) => {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// Charter "label" style: Geist, uppercase (font-sans overrides the serif h2 rule)
const labelStyle = 'font-sans text-[13px] font-medium uppercase tracking-[0.08em] text-muted-foreground'

type FormError = 'alreadyBooked' | 'generic' | null

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

  // Steps 1–3
  const [serviceSlug, setServiceSlug] = useState<string>(
    () => services.find((s) => s.slug === initialService)?.slug ?? '',
  )
  const [date, setDate] = useState<Date | undefined>()
  const [month, setMonth] = useState<Date>(() => new Date())
  const [slots, setSlots] = useState<Slot[] | null>(null)
  const [nextDate, setNextDate] = useState<string | null | undefined>(undefined) // undefined = not searched, null = none
  const [selected, setSelected] = useState<string | null>(null)
  const [isLoading, startLoading] = useTransition()
  const requestId = useRef(0) // ignore answers from older requests

  // Step 4
  const [form, setForm] = useState({ name: '', email: '', phone: '', website: '' })
  const [fieldErrors, setFieldErrors] = useState<BookingField[]>([])
  const [slotTaken, setSlotTaken] = useState(false)
  const [formError, setFormError] = useState<FormError>(null)
  const [isSubmitting, startSubmitting] = useTransition()
  const [confirmed, setConfirmed] = useState<{ time: string | null } | null>(null)

  const service = services.find((s) => s.slug === serviceSlug)
  const selectedSlot = slots?.find((s) => s.start === selected)

  function load(slug: string, day: Date | undefined) {
    setSelected(null)
    setNextDate(undefined)
    if (!slug || !day) {
      setSlots(null)
      return
    }
    const id = ++requestId.current
    const dayStr = toDateStr(day)
    startLoading(async () => {
      const result = await fetchSlots(slug, dayStr)
      if (id !== requestId.current) return
      setSlots(result)
      // Fully booked: look for the next day that still has room
      if (result.length === 0) {
        const next = await findNextAvailable(slug, dayStr)
        if (id === requestId.current) setNextDate(next)
      }
    })
  }

  const chooseService = (slug: string) => {
    setServiceSlug(slug)
    setSlotTaken(false)
    setFormError(null)
    load(slug, date)
  }

  const chooseDate = (day: Date | undefined) => {
    setDate(day)
    setSlotTaken(false)
    setFormError(null)
    load(serviceSlug, day)
  }

  const goToDate = (str: string) => {
    const day = fromDateStr(str)
    setMonth(day) // the calendar jumps to that month
    chooseDate(day)
  }

  const chooseSlot = (start: string) => {
    setSelected(start)
    setSlotTaken(false)
    setFormError(null)
  }

  // Past days, closed weekdays and holidays can't be picked
  const isDisabled = (day: Date) => {
    const str = toDateStr(day)
    const weekday = day.getDay() === 0 ? 7 : day.getDay()
    return str < today || !openWeekdays.includes(weekday) || closedDates.includes(str)
  }

  // Show a day safely (noon UTC avoids any time-zone day shift)
  const formatDay = (str: string) =>
    format.dateTime(new Date(`${str}T12:00:00Z`), {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      timeZone: 'UTC',
    })

  const dateLabel = date ? formatDay(toDateStr(date)) : ''

  const lastMonth = new Date()
  lastMonth.setMonth(lastMonth.getMonth() + 3)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!service || !selectedSlot) return
    setFieldErrors([])
    setFormError(null)

    startSubmitting(async () => {
      const result = await createBooking({
        serviceSlug: service.slug,
        start: selectedSlot.start,
        locale,
        ...form,
      })

      if (result.ok) {
        setConfirmed({ time: result.time ?? selectedSlot.time })
      } else if (result.error === 'slotTaken') {
        setSlotTaken(true)
        load(serviceSlug, date) // refresh: the taken time disappears
      } else if (result.error === 'invalid') {
        setFieldErrors(result.fields ?? [])
      } else {
        setFormError(result.error) // 'alreadyBooked' or 'generic'
      }
    })
  }

  function startOver() {
    setConfirmed(null)
    setForm({ name: '', email: '', phone: '', website: '' })
    load(serviceSlug, date)
  }

  // ✓ Confirmation screen
  if (confirmed) {
    return (
      <section className="mt-12 flex flex-col items-start gap-4 rounded-[20px] bg-accent p-8" aria-live="polite">
        <h2 className="text-3xl">{t('successTitle')}</h2>
        <p className="text-lg font-semibold">
          {service?.name} · <span className="capitalize">{dateLabel}</span> · {confirmed.time}
        </p>
        <p className="text-muted-foreground">{t('successText')}</p>
        <Button variant="outline" onClick={startOver}>
          {t('bookAnother')}
        </Button>
      </section>
    )
  }

  const errorFor = (field: BookingField) => fieldErrors.includes(field)

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
              month={month}
              onMonthChange={setMonth}
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
            {slotTaken && <p className="mb-4 text-sm font-medium text-destructive">{t('slotTaken')}</p>}
            {!service ? (
              <p className="text-muted-foreground">{t('pickServiceFirst')}</p>
            ) : !date ? (
              <p className="text-muted-foreground">{t('pickDateFirst')}</p>
            ) : isLoading ? (
              <p className="text-muted-foreground">{t('loading')}</p>
            ) : slots && slots.length === 0 ? (
              <div className="flex flex-col items-start gap-3">
                <p className="text-muted-foreground">{t('noSlots')}</p>
                {nextDate ? (
                  <Button variant="outline" onClick={() => goToDate(nextDate)}>
                    <span className="first-letter:uppercase">
                      {t('nextAvailable', { date: formatDay(nextDate) })}
                    </span>
                  </Button>
                ) : nextDate === null ? (
                  <p className="text-sm text-muted-foreground">{t('noAvailability')}</p>
                ) : null}
              </div>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {slots?.map((slot) => {
                  const active = slot.start === selected
                  return (
                    <li key={slot.start}>
                      <button
                        type="button"
                        onClick={() => chooseSlot(slot.start)}
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

      {/* 4. Details + confirm */}
      {service && date && selectedSlot && (
        <section className="rounded-[20px] bg-accent p-6 md:p-8">
          <p className={labelStyle}>{t('summary')}</p>
          <p className="mt-1 text-lg font-semibold">
            {service.name} · <span className="capitalize">{dateLabel}</span> · {selectedSlot.time}
          </p>

          <form onSubmit={submit} noValidate className="mt-6 grid gap-4 md:grid-cols-3">
            <h2 className={cn(labelStyle, 'md:col-span-3')}>{t('step4')}</h2>

            <div className="flex flex-col gap-2">
              <Label htmlFor="name">{t('name')}</Label>
              <Input
                id="name"
                autoComplete="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                aria-invalid={errorFor('name')}
                className="bg-card"
              />
              {errorFor('name') && <p className="text-sm text-destructive">{t('errorName')}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                aria-invalid={errorFor('email')}
                className="bg-card"
              />
              {errorFor('email') && <p className="text-sm text-destructive">{t('errorEmail')}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">{t('phone')}</Label>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                aria-invalid={errorFor('phone')}
                className="bg-card"
              />
              {errorFor('phone') && <p className="text-sm text-destructive">{t('errorPhone')}</p>}
            </div>

            {/* Honeypot: hidden from humans and screen readers, bots fill it */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label htmlFor="website">Website</label>
              <input
                id="website"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />
            </div>

            <div className="flex flex-col items-start gap-2 md:col-span-3">
              {formError && (
                <p className="text-sm font-medium text-destructive">
                  {formError === 'alreadyBooked' ? t('alreadyBooked') : t('errorGeneric')}
                </p>
              )}
              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? t('sending') : t('confirm')}
              </Button>
            </div>
          </form>
        </section>
      )}
    </div>
  )
}