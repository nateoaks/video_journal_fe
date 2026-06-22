import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { formatDuration } from '@/lib/format'
import { Badge } from '../Badge'
import type { SoundtrackStatus } from '@/types/soundtrack'

const soundtrackItemVariants = cva(
  'flex flex-col gap-3 rounded-lg border p-4 transition-colors',
  {
    variants: {
      status: {
        ready: 'border-border bg-card',
        processing: 'border-border bg-muted/40',
        failed: 'border-destructive/40 bg-destructive/5',
      },
      selected: {
        true: 'border-primary ring-primary ring-2 ring-offset-1',
        false: '',
      },
    },
    defaultVariants: { status: 'ready', selected: false },
  }
)

export interface SoundtrackItemProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    Omit<VariantProps<typeof soundtrackItemVariants>, 'selected'> {
  title: string
  duration_s: number | null
  status: SoundtrackStatus
  selected: boolean
  audioSrc: string
  onSelect?: () => void
  onDelete?: () => void
  isDeleting?: boolean
}

export function SoundtrackItem({
  title,
  duration_s,
  status,
  selected,
  audioSrc,
  onSelect,
  onDelete,
  isDeleting,
  className,
  ...props
}: SoundtrackItemProps) {
  const isReady = status === 'ready'

  return (
    <div
      className={cn(
        soundtrackItemVariants({ status, selected: selected as boolean }),
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="truncate text-sm font-medium">{title}</span>
          <span className="text-muted-foreground text-xs">
            {formatDuration(duration_s)}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {status === 'processing' && (
            <Badge variant="processing">Processing</Badge>
          )}
          {status === 'failed' && <Badge variant="failed">Failed</Badge>}
          <button
            role="radio"
            aria-checked={selected}
            onClick={onSelect}
            disabled={!isReady}
            aria-label={selected ? 'Selected' : 'Select soundtrack'}
            className={cn(
              'flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
              selected
                ? 'border-primary bg-primary'
                : 'border-muted-foreground hover:border-primary',
              (!isReady || !onSelect) && 'pointer-events-none opacity-50'
            )}
          >
            {selected && (
              <svg
                className="text-primary-foreground size-2.5"
                fill="currentColor"
                viewBox="0 0 10 10"
                aria-hidden="true"
              >
                <circle cx="5" cy="5" r="3" />
              </svg>
            )}
          </button>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            aria-label="Delete soundtrack"
            className="text-muted-foreground hover:text-destructive disabled:pointer-events-none disabled:opacity-50"
          >
            <svg
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {status === 'ready' && (
        <audio
          controls
          preload="metadata"
          src={audioSrc}
          className="h-8 w-full"
          aria-label={`Audio preview for ${title}`}
        />
      )}
    </div>
  )
}

export { soundtrackItemVariants }
