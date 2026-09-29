'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowRight, Menu, X } from 'lucide-react'
import { Link, usePathname } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/', key: 'home' },
  { href: '/services', key: 'services' },
  { href: '/contact', key: 'contact' },
] as const

function Leaf() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-5 text-primary transition-transform duration-500 motion-safe:group-hover:rotate-[20deg]"
    >
      <path d="M4 20C4 11 11 4 20 4C20 13 13 20 4 20Z" fill="currentColor" />
      <path d="M4 20L14 10" stroke="var(--background)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function Header({ businessName }: { businessName: string }) {
  const t = useTranslations('Nav')
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  const close = () => setOpen(false)

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b transition-all duration-300',
        scrolled || open
          ? 'border-border bg-background/80 backdrop-blur-md'
          : 'border-transparent bg-background',
      )}
    >
      <div
        className={cn(
          'mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 transition-all duration-300',
          scrolled ? 'py-3' : 'py-5',
        )}
      >
        <Link href="/" onClick={close} className="group flex items-center gap-2">
          <Leaf />
          <span className="font-heading text-2xl font-semibold tracking-tight">{businessName}</span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative py-1 text-sm transition-colors',
                  'after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-center after:bg-primary after:transition-transform after:duration-300',
                  active
                    ? 'text-foreground after:scale-x-100'
                    : 'text-muted-foreground after:scale-x-0 hover:text-foreground hover:after:scale-x-100',
                )}
              >
                {t(item.key)}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          <Button asChild variant="outline" size="sm" className="group hidden sm:inline-flex">
            <Link href="/booking">
              {t('book')}
              <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile menu: slides open */}
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-300 md:hidden',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <nav className="overflow-hidden" inert={!open}>
          <div className="flex flex-col gap-1 px-6 pb-6 pt-2">
            {NAV.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'border-b border-border py-3 font-heading text-2xl font-semibold transition-colors',
                    active ? 'text-primary' : 'text-foreground hover:text-primary',
                  )}
                >
                  {t(item.key)}
                </Link>
              )
            })}
            <Button asChild size="lg" className="mt-4">
              <Link href="/booking" onClick={close}>
                {t('book')}
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  )
}