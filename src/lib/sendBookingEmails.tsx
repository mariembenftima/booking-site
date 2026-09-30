import { Resend } from 'resend'
import { getPayload } from 'payload'
import config from '@payload-config'
import {
  ClientConfirmationEmail,
  OwnerNotificationEmail,
  clientSubject,
  ownerSubject,
  type EmailDetails,
  type EmailLang,
} from '@/emails/BookingEmails'
import { BUSINESS_TIMEZONE, timeInZone } from './time'

const OWNER_LANG: EmailLang = 'fr' // the owner reads emails in the site's default language

const dateLabel = (iso: string, lang: EmailLang) =>
  new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: BUSINESS_TIMEZONE,
  }).format(new Date(iso))

/** Sends the client confirmation (in their language) and the owner notification. Never throws. */
export async function sendBookingEmails(bookingId: number | string): Promise<void> {
  try {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.warn('RESEND_API_KEY missing: booking emails skipped')
      return
    }
    const resend = new Resend(apiKey)
    const from = process.env.EMAIL_FROM || 'onboarding@resend.dev'
    const payload = await getPayload({ config })

    // Everything the emails need, with texts in the requested language
    const details = async (lang: EmailLang): Promise<EmailDetails> => {
      const [booking, settings] = await Promise.all([
        payload.findByID({ collection: 'bookings', id: bookingId, depth: 1, locale: lang }),
        payload.findGlobal({ slug: 'site-settings', locale: lang }),
      ])
      const service = typeof booking.service === 'object' ? booking.service : null
      const resource = typeof booking.resource === 'object' ? booking.resource : null
      return {
        lang,
        businessName: settings.businessName ?? '',
        businessAddress: settings.address ?? '',
        businessPhone: settings.phone ?? '',
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone ?? '',
        serviceName: service?.name ?? '',
        resourceName: resource?.name ?? '',
        durationMinutes: service?.durationMinutes ?? 0,
        price: service?.price ?? 0,
        date: dateLabel(booking.startTime, lang),
        time: timeInZone(new Date(booking.startTime)),
      }
    }

    const booking = await payload.findByID({ collection: 'bookings', id: bookingId, depth: 0 })
    const clientLang: EmailLang = booking.locale === 'en' ? 'en' : 'fr'
    const [client, owner, settings] = await Promise.all([
      details(clientLang),
      details(OWNER_LANG),
      payload.findGlobal({ slug: 'site-settings' }),
    ])
    const ownerEmail = process.env.OWNER_EMAIL || settings.email || ''

    const results = await Promise.all([
      resend.emails.send({
        from,
        to: client.customerEmail,
        replyTo: settings.email || undefined, // client replies reach the business
        subject: clientSubject(client),
        react: <ClientConfirmationEmail {...client} />,
      }),
      ownerEmail
        ? resend.emails.send({
            from,
            to: ownerEmail,
            replyTo: client.customerEmail, // owner replies reach the client
            subject: ownerSubject(owner),
            react: <OwnerNotificationEmail {...owner} clientLang={clientLang} />,
          })
        : null,
    ])

    for (const result of results) {
      if (result?.error) console.error('Booking email failed:', result.error.message)
    }
  } catch (err) {
    console.error('sendBookingEmails crashed:', err)
  }
}