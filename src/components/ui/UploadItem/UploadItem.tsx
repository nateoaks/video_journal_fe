'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const uploadItemVariants = cva(
  'flex flex-col gap-1.5 rounded-lg border px-4 py-3 transition-colors',
  {
    variants: {
      status: {
        queued: 'border-border bg-card text-foreground',
        uploading: 'border-primary/40 bg-primary/5 text-foreground',
        processing: 'border-border bg-muted text-foreground',
        failed: 'border-destructive/50 bg-destructive/5 text-foreground',
      },
    },
    defaultVariants: { status: 'queued' },
  }
)

export interface UploadItemProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, 'onError'>,
    VariantProps<typeof uploadItemVariants> {
  name: string
  progress?: number
  error?: string
  onRetry?: () => void
}

export const UploadItem = React.memo(function UploadItem({
  name,
  status,
  progress = 0,
  error,
  onRetry,
  className,
  ...props
}: UploadItemProps) {
  const statusLabel: Record<NonNullable<typeof status>, string> = {
    queued: 'Queued',
    uploading: `Uploading ${progress}%`,
    processing: 'Processing…',
    failed: 'Failed',
  }

  return (
    <div className={cn(uploadItemVariants({ status }), className)} {...props}>
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 flex-1 truncate text-sm font-medium">
          {name}
        </span>
        <span
          className={cn(
            'shrink-0 text-xs font-medium',
            status === 'failed' && 'text-destructive',
            status === 'processing' && 'text-muted-foreground',
            status === 'uploading' && 'text-primary',
            status === 'queued' && 'text-muted-foreground'
          )}
        >
          {status !== null && status !== undefined ? statusLabel[status] : ''}
        </span>
        {status === 'failed' && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="text-destructive hover:text-destructive/80 shrink-0 text-xs font-medium underline transition-colors"
          >
            Retry
          </button>
        )}
      </div>

      {status === 'uploading' && (
        <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
          <div
            className="bg-primary h-full rounded-full transition-all duration-150"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Upload progress: ${progress}%`}
          />
        </div>
      )}

      {status === 'failed' && error && (
        <p className="text-destructive text-xs">{error}</p>
      )}
    </div>
  )
})

export { uploadItemVariants }
