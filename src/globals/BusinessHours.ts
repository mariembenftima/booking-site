import type { GlobalConfig } from 'payload'

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

const validateTime = (value: string | null | undefined) => {
  if (!value) return 'Required'
  if (!TIME_PATTERN.test(value)) return 'Use 24h format HH:MM, e.g. 09:00'
  return true
}

const WEEKDAYS = [
  { label: 'Monday', value: '1' },
  { label: 'Tuesday', value: '2' },
  { label: 'Wednesday', value: '3' },
  { label: 'Thursday', value: '4' },
  { label: 'Friday', value: '5' },
  { label: 'Saturday', value: '6' },
  { label: 'Sunday', value: '7' },
]

export const BusinessHours: GlobalConfig = {
  slug: 'business-hours',
  label: 'Business hours',
  admin: { group: 'Settings' },
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'slotIntervalMinutes',
      type: 'number',
      required: true,
      defaultValue: 30,
      min: 5,
      admin: {
        step: 5,
        description: 'A booking can start every X minutes (30 → 9:00, 9:30, 10:00…).',
      },
    },
    {
      name: 'weeklyHours',
      type: 'array',
      admin: {
        description:
          'One row per opening period. Days with no row are closed. Two rows on the same day = a lunch break.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'weekday', type: 'select', required: true, options: WEEKDAYS },
            { name: 'opens', type: 'text', required: true, validate: validateTime, admin: { placeholder: '09:00' } },
            { name: 'closes', type: 'text', required: true, validate: validateTime, admin: { placeholder: '19:00' } },
          ],
        },
      ],
    },
    {
      name: 'closedDates',
      type: 'array',
      admin: { description: 'Holidays and exceptional closures.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'date', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayOnly' } } },
            { name: 'reason', type: 'text', localized: true },
          ],
        },
      ],
    },
  ],
}