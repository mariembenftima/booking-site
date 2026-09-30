import { timeInZone, zonedToUtc } from './time'

export type ID = number | string
export type Period = { opens: string; closes: string }
export type BusyInterval = { resourceId: ID; start: Date; end: Date }
export type Slot = {
  start: string // UTC ISO string: safe to send to the browser
  time: string // "HH:MM" in the business time zone, for display
  resourceIds: ID[] // who is free for this slot
}

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

const toHHMM = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

export function computeSlots(input: {
  date: string // "YYYY-MM-DD" in the business time zone
  periods: Period[] // opening periods for that weekday
  isClosed: boolean // closed date (holiday)
  intervalMinutes: number // a booking can start every X minutes
  durationMinutes: number // length of the chosen service
  resourceIds: ID[] // resources that offer this service
  busy: BusyInterval[] // existing confirmed bookings
  now: Date
  timeZone: string
}): Slot[] {
  const { date, periods, isClosed, intervalMinutes, durationMinutes, resourceIds, busy, now, timeZone } = input
  if (isClosed || resourceIds.length === 0 || intervalMinutes <= 0) return []

  const slots: Slot[] = []
  const sorted = [...periods].sort((a, b) => toMinutes(a.opens) - toMinutes(b.opens))

  for (const period of sorted) {
    const open = toMinutes(period.opens)
    const close = toMinutes(period.closes)

    // The whole service must fit before closing
    for (let t = open; t + durationMinutes <= close; t += intervalMinutes) {
      const start = zonedToUtc(date, toHHMM(t), timeZone)
      const end = new Date(start.getTime() + durationMinutes * 60_000)
      if (start <= now) continue // no bookings in the past

      // Free = no existing booking overlaps [start, end) for that resource
      const free = resourceIds.filter(
        (id) =>
          !busy.some((b) => String(b.resourceId) === String(id) && b.start < end && start < b.end),
      )

      if (free.length > 0) {
        slots.push({ start: start.toISOString(), time: timeInZone(start, timeZone), resourceIds: free })
      }
    }
  }

  return slots
}