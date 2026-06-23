import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const progressBarTrackVariants = cva(
  'w-full overflow-hidden rounded-full bg-muted',
  {
    variants: {
      size: {
        sm: 'h-1.5',
        md: 'h-2.5',
      },
    },
    defaultVariants: { size: 'md' },
  }
)

const progressBarFillVariants = cva('h-full rounded-full transition-all', {
  variants: {
    variant: {
      default: 'bg-primary',
      error: 'bg-destructive',
      complete: 'bg-green-500',
    },
  },
  defaultVariants: { variant: 'default' },
})

export interface ProgressBarProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressBarFillVariants>,
    VariantProps<typeof progressBarTrackVariants> {
  value: number
}

export function ProgressBar({
  value,
  variant,
  size,
  className,
  ...props
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value))

  return (
    <div
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(progressBarTrackVariants({ size }), className)}
      {...props}
    >
      <div
        className={progressBarFillVariants({ variant })}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  )
}

export { progressBarFillVariants, progressBarTrackVariants }
