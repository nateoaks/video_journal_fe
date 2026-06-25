'use client'

import { Slider as BaseSlider } from '@base-ui/react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Slider component (range input control).
 * Wraps Base UI's Slider for accessible range selection.
 * Use `value` and `onValueChange` to control the selected value.
 * Customize min, max, and step as needed.
 */

const sliderTrackVariants = cva(
  'relative flex h-2 w-full touch-none items-center',
  {
    variants: {
      variant: {
        default: '',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

const sliderRailVariants = cva(
  'relative h-2 w-full overflow-hidden rounded-full',
  {
    variants: {
      variant: {
        default: 'bg-secondary',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

const sliderIndicatorVariants = cva('absolute h-full', {
  variants: {
    variant: {
      default: 'bg-primary',
    },
  },
  defaultVariants: { variant: 'default' },
})

const sliderThumbVariants = cva(
  'block rounded-full border-2 border-primary bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      size: {
        md: 'size-5',
      },
    },
    defaultVariants: { size: 'md' },
  }
)

export interface SliderProps
  extends
    Omit<
      React.ComponentPropsWithoutRef<typeof BaseSlider.Root>,
      'onValueChange' | 'value' | 'defaultValue'
    >,
    VariantProps<typeof sliderTrackVariants> {
  value?: number
  onValueChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  className?: string
  'aria-label'?: string
  'aria-labelledby'?: string
}

export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  className,
  variant,
  ...props
}: SliderProps) {
  return (
    <BaseSlider.Root
      value={value}
      onValueChange={onValueChange}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      className={cn(sliderTrackVariants({ variant }), className)}
      {...props}
    >
      <BaseSlider.Control className="flex w-full items-center">
        <BaseSlider.Track className={sliderRailVariants()}>
          <BaseSlider.Indicator className={sliderIndicatorVariants()} />
        </BaseSlider.Track>
        <BaseSlider.Thumb className={sliderThumbVariants()} />
      </BaseSlider.Control>
    </BaseSlider.Root>
  )
}

export {
  sliderTrackVariants,
  sliderRailVariants,
  sliderIndicatorVariants,
  sliderThumbVariants,
}
