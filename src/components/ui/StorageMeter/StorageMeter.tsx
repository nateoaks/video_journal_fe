import { cn } from '@/lib/utils'
import { Card } from '../Card'
import { ProgressBar } from '../ProgressBar'

export interface StorageMeterSegment {
  label: string
  formatted: string
  bytes: number
  totalBytes: number
}

export interface StorageMeterProps extends React.HTMLAttributes<HTMLDivElement> {
  total: string
  segments: StorageMeterSegment[]
}

export function StorageMeter({
  total,
  segments,
  className,
  ...props
}: StorageMeterProps) {
  return (
    <Card className={cn('flex flex-col gap-4', className)} {...props}>
      <div className="flex items-baseline justify-between">
        <span className="text-muted-foreground text-sm font-medium">
          Storage Used
        </span>
        <span className="text-lg font-semibold">{total}</span>
      </div>
      <div className="flex flex-col gap-3">
        {segments.map((seg) => {
          const pct =
            seg.totalBytes > 0
              ? Math.round((seg.bytes / seg.totalBytes) * 100)
              : 0
          return (
            <div key={seg.label} className="flex flex-col gap-1">
              <div className="text-muted-foreground flex items-center justify-between text-xs">
                <span>{seg.label}</span>
                <span>{seg.formatted}</span>
              </div>
              <ProgressBar value={pct} size="sm" aria-label={seg.label} />
            </div>
          )
        })}
      </div>
    </Card>
  )
}
