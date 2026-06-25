import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { CompilationStatus } from '@/types/compilation'

const compilationRowVariants = cva(
  'flex flex-col gap-2 rounded-lg border px-4 py-3 transition-colors sm:flex-row sm:items-start sm:justify-between',
  {
    variants: {
      status: {
        queued: 'border-border bg-card',
        pending: 'border-border bg-card',
        running:
          'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20',
        complete: 'border-border bg-card',
        failed: 'border-destructive/30 bg-destructive/5',
      },
    },
    defaultVariants: { status: 'complete' },
  }
)

export interface CompilationRowProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof compilationRowVariants> {
  status: CompilationStatus
  createdAt: string
  duration?: string | null
  soundtrackLabel?: string | null
  mixMode?: string
  errorText?: string | null
  actions?: React.ReactNode
}

export function CompilationRow({
  status,
  createdAt,
  duration,
  soundtrackLabel,
  mixMode,
  errorText,
  actions,
  className,
  ...props
}: CompilationRowProps) {
  const formattedDate = new Date(createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
  const formattedTime = new Date(createdAt).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div
      className={cn(compilationRowVariants({ status }), className)}
      {...props}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-foreground text-sm font-medium">
            {formattedDate} at {formattedTime}
          </span>
          {duration && (
            <span className="text-muted-foreground text-xs">{duration}</span>
          )}
        </div>
        {soundtrackLabel && (
          <p className="text-muted-foreground truncate text-xs">
            Soundtrack: {soundtrackLabel}
          </p>
        )}
        {mixMode && <p className="text-muted-foreground text-xs">{mixMode}</p>}
        {errorText && (
          <p className="text-destructive text-xs break-words">{errorText}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  )
}
