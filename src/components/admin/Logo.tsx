import type { Payload } from 'payload'
import { Cormorant_Garamond } from 'next/font/google'
import Icon from './Icon'

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['600'] })

// Shown on the admin login screen. The name comes from Site settings (white-label).
export default async function Logo({ payload }: { payload?: Payload }) {
  const settings = payload ? await payload.findGlobal({ slug: 'site-settings' }) : null
  const name = settings?.businessName || 'Admin'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Icon size={40} />
      <span className={cormorant.className} style={{ fontSize: 44, fontWeight: 600, lineHeight: 1 }}>
        {name}
      </span>
    </div>
  )
}