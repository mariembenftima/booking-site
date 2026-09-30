import { getPayload } from 'payload'
import config from '@payload-config'
import { computeSlots, type ID, type Slot } from './availability'
import { BUSINESS_TIMEZONE, weekdayOf, zonedToUtc } from './time'

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const idOf = (value: unknown): ID => {
  if (value && typeof value === 'object' && 'id' in value) return (value as { id: ID }).id
  return value as ID
}

/** Calendar date ("YYYY-MM-DD") of a moment, in the business time zone */
const dateInZone = (value: string | Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: BUSINESS_TIMEZONE }).format(new Date(value))

/** The day after a "YYYY-MM-DD" date */
const nextDay = (date: string) => {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10)
}

export async function getAvailability(serviceSlug: string, date: string): Promise<Slot[]> {
  if (!DATE_PATTERN.test(date)) return []
  const payload = await getPayload({ config })

  // 1. The service (must exist and be active)
  const { docs } = await payload.find({
    collection: 'services',
    where: { and: [{ slug: { equals: serviceSlug } }, { active: { equals: true } }] },
    limit: 1,
    depth: 0,
  })
  const service = docs[0]
  if (!service) return []

  // 2. Opening hours + the active resources that offer this service
  const [hours, resources] = await Promise.all([
    payload.findGlobal({ slug: 'business-hours', depth: 0 }),
    payload.find({
      collection: 'resources',
      where: { and: [{ active: { equals: true } }, { services: { in: [service.id] } }] },
      limit: 100,
      depth: 0,
    }),
  ])
  const resourceIds = resources.docs.map((r) => r.id)
  if (resourceIds.length === 0) return []

  // 3. Existing confirmed bookings of those resources that touch this day
  const dayStart = zonedToUtc(date, '00:00')
  const dayEnd = zonedToUtc(nextDay(date), '00:00')
  const bookings = await payload.find({
    collection: 'bookings',
    where: {
      and: [
        { status: { equals: 'confirmed' } },
        { resource: { in: resourceIds } },
        { startTime: { less_than: dayEnd.toISOString() } },
        { endTime: { greater_than: dayStart.toISOString() } },
      ],
    },
    limit: 500,
    depth: 0,
  })

  // 4. Hand everything to the pure logic
  const weekday = String(weekdayOf(date))
  return computeSlots({
    date,
    periods: (hours.weeklyHours ?? []).filter((row) => row.weekday === weekday),
    isClosed: (hours.closedDates ?? []).some((c) => dateInZone(c.date) === date),
    intervalMinutes: hours.slotIntervalMinutes,
    durationMinutes: service.durationMinutes,
    resourceIds,
    busy: bookings.docs.map((b) => ({
      resourceId: idOf(b.resource),
      start: new Date(b.startTime),
      end: new Date(b.endTime),
    })),
    now: new Date(),
    timeZone: BUSINESS_TIMEZONE,
  })
}