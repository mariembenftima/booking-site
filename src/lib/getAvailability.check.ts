import { getAvailability } from './getAvailability'

// ✏️ Change these to match your LOCAL admin data
const SERVICE_SLUG = 'relaxing-massage'
const DATES = ['2026-10-05', '2026-10-07', '2026-12-25'] // Monday · Wednesday · Christmas

for (const date of DATES) {
  const slots = await getAvailability(SERVICE_SLUG, date)
  console.log(`\n${date}: ${slots.length} free slot(s)`)
  console.log(slots.map((s) => `${s.time} (${s.resourceIds.length} free)`).join('  ') || '—')
}

process.exit(0)