import { computeSlots } from './availability'
import { zonedToUtc } from './time'

const TZ = 'Africa/Tunis'
const DAY = '2026-10-07'
const at = (time: string) => zonedToUtc(DAY, time, TZ)
const longAgo = new Date('2000-01-01T00:00:00Z')

const base = {
  date: DAY,
  periods: [{ opens: '09:00', closes: '12:00' }],
  isClosed: false,
  intervalMinutes: 30,
  durationMinutes: 60,
  resourceIds: ['A'],
  busy: [],
  now: longAgo,
  timeZone: TZ,
}

const times = (slots: { time: string }[]) => slots.map((s) => s.time).join(' ')

// First slot of a day as "local time + UTC moment"
const firstSlot = (date: string, timeZone: string) => {
  const slot = computeSlots({ ...base, date, timeZone, periods: [{ opens: '09:00', closes: '10:00' }] })[0]
  return slot ? `${slot.time} ${slot.start}` : ''
}

const cases: [string, string, string][] = [
  ['Empty day: service must fit before 12:00', times(computeSlots(base)), '09:00 09:30 10:00 10:30 11:00'],
  [
    'Booking 10:00–11:00 blocks overlapping starts',
    times(computeSlots({ ...base, busy: [{ resourceId: 'A', start: at('10:00'), end: at('11:00') }] })),
    '09:00 11:00',
  ],
  [
    'Second resource free → slots stay open',
    times(
      computeSlots({
        ...base,
        resourceIds: ['A', 'B'],
        busy: [{ resourceId: 'A', start: at('10:00'), end: at('11:00') }],
      }),
    ),
    '09:00 09:30 10:00 10:30 11:00',
  ],
  ['Holiday → no slots', times(computeSlots({ ...base, isClosed: true })), ''],
  ['Past times hidden (now = 10:15)', times(computeSlots({ ...base, now: at('10:15') })), '10:30 11:00'],
  [
    'Lunch break: two periods',
    times(
      computeSlots({
        ...base,
        periods: [
          { opens: '14:00', closes: '16:00' },
          { opens: '09:00', closes: '11:00' },
        ],
      }),
    ),
    '09:00 09:30 10:00 14:00 14:30 15:00',
  ],
  // Daylight saving: Paris switches to summer time on 29 March and back on 25 October 2026
  ['DST spring day (Paris, UTC+2)', firstSlot('2026-03-29', 'Europe/Paris'), '09:00 2026-03-29T07:00:00.000Z'],
  ['DST autumn day (Paris, UTC+1)', firstSlot('2026-10-25', 'Europe/Paris'), '09:00 2026-10-25T08:00:00.000Z'],
]

for (const [name, got, expected] of cases) {
  console.log(got === expected ? '✅' : '❌', name, got === expected ? '' : `\n   got:      "${got}"\n   expected: "${expected}"`)
}