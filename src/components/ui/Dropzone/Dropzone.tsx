'use client'

import React, { useRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const dropzoneVariants = cva(
  'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-8 py-16 text-center transition-colors cursor-pointer',
  {
    variants: {
      variant: {
        idle: 'border-border bg-background text-muted-foreground hover:border-primary hover:text-foreground',
        active: 'border-primary bg-primary/5 text-primary',
        rejected: 'border-destructive bg-destructive/5 text-destructive',
      },
    },
    defaultVariants: { variant: 'idle' },
  }
)

export interface DropzoneProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrop'>,
    VariantProps<typeof dropzoneVariants> {
  onFiles: (files: FileList) => void
  accept?: string
  multiple?: boolean
  rejectedLabel?: string
  rejectedDescription?: string
}

export function Dropzone({
  variant,
  className,
  onFiles,
  accept,
  multiple = true,
  children,
  rejectedLabel = 'File not supported',
  rejectedDescription,
  ...props
}: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.files.length > 0) {
      onFiles(e.dataTransfer.files)
    }
  }

  function handleClick() {
    inputRef.current?.click()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      inputRef.current?.click()
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      onFiles(e.target.files)
      // Reset so the same file can be re-selected
      e.target.value = ''
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Drop video files here or click to browse"
      className={cn(dropzoneVariants({ variant }), className)}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...props}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={handleInputChange}
        tabIndex={-1}
      />
      {children ?? (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-10 opacity-60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5V19a2 2 0 002 2h14a2 2 0 002-2v-2.5M16 12l-4-4m0 0l-4 4m4-4v12"
            />
          </svg>
          <div>
            <p className="text-sm font-medium">
              {variant === 'rejected' ? rejectedLabel : 'Drop files here'}
            </p>
            <p className="mt-1 text-xs opacity-75">
              {variant === 'rejected'
                ? (rejectedDescription ?? '')
                : 'or click to browse'}
            </p>
          </div>
        </>
      )}
    </div>
  )
}

export { dropzoneVariants }
