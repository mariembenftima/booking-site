import type { CollectionConfig } from 'payload'

const idOf = (value: unknown): number | string | undefined => {
  if (value && typeof value === 'object' && 'id' in value) return (value as { id: number | string }).id
  if (typeof value === 'number' || typeof value === 'string') return value
  return undefined
}

export const Bookings: CollectionConfig = {
  slug: 'bookings',
  defaultSort: '-startTime',
  admin: {
    useAsTitle: 'customerName',
    defaultColumns: ['startTime', 'customerName', 'service', 'resource', 'status'],
  },
  access: {
    // Private: only the logged-in owner. The website creates bookings through a Server Action (Week 3, Day 4).
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'service', type: 'relationship', relationTo: 'services', required: true },
    { name: 'resource', type: 'relationship', relationTo: 'resources', required: true },
    {
      name: 'startTime',
      type: 'date',
      required: true,
      index: true, // stored in UTC
      admin: { date: { pickerAppearance: 'dayAndTime', timeIntervals: 15 } },
    },
    {
      name: 'endTime',
      type: 'date',
      required: true,
      admin: {
        readOnly: true,
        description: 'Calculated automatically from the service duration.',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    { name: 'customerName', type: 'text', required: true },
    { name: 'customerEmail', type: 'email', required: true },
    { name: 'customerPhone', type: 'text' },
    {
      name: 'locale',
      type: 'select',
      defaultValue: 'fr',
      options: [
        { label: 'Français', value: 'fr' },
        { label: 'English', value: 'en' },
      ],
      admin: { description: 'Language for the confirmation email.' },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'confirmed',
      options: [
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
    { name: 'notes', type: 'textarea' },
    {
      // e.g. "3_2026-10-07T09:00:00.000Z": the database refuses duplicates
      name: 'slotKey',
      type: 'text',
      unique: true,
      required: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Automatic. Prevents two bookings on the same slot.',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, originalDoc, req }) => {
        if (!data) return data
        const merged = { ...originalDoc, ...data }

        const serviceId = idOf(merged.service)
        const resourceId = idOf(merged.resource)
        const start = merged.startTime ? new Date(merged.startTime) : null

        // endTime = start + service duration
        if (start && serviceId !== undefined) {
          const service = await req.payload.findByID({
            collection: 'services',
            id: serviceId,
            depth: 0,
            req,
          })
          data.endTime = new Date(start.getTime() + service.durationMinutes * 60_000).toISOString()
        }

        // slotKey: unique per resource + start. Cancelling frees the slot.
        if (merged.status === 'cancelled') {
          data.slotKey = `cancelled-${originalDoc?.id ?? 'new'}-${Date.now()}`
        } else if (start && resourceId !== undefined) {
          data.slotKey = `${resourceId}_${start.toISOString()}`
        }

        return data
      },
    ],
  },
}