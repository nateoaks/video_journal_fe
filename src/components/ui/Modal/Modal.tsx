'use client'

import { Dialog } from '@base-ui/react'
import { cn } from '@/lib/utils'

export interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Popup
          className={cn(
            'bg-background border-border fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border p-6 shadow-lg',
            className
          )}
        >
          <Dialog.Title className="mb-1 text-lg font-semibold">
            {title}
          </Dialog.Title>
          {description && (
            <Dialog.Description className="text-muted-foreground mb-4 text-sm">
              {description}
            </Dialog.Description>
          )}
          <div className="mb-4">{children}</div>
          {footer && <div className="flex justify-end gap-2">{footer}</div>}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
