import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const spinnerVariants = cva('animate-spin text-current', {
  variants: {
    size: {
      sm: 'size-4',
      md: 'size-6',
      lg: 'size-8',
    },
  },
  defaultVariants: { size: 'md' },
})

export interface SpinnerProps
  extends
    React.SVGAttributes<SVGSVGElement>,
    VariantProps<typeof spinnerVariants> {}

export function Spinner({ className, size, ...props }: SpinnerProps) {
  return (
    <svg
      className={cn(spinnerVariants({ size }), className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="status"
      aria-label="Loading"
      {...props}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}
