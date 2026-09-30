'use server'

import { after } from 'next/server'
import { getPayload, ValidationError } from 'payload'
import config from '@payload-config'
import { z } from 'zod'
import { getAvailability } from '@/lib/getAvailability'
import { sendBookingEmails } from '@/lib/sendBookingEmails'
import { BUSINESS_TIMEZONE, timeInZone } from '@/lib/time'

// Called from the booking page to get free times for a service + date
export async function fetchSlots(serviceSlug: string, date: string) {
  return getAvailability(serviceSlug, date)
}

const BookingInput = z.object({
  serviceSlug: z.string().min(1),
  start: z.iso.datetime(),
  name: z.string().trim().min(2).max(100),
  email: z.email().max(200),
  phone: z.string().trim().max(30),
  locale: z.enum(['fr', 'en']),
  website: z.string().max(0), // honeypot: humans never see or fill this field
})

export type BookingField = 'name' | 'email' | 'phone'

export type BookingResult =
  | { ok: true; time: string | null }
  | { ok: false; error: 'invalid' | 'slotTaken' | 'generic'; fields?: BookingField[] }

const FIELDS: BookingField[] = ['name', 'email', 'phone']

// Postgres refused the insert because the slotKey already exists
function isSlotTaken(err: unknown): boolean {
  if (err instanceof ValidationError) return err.data.errors.some((e) => e.path === 'slotKey')
  const e = err as { code?: string; cause?: { code?: string } } | null
  return e?.code === '23505' || e?.cause?.code === '23505'
}

export async function createBooking(input: unknown): Promise<BookingResult> {
  // 1. Validate everything that comes from the browser
  const parsed = BookingInput.safeParse(input)
  if (!parsed.success) {
    const paths = parsed.error.issues.map((i) => String(i.path[0]))
    if (paths.includes('website')) return { ok: true, time: null } // bot: pretend it worked, save nothing
    const fields = FIELDS.filter((f) => paths.includes(f))
    return { ok: false, error: fields.length ? 'invalid' : 'generic', fields }
  }
  const { serviceSlug, start, name, email, phone, locale } = parsed.data
  const startIso = new Date(start).toISOString()

  try {
    const payload = await getPayload({ config })

    const { docs } = await payload.find({
      collection: 'services',
      where: { and: [{ slug: { equals: serviceSlug } }, { active: { equals: true } }] },
      limit: 1,
      depth: 0,
    })
    const service = docs[0]
    if (!service) return { ok: false, error: 'generic' }

    // 2. Is this still a real, free slot? (also rejects past, closed and made-up times)
    const day = new Intl.DateTimeFormat('en-CA', { timeZone: BUSINESS_TIMEZONE }).format(new Date(startIso))
    const slot = (await getAvailability(serviceSlug, day)).find((s) => s.start === startIso)
    if (!slot) return { ok: false, error: 'slotTaken' }

    const endIso = new Date(new Date(startIso).getTime() + service.durationMinutes * 60_000).toISOString()

    // 3. Try each free resource. If Postgres says "taken" (someone was faster), try the next one.
    for (const resourceId of slot.resourceIds) {
      try {
        const booking = await payload.create({
          collection: 'bookings',
          data: {
            service: service.id,
            resource: resourceId as number,
            startTime: startIso,
            endTime: endIso, // recalculated by the collection hook
            slotKey: `${resourceId}_${startIso}`, // recalculated by the collection hook
            customerName: name,
            customerEmail: email,
            customerPhone: phone || undefined,
            locale,
            status: 'confirmed',
          },
        })

        // 4. Emails go out after the response: the client never waits for them
        after(() => sendBookingEmails(booking.id))

        return { ok: true, time: timeInZone(new Date(startIso)) }
      } catch (err) {
        if (isSlotTaken(err)) continue
        throw err
      }
    }

    return { ok: false, error: 'slotTaken' }
  } catch (err) {
    console.error('createBooking failed', err)
    return { ok: false, error: 'generic' }
  }
}