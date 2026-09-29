import type { CollectionConfig } from 'payload'

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'durationMinutes', 'price', 'active'],
  },
  access: {
    read: () => true, // public: the website shows services
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true, // one version per language
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'Used in links, e.g. relaxing-massage (lowercase letters, numbers, dashes).' },
      validate: (value: string | null | undefined) => {
        if (!value) return 'Required'
        if (!SLUG_PATTERN.test(value)) return 'Use lowercase letters, numbers and dashes only'
        return true
      },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'durationMinutes',
      type: 'number',
      required: true,
      min: 5,
      admin: { step: 5, description: 'Length of the appointment in minutes.' },
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
      admin: { description: 'Price in DT.' },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Uncheck to hide this service from the website.' },
    },
  ],
}