// Time-zone helpers. Rule: store UTC, show business local time.
export const BUSINESS_TIMEZONE = process.env.BUSINESS_TIMEZONE || 'Africa/Tunis'

// How many minutes the time zone is ahead of UTC at a given moment (handles daylight saving)
function offsetMinutes(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'))
  return Math.round((asUtc - date.getTime()) / 60_000)
}

/** "2026-10-07" + "09:00" in the business time zone → the exact UTC moment */
export function zonedToUtc(dateStr: string, time: string, timeZone = BUSINESS_TIMEZONE): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  const naive = Date.UTC(y, m - 1, d, hh, mm)
  const first = offsetMinutes(new Date(naive), timeZone)
  const result = naive - first * 60_000
  // Re-check once: near a daylight-saving switch the offset can differ
  const second = offsetMinutes(new Date(result), timeZone)
  return new Date(second === first ? result : naive - second * 60_000)
}

/** Weekday of a calendar date: 1 = Monday … 7 = Sunday (same numbering as Business hours) */
export function weekdayOf(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number)
  const js = new Date(Date.UTC(y, m - 1, d)).getUTCDay() // 0 = Sunday
  return js === 0 ? 7 : js
}

/** Today's date in the business time zone, as "YYYY-MM-DD" */
export function todayInZone(timeZone = BUSINESS_TIMEZONE): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone }).format(new Date())
}

/** A UTC moment shown as "HH:MM" in the business time zone */
export function timeInZone(date: Date, timeZone = BUSINESS_TIMEZONE): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date)
}