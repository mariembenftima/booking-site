import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from '@react-email/components'

export type EmailLang = 'fr' | 'en'

export type EmailDetails = {
  lang: EmailLang
  businessName: string
  businessAddress: string
  businessPhone: string
  customerName: string
  customerEmail: string
  customerPhone: string
  serviceName: string
  resourceName: string
  durationMinutes: number
  price: number
  date: string // already formatted, e.g. "mercredi 7 octobre"
  time: string // "10:00"
}

const COPY = {
  fr: {
    preview: 'Votre rendez-vous est confirmé',
    hello: (name: string) => `Bonjour ${name},`,
    intro: 'Votre rendez-vous est confirmé. Voici le récapitulatif :',
    service: 'Soin',
    date: 'Date',
    time: 'Heure',
    with: 'Avec',
    duration: 'Durée',
    price: 'Prix',
    address: 'Adresse',
    change: 'Pour modifier ou annuler, répondez simplement à cet e-mail ou appelez-nous.',
    seeYou: 'À très bientôt,',
    newBooking: 'Nouvelle réservation',
    client: 'Client',
    email: 'E-mail',
    phone: 'Téléphone',
    language: 'Langue',
    ownerTip: 'Répondez à cet e-mail pour écrire directement au client.',
  },
  en: {
    preview: 'Your appointment is confirmed',
    hello: (name: string) => `Hello ${name},`,
    intro: 'Your appointment is confirmed. Here is a summary:',
    service: 'Treatment',
    date: 'Date',
    time: 'Time',
    with: 'With',
    duration: 'Duration',
    price: 'Price',
    address: 'Address',
    change: 'To change or cancel, simply reply to this email or give us a call.',
    seeYou: 'See you soon,',
    newBooking: 'New booking',
    client: 'Client',
    email: 'Email',
    phone: 'Phone',
    language: 'Language',
    ownerTip: 'Reply to this email to write directly to the client.',
  },
} as const

// Maison Sauge charter colours (emails need inline styles)
const color = { surface: '#FBF8F4', card: '#FFFFFF', ink: '#2A2420', muted: '#6B5F57', sage: '#4F6B5A', line: '#E4DBD1' }
const font = "Geist, 'Segoe UI', Helvetica, Arial, sans-serif"
const serif = "'Cormorant Garamond', Georgia, 'Times New Roman', serif"

const styles = {
  body: { backgroundColor: color.surface, fontFamily: font, color: color.ink, margin: 0, padding: '32px 0' },
  container: {
    backgroundColor: color.card,
    border: `1px solid ${color.line}`,
    borderRadius: 12,
    padding: 32,
    maxWidth: 520,
  },
  brand: { fontFamily: serif, fontSize: 28, fontWeight: 600, color: color.ink, margin: '0 0 24px' },
  heading: { fontFamily: serif, fontSize: 26, fontWeight: 600, color: color.ink, margin: '0 0 16px' },
  text: { fontSize: 16, lineHeight: '26px', margin: '0 0 16px' },
  label: { fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: color.muted, margin: 0 },
  value: { fontSize: 16, lineHeight: '24px', margin: '0 0 12px', fontWeight: 500 },
  box: { backgroundColor: '#DCE6DE', borderRadius: 12, padding: '16px 20px', margin: '8px 0 24px' },
  small: { fontSize: 14, lineHeight: '20px', color: color.muted, margin: '0 0 8px' },
  hr: { borderColor: color.line, margin: '24px 0' },
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function Details({ rows }: { rows: [string, string][] }) {
  return (
    <Section style={styles.box}>
      {rows
        .filter(([, value]) => value)
        .map(([label, value]) => (
          <div key={label}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
          </div>
        ))}
    </Section>
  )
}

export function clientSubject(d: EmailDetails) {
  return d.lang === 'fr'
    ? `Votre rendez-vous est confirmé · ${d.businessName}`
    : `Your appointment is confirmed · ${d.businessName}`
}

export function ownerSubject(d: EmailDetails) {
  return `${COPY[d.lang].newBooking} : ${d.serviceName} · ${capitalize(d.date)} ${d.time}`
}

export function ClientConfirmationEmail(d: EmailDetails) {
  const c = COPY[d.lang]
  return (
    <Html lang={d.lang}>
      <Head />
      <Preview>{`${c.preview} · ${d.serviceName}, ${d.date} ${d.time}`}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.brand}>{d.businessName}</Text>
          <Heading as="h1" style={styles.heading}>
            {c.hello(d.customerName)}
          </Heading>
          <Text style={styles.text}>{c.intro}</Text>
          <Details
            rows={[
              [c.service, d.serviceName],
              [c.date, capitalize(d.date)],
              [c.time, d.time],
              [c.with, d.resourceName],
              [c.duration, `${d.durationMinutes} min`],
              [c.price, `${d.price} DT`],
            ]}
          />
          {d.businessAddress && (
            <>
              <Text style={styles.label}>{c.address}</Text>
              <Text style={{ ...styles.text, whiteSpace: 'pre-line' }}>{d.businessAddress}</Text>
            </>
          )}
          <Text style={styles.text}>{c.change}</Text>
          <Hr style={styles.hr} />
          <Text style={styles.small}>{c.seeYou}</Text>
          <Text style={{ ...styles.small, color: color.sage, fontWeight: 600 }}>
            {d.businessName}
            {d.businessPhone ? ` · ${d.businessPhone}` : ''}
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export function OwnerNotificationEmail(d: EmailDetails & { clientLang: EmailLang }) {
  const c = COPY[d.lang]
  return (
    <Html lang={d.lang}>
      <Head />
      <Preview>{`${c.newBooking} · ${d.serviceName}, ${d.date} ${d.time}`}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.brand}>{d.businessName}</Text>
          <Heading as="h1" style={styles.heading}>
            {c.newBooking}
          </Heading>
          <Details
            rows={[
              [c.service, d.serviceName],
              [c.date, capitalize(d.date)],
              [c.time, d.time],
              [c.with, d.resourceName],
            ]}
          />
          <Details
            rows={[
              [c.client, d.customerName],
              [c.email, d.customerEmail],
              [c.phone, d.customerPhone],
              [c.language, d.clientLang === 'fr' ? 'Français' : 'English'],
            ]}
          />
          <Text style={styles.small}>{c.ownerTip}</Text>
        </Container>
      </Body>
    </Html>
  )
}