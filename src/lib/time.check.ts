import { timeInZone, weekdayOf, zonedToUtc } from './time'

const cases: [string, string, string][] = [
  // Tunisia: always UTC+1
  ['Tunis 9:00', zonedToUtc('2026-10-07', '09:00', 'Africa/Tunis').toISOString(), '2026-10-07T08:00:00.000Z'],
  // Paris summer time (UTC+2) and winter time (UTC+1): the daylight-saving trap
  ['Paris summer', zonedToUtc('2026-03-30', '09:00', 'Europe/Paris').toISOString(), '2026-03-30T07:00:00.000Z'],
  ['Paris winter', zonedToUtc('2026-10-26', '09:00', 'Europe/Paris').toISOString(), '2026-10-26T08:00:00.000Z'],
  ['Weekday', String(weekdayOf('2026-10-07')), '3'],
  ['Back to local', timeInZone(new Date('2026-10-07T08:00:00.000Z'), 'Africa/Tunis'), '09:00'],
]

for (const [name, got, expected] of cases) {
  console.log(got === expected ? '✅' : '❌', name, got === expected ? '' : `got ${got}, expected ${expected}`)
}