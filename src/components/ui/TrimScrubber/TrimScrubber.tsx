'use client'

import { useRef, useState, useEffect } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const handleVariants = cva(
  'absolute top-0 z-20 h-full w-3 -translate-x-1/2 cursor-ew-resize touch-none select-none',
  {
    variants: {
      active: {
        true: 'opacity-100',
        false: 'opacity-80 hover:opacity-100',
      },
      side: {
        in: 'bg-primary rounded-l',
        out: 'bg-primary rounded-r',
      },
    },
    defaultVariants: { active: false },
  }
)

export interface TrimScrubberProps extends React.HTMLAttributes<HTMLDivElement> {
  /** URL for the filmstrip background image */
  filmstripSrc: string
  /** Total clip duration in seconds */
  duration: number
  /** Trim-in point in seconds */
  trimIn: number
  /** Trim-out point in seconds */
  trimOut: number
  /** Current playhead time in seconds */
  playheadTime: number
  /** Convert a pixel offset (from left of the scrubber) to a time in seconds */
  pixelToTime: (px: number) => number
  /** Convert a time in seconds to a pixel offset from the left of the scrubber */
  timeToPixel: (t: number) => number
  /** Called when the in-point changes (value in seconds) */
  onTrimInChange: (t: number) => void
  /** Called when the out-point changes (value in seconds) */
  onTrimOutChange: (t: number) => void
}

type DragTarget = 'in' | 'out' | null

export function TrimScrubber({
  filmstripSrc,
  duration: _duration, // eslint-disable-line @typescript-eslint/no-unused-vars
  trimIn,
  trimOut,
  playheadTime,
  pixelToTime,
  timeToPixel,
  onTrimInChange,
  onTrimOutChange,
  className,
  ...props
}: TrimScrubberProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dragTarget = useRef<DragTarget>(null)
  const rafRef = useRef<number | null>(null)
  const [activeDragTarget, setActiveDragTarget] = useState<'in' | 'out' | null>(
    null
  )

  // Cancel any pending rAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const inPercent = `${timeToPixel(trimIn)}px`
  const outPercent = `${timeToPixel(trimOut)}px`
  const playheadPercent = `${timeToPixel(playheadTime)}px`

  function getTimeFromPointer(e: PointerEvent): number {
    if (!containerRef.current) return 0
    const rect = containerRef.current.getBoundingClientRect()
    const px = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    return pixelToTime(px)
  }

  function handleInPointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragTarget.current = 'in'
    setActiveDragTarget('in')
  }

  function handleOutPointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragTarget.current = 'out'
    setActiveDragTarget('out')
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragTarget.current) return
    const target = dragTarget.current
    const t = getTimeFromPointer(e.nativeEvent)
    // Throttle state updates (and thus parent re-renders) to rAF rate
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      if (target === 'in') {
        onTrimInChange(t)
      } else {
        onTrimOutChange(t)
      }
      rafRef.current = null
    })
  }

  function handleInPointerUp(e: React.PointerEvent) {
    e.currentTarget.releasePointerCapture(e.pointerId)
    dragTarget.current = null
    setActiveDragTarget(null)
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  function handleOutPointerUp(e: React.PointerEvent) {
    e.currentTarget.releasePointerCapture(e.pointerId)
    dragTarget.current = null
    setActiveDragTarget(null)
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative h-16 w-full overflow-hidden rounded bg-neutral-800 select-none',
        className
      )}
      style={{
        backgroundImage: `url(${filmstripSrc})`,
        backgroundSize: 'cover',
      }}
      onPointerMove={handlePointerMove}
      {...props}
    >
      {/* Dimmed region before in-point */}
      <div
        className="absolute top-0 left-0 z-10 h-full bg-black/50"
        style={{ width: inPercent }}
      />

      {/* Dimmed region after out-point */}
      <div
        className="absolute top-0 right-0 z-10 h-full bg-black/50"
        style={{ left: outPercent }}
      />

      {/* Selection bracket overlay (between handles) */}
      <div
        className="border-primary absolute top-0 z-10 h-full border-y-2 bg-transparent"
        style={{ left: inPercent, right: `calc(100% - ${outPercent})` }}
      />

      {/* In-point handle */}
      <div
        className={cn(
          handleVariants({ active: activeDragTarget === 'in', side: 'in' })
        )}
        style={{ left: inPercent }}
        onPointerDown={handleInPointerDown}
        onPointerUp={handleInPointerUp}
        role="slider"
        aria-label="Trim in point"
        aria-valuenow={trimIn}
      />

      {/* Out-point handle */}
      <div
        className={cn(
          handleVariants({ active: activeDragTarget === 'out', side: 'out' })
        )}
        style={{ left: outPercent }}
        onPointerDown={handleOutPointerDown}
        onPointerUp={handleOutPointerUp}
        role="slider"
        aria-label="Trim out point"
        aria-valuenow={trimOut}
      />

      {/* Playhead */}
      <div
        className="pointer-events-none absolute top-0 z-30 h-full w-0.5 bg-white/90"
        style={{ left: playheadPercent }}
      />
    </div>
  )
}
