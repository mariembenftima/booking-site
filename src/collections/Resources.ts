import type { CollectionConfig } from 'payload'

export const Resources: CollectionConfig = {
  slug: 'resources',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'kind', 'active'],
    description: 'Who or what a booking is with: a staff member, a court, a room…',
  },
  access: {
    read: () => true, // public: the website can show the team
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'kind',
      type: 'select',
      required: true,
      defaultValue: 'person',
      options: [
        { label: 'Person (staff member, practitioner…)', value: 'person' },
        { label: 'Place (court, room…)', value: 'place' },
      ],
    },
    {
      name: 'name',
      type: 'text',
      required: true, // a person's name is the same in every language
    },
    {
      name: 'role',
      type: 'text',
      localized: true,
      admin: { description: 'Short subtitle, e.g. "Esthéticienne" / "Beautician" or "Terrain couvert" / "Indoor court".' },
    },
    {
      name: 'bio',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'services',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
      admin: { description: 'Which services can be booked with this resource.' },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Uncheck to hide and stop bookings (e.g. holidays, maintenance).' },
    },
  ],
}