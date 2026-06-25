'use client'

import { Switch as BaseSwitch } from '@base-ui/react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Switch component (toggle control).
 * Wraps Base UI's Switch for accessible on/off state management.
 * Use `checked` and `onCheckedChange` to control state.
 */

const switchTrackVariants = cva(
  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'data-[checked]:bg-primary bg-input',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

const switchThumbVariants = cva(
  'pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform',
  {
    variants: {
      size: {
        md: 'size-5 data-[checked]:translate-x-5 translate-x-0',
      },
    },
    defaultVariants: { size: 'md' },
  }
)

export interface SwitchProps
  extends
    Omit<
      React.ComponentPropsWithoutRef<typeof BaseSwitch.Root>,
      'onCheckedChange'
    >,
    VariantProps<typeof switchTrackVariants> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export function Switch({
  checked,
  onCheckedChange,
  disabled,
  className,
  variant,
  ...props
}: SwitchProps) {
  return (
    <BaseSwitch.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={cn(switchTrackVariants({ variant }), className)}
      {...props}
    >
      <BaseSwitch.Thumb className={switchThumbVariants()} />
    </BaseSwitch.Root>
  )
}

export { switchTrackVariants, switchThumbVariants }
