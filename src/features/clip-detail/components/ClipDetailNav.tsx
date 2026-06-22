'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const navBtnClass =
  'inline-flex h-8 items-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50'

interface ClipDetailNavProps {
  prevId: string | null
  nextId: string | null
}

export function ClipDetailNav({ prevId, nextId }: ClipDetailNavProps) {
  const router = useRouter()

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => router.back()}
        className={navBtnClass}
      >
        ← Back
      </button>
      <div className="ml-auto flex items-center gap-1">
        {prevId ? (
          <Link href={`/library/${prevId}`} className={navBtnClass}>
            ‹ Prev
          </Link>
        ) : (
          <span className={cn(navBtnClass, 'pointer-events-none opacity-50')}>
            ‹ Prev
          </span>
        )}
        {nextId ? (
          <Link href={`/library/${nextId}`} className={navBtnClass}>
            Next ›
          </Link>
        ) : (
          <span className={cn(navBtnClass, 'pointer-events-none opacity-50')}>
            Next ›
          </span>
        )}
      </div>
    </div>
  )
}
