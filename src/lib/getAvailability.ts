import { getPayload } from 'payload'
import config from '@payload-config'
import { computeSlots, type ID, type Slot } from './availability'
import { BUSINESS_TIMEZONE, todayInZone, weekdayOf, zonedToUtc } from './time'

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

// The calendar shows 3 whole months ahead, so up to ~4 months of days can be clicked
export const MAX_DAYS_AHEAD = 124

const idOf = (value: unknown): ID => {
  if (value && typeof value === 'object' && 'id' in value) return (value as { id: ID }).id
  return value as ID
}

/** Calendar date ("YYYY-MM-DD") of a moment, in the business time zone */
const dateInZone = (value: string | Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: BUSINESS_TIMEZONE }).format(new Date(value))

/** "YYYY-MM-DD" + n days */
const addDays = (date: string, n: number) => {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10)
}

export async function getAvailability(serviceSlug: string, date: string): Promise<Slot[]> {
  if (!DATE_PATTERN.test(date)) return []

  // Booking window: no past days, nothing too far ahead (also protects the server from silly requests)
  const today = todayInZone()
  if (date < today || date > addDays(today, MAX_DAYS_AHEAD)) return []

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
  const dayEnd = zonedToUtc(addDays(date, 1), '00:00')
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