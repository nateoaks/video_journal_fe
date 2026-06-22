'use client'

import { useRef, useState, useEffect, useTransition, useCallback } from 'react'
import { toast } from 'sonner'
import { TrimScrubber } from '@/components/ui'
import { clipVideoPath, clipFilmstripPath } from '@/services'
import type { Clip } from '@/types/clip'
import {
  initialSelection,
  clampSelection,
  timeToPixel,
  pixelToTime,
  formatTimestamp,
  MIN_SELECTION_S,
} from '../lib'
import { saveTrim } from '../actions'

const SCRUBBER_WIDTH = 800

interface TrimmerProps {
  clip: Clip
}

export function Trimmer({ clip }: TrimmerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const rafRef = useRef<number | null>(null)

  const duration = clip.duration_s ?? 0
  const initial = initialSelection(clip)

  const [trimIn, setTrimIn] = useState(initial.in)
  const [trimOut, setTrimOut] = useState(initial.out)
  const [playheadTime, setPlayheadTime] = useState(initial.in)
  const [isPending, startTransition] = useTransition()

  // Derived mapping functions bound to known duration and width
  const toPixel = useCallback(
    (t: number) => timeToPixel(t, duration, SCRUBBER_WIDTH),
    [duration]
  )
  const fromPixel = useCallback(
    (px: number) => pixelToTime(px, duration, SCRUBBER_WIDTH),
    [duration]
  )

  // Keep a ref to trimOut so the boundary listener never needs to be re-registered
  const trimOutRef = useRef(trimOut)
  useEffect(() => {
    trimOutRef.current = trimOut
  }, [trimOut])

  // Cancel any pending rAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // Track playhead on timeupdate
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    function handleTimeUpdate() {
      setPlayheadTime(video!.currentTime)
    }
    video.addEventListener('timeupdate', handleTimeUpdate)
    return () => video.removeEventListener('timeupdate', handleTimeUpdate)
  }, [])

  // Pause video when playhead reaches trimOut — reads from ref so the listener
  // is registered only once and does not re-register on every trimOut change
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    function handleBoundary() {
      if (video!.currentTime >= trimOutRef.current) {
        video!.pause()
      }
    }
    video.addEventListener('timeupdate', handleBoundary)
    return () => video.removeEventListener('timeupdate', handleBoundary)
  }, [])

  function scheduleScrub(time: number) {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = time
      }
    })
  }

  function handleTrimInChange(t: number) {
    const clamped = clampSelection({ in: t, out: trimOut }, duration)
    setTrimIn(clamped.in)
    scheduleScrub(clamped.in)
  }

  function handleTrimOutChange(t: number) {
    const clamped = clampSelection({ in: trimIn, out: t }, duration)
    setTrimOut(clamped.out)
    scheduleScrub(clamped.out)
  }

  function handlePreview() {
    const video = videoRef.current
    if (!video) return
    video.currentTime = trimIn
    void video.play()
  }

  function handleSave() {
    startTransition(async () => {
      try {
        const result = await saveTrim(clip.id, trimIn, trimOut)
        if (result.error) {
          toast.error(result.error)
        } else {
          toast.success('Trim saved')
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to save trim')
      }
    })
  }

  const selectionDuration = trimOut - trimIn

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Trim clip</h1>
        <p className="text-muted-foreground text-sm">
          Drag the handles to set in and out points.
        </p>
      </div>

      {/* Video preview */}
      <div className="overflow-hidden rounded-lg bg-black">
        <video
          ref={videoRef}
          src={clipVideoPath(clip.id)}
          className="w-full"
          preload="metadata"
          playsInline
        />
      </div>

      {/* Scrubber */}
      <TrimScrubber
        filmstripSrc={clipFilmstripPath(clip.id)}
        duration={duration}
        trimIn={trimIn}
        trimOut={trimOut}
        playheadTime={playheadTime}
        pixelToTime={fromPixel}
        timeToPixel={toPixel}
        onTrimInChange={handleTrimInChange}
        onTrimOutChange={handleTrimOutChange}
        style={{ width: SCRUBBER_WIDTH, maxWidth: '100%' }}
      />

      {/* Time display */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground text-xs tracking-wide uppercase">
            In
          </span>
          <span className="font-mono font-medium">
            {formatTimestamp(trimIn)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground text-xs tracking-wide uppercase">
            Out
          </span>
          <span className="font-mono font-medium">
            {formatTimestamp(trimOut)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground text-xs tracking-wide uppercase">
            Duration
          </span>
          <span className="font-mono font-medium">
            {formatTimestamp(selectionDuration)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handlePreview}
          className="border-input bg-background hover:bg-accent rounded-md border px-4 py-2 text-sm font-medium transition-colors"
        >
          Preview
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || selectionDuration < MIN_SELECTION_S}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50"
        >
          {isPending ? 'Saving…' : 'Save trim'}
        </button>
      </div>
    </div>
  )
}
