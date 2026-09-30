import { ImageResponse } from 'next/og'
import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { routing } from '@/i18n/routing'

const size = { width: 1200, height: 630 }

// Charter colours
const C = { surface: '#FBF8F4', ink: '#2A2420', muted: '#6B5F57', sage: '#4F6B5A', sageSoft: '#DCE6DE', clay: '#B8735A' }

// Load only the letters we need from Google Fonts (the pattern from the Next.js docs)
async function loadGoogleFont(family: string, text: string): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`
  const css = await (await fetch(url)).text()
  const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/)
  if (resource) {
    const response = await fetch(resource[1])
    if (response.status === 200) return await response.arrayBuffer()
  }
  throw new Error('Failed to load font')
}

// GET /fr/og or /en/og → the link-preview image (1200×630 PNG)
export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale: requested } = await params
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale

  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({ slug: 'site-settings', locale })
  const t = await getTranslations({ locale, namespace: 'Meta' })

  const name = settings.businessName || 'Booking'
  const tagline = settings.tagline || ''
  const eyebrow = t('homeTitle')
  const cta = t('bookingTitle')

  // Serif wordmark if Google Fonts answers; otherwise the default font (the image still works)
  const fonts: { name: string; data: ArrayBuffer; weight: 600; style: 'normal' }[] = []
  try {
    fonts.push({ name: 'Cormorant', data: await loadGoogleFont('Cormorant+Garamond:wght@600', name), weight: 600, style: 'normal' })
  } catch {
    // keep default font
  }

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: C.surface, padding: 64, gap: 56 }}>
        {/* Text side */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
          <div style={{ display: 'flex', fontSize: 24, letterSpacing: 3, textTransform: 'uppercase', color: C.muted }}>
            {eyebrow}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontFamily: 'Cormorant', fontSize: 112, fontWeight: 600, color: C.ink, lineHeight: 1 }}>
              {name}
            </div>
            {tagline && (
              <div style={{ display: 'flex', marginTop: 24, fontSize: 36, color: C.muted }}>{tagline}</div>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              alignSelf: 'flex-start',
              background: C.sage,
              color: '#FFFFFF',
              fontSize: 30,
              padding: '18px 36px',
              borderRadius: 999,
            }}
          >
            {cta}
          </div>
        </div>

        {/* Sage panel with leaves */}
        <div
          style={{
            display: 'flex',
            width: 340,
            height: '100%',
            background: C.sage,
            borderRadius: 28,
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <svg width="230" height="230" viewBox="0 0 24 24">
            <path d="M4 20C4 11 11 4 20 4C20 13 13 20 4 20Z" fill={C.sageSoft} />
            <path d="M4 20L14 10" stroke={C.sage} strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <div
            style={{
              position: 'absolute',
              top: 40,
              right: 40,
              width: 56,
              height: 56,
              borderRadius: 999,
              background: C.clay,
            }}
          />
        </div>
      </div>
    ),
    { ...size, fonts },
  )
}