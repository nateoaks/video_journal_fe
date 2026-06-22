import type { Clip } from '@/types/clip'
import type { TrimSelection } from './types'

export const MIN_SELECTION_S = 0.5

/**
 * Convert a time value (seconds) to a pixel offset within the scrubber.
 */
export function timeToPixel(
  time: number,
  duration: number,
  width: number
): number {
  if (duration <= 0 || width <= 0) return 0
  return (time / duration) * width
}

/**
 * Convert a pixel offset within the scrubber to a time value (seconds).
 */
export function pixelToTime(
  px: number,
  duration: number,
  width: number
): number {
  if (duration <= 0 || width <= 0) return 0
  return (px / width) * duration
}

/**
 * Clamp a TrimSelection so both handles stay within [0, duration] and
 * the gap between in and out is at least minDuration seconds.
 */
export function clampSelection(
  sel: TrimSelection,
  duration: number,
  minDuration: number = MIN_SELECTION_S
): TrimSelection {
  const clampedIn = Math.max(0, Math.min(sel.in, duration - minDuration))
  const clampedOut = Math.min(duration, Math.max(sel.out, minDuration))

  // If handles have crossed or are too close, enforce min gap from whichever
  // side moved last — we keep out clamped and push in back if needed.
  if (clampedOut - clampedIn < minDuration) {
    return {
      in: Math.max(0, clampedOut - minDuration),
      out: clampedOut,
    }
  }

  return { in: clampedIn, out: clampedOut }
}

/**
 * Derive the initial TrimSelection from a clip's existing trim metadata
 * and total duration.
 */
export function initialSelection(clip: Clip): TrimSelection {
  return {
    in: clip.trim_in_s ?? 0,
    out: clip.trim_out_s ?? clip.duration_s ?? 0,
  }
}

/**
 * The effective playable duration of a clip after trimming.
 */
export function effectiveDuration(clip: Clip): number {
  if (clip.trim_in_s != null && clip.trim_out_s != null) {
    return clip.trim_out_s - clip.trim_in_s
  }
  return clip.duration_s ?? 0
}

/**
 * Format a number of seconds as m:ss.d (one decimal place).
 * e.g. 63.45 → "1:03.4"
 */
export function formatTimestamp(seconds: number): string {
  const totalSeconds = Math.max(0, seconds)
  const minutes = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  const wholeSecs = Math.floor(secs)
  const decimal = Math.floor((secs - wholeSecs) * 10)
  return `${minutes}:${String(wholeSecs).padStart(2, '0')}.${decimal}`
}
