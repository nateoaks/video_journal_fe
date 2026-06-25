'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

export interface ErrorDetailsProps {
  /** Short human-readable message always shown. */
  message: string
  /** Raw stderr/log text shown in a collapsible section. */
  details?: string | null
  className?: string
}

export function ErrorDetails({
  message,
  details,
  className,
}: ErrorDetailsProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <p className="text-destructive text-sm font-medium">{message}</p>
      {details && (
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="text-muted-foreground hover:text-foreground w-fit text-xs underline underline-offset-2 transition-colors"
            aria-expanded={open}
          >
            {open ? 'Hide details' : 'Show details'}
          </button>
          {open && (
            <pre className="bg-muted text-muted-foreground max-h-48 overflow-auto rounded-md p-3 text-xs break-words whitespace-pre-wrap">
              {details}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}
