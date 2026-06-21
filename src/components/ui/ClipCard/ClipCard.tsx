import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui'

export type ClipCardStatus = 'ready' | 'processing' | 'failed'

export interface ClipCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Absolute or relative URL for the filmstrip/thumbnail image */
  thumbnailSrc?: string | null
  /** Display label for the clip duration, e.g. "01:23" */
  duration: string
  /** Display label for the recorded date, e.g. "Mar 15, 2024" */
  recordedDate: string
  /** Processing / ready / failed state */
  status: ClipCardStatus
  /** Whether the clip has been trimmed from its original length */
  isTrimmed?: boolean
}

export function ClipCard({
  thumbnailSrc,
  duration,
  recordedDate,
  status,
  isTrimmed = false,
  className,
  ...props
}: ClipCardProps) {
  return (
    <div
      className={cn(
        'bg-card border-border group relative overflow-hidden rounded-lg border transition-shadow',
        status === 'ready' && 'hover:shadow-md',
        (status === 'processing' || status === 'failed') && 'opacity-75',
        className
      )}
      {...props}
    >
      {/* Thumbnail area */}
      <div className="bg-muted relative aspect-video w-full overflow-hidden">
        {thumbnailSrc ? (
          // Plain img is intentional — thumbnails load through the /api/:path* proxy rewrite.
          // next/image would require an extra remotePatterns config for each environment.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailSrc}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg
              className="text-muted-foreground h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Duration badge — bottom-left overlay */}
        <div className="absolute bottom-1.5 left-1.5">
          <Badge
            variant="outline"
            className="border-transparent bg-black/60 text-white"
          >
            {duration}
          </Badge>
        </div>

        {/* Trimmed indicator — bottom-right */}
        {isTrimmed && (
          <div className="absolute right-1.5 bottom-1.5">
            <Badge
              variant="outline"
              className="border-transparent bg-black/60 text-white"
            >
              Trimmed
            </Badge>
          </div>
        )}

        {/* Processing overlay */}
        {status === 'processing' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Badge variant="processing">Processing…</Badge>
          </div>
        )}

        {/* Failed overlay */}
        {status === 'failed' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Badge variant="failed">Failed</Badge>
          </div>
        )}
      </div>

      {/* Card footer */}
      <div className="px-3 py-2">
        <p className="text-muted-foreground truncate text-xs">{recordedDate}</p>
      </div>
    </div>
  )
}
