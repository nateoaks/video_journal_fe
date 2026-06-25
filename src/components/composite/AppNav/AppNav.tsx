'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/library', label: 'Library' },
  { href: '/timeline', label: 'Timeline' },
  { href: '/upload', label: 'Upload' },
  { href: '/soundtracks', label: 'Soundtracks' },
  { href: '/history', label: 'History' },
]

export function AppNav() {
  const pathname = usePathname()
  return (
    <nav className="border-border bg-background flex h-14 items-center gap-6 border-b px-6">
      {navItems.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            'text-sm font-medium transition-colors',
            pathname.startsWith(href)
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  )
}
