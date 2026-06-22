import { describe, it, expect } from 'vitest'
import {
  timeToPixel,
  pixelToTime,
  clampSelection,
  initialSelection,
  effectiveDuration,
  formatTimestamp,
  MIN_SELECTION_S,
} from './lib'
import type { Clip } from '@/types/clip'

const baseClip: Clip = {
  id: 'clip_1',
  original_key: 'key',
  normalized_key: null,
  filmstrip_key: null,
  duration_s: 60,
  width: null,
  height: null,
  codec_name: null,
  recorded_at: null,
  uploaded_at: '2024-01-01T00:00:00Z',
  trim_in_s: null,
  trim_out_s: null,
  sort_index: 0,
  status: 'ready',
  error_message: null,
}

describe('timeToPixel', () => {
  it('maps 0 to 0', () => {
    expect(timeToPixel(0, 60, 600)).toBe(0)
  })

  it('maps full duration to full width', () => {
    expect(timeToPixel(60, 60, 600)).toBe(600)
  })

  it('maps mid-point correctly', () => {
    expect(timeToPixel(30, 60, 600)).toBe(300)
  })

  it('returns 0 when duration is 0', () => {
    expect(timeToPixel(10, 0, 600)).toBe(0)
  })

  it('returns 0 when width is 0', () => {
    expect(timeToPixel(10, 60, 0)).toBe(0)
  })
})

describe('pixelToTime', () => {
  it('maps 0 to 0', () => {
    expect(pixelToTime(0, 60, 600)).toBe(0)
  })

  it('maps full width to full duration', () => {
    expect(pixelToTime(600, 60, 600)).toBe(60)
  })

  it('maps mid-point correctly', () => {
    expect(pixelToTime(300, 60, 600)).toBe(30)
  })

  it('returns 0 when duration is 0', () => {
    expect(pixelToTime(300, 0, 600)).toBe(0)
  })

  it('returns 0 when width is 0', () => {
    expect(pixelToTime(300, 60, 0)).toBe(0)
  })
})

describe('clampSelection', () => {
  it('leaves a valid selection unchanged', () => {
    const sel = { in: 5, out: 55 }
    expect(clampSelection(sel, 60)).toEqual({ in: 5, out: 55 })
  })

  it('clamps in to 0 if negative', () => {
    const result = clampSelection({ in: -5, out: 30 }, 60)
    expect(result.in).toBe(0)
  })

  it('clamps out to duration if beyond', () => {
    const result = clampSelection({ in: 10, out: 70 }, 60)
    expect(result.out).toBe(60)
  })

  it('enforces minimum duration gap', () => {
    const result = clampSelection({ in: 29.9, out: 30 }, 60)
    expect(result.out - result.in).toBeGreaterThanOrEqual(MIN_SELECTION_S)
  })

  it('enforces minimum duration when handles cross', () => {
    const result = clampSelection({ in: 40, out: 20 }, 60)
    expect(result.out - result.in).toBeGreaterThanOrEqual(MIN_SELECTION_S)
    expect(result.in).toBeGreaterThanOrEqual(0)
    expect(result.out).toBeLessThanOrEqual(60)
  })

  it('respects custom minDuration', () => {
    const result = clampSelection({ in: 10, out: 11 }, 60, 2)
    expect(result.out - result.in).toBeGreaterThanOrEqual(2)
  })
})

describe('initialSelection', () => {
  it('uses trim_in_s and trim_out_s when set', () => {
    const clip = { ...baseClip, trim_in_s: 5, trim_out_s: 30 }
    expect(initialSelection(clip)).toEqual({ in: 5, out: 30 })
  })

  it('defaults in to 0 when trim_in_s is null', () => {
    const clip = { ...baseClip, trim_out_s: 30 }
    expect(initialSelection(clip)).toEqual({ in: 0, out: 30 })
  })

  it('defaults out to duration_s when trim_out_s is null', () => {
    const clip = { ...baseClip, trim_in_s: 5, duration_s: 60 }
    expect(initialSelection(clip)).toEqual({ in: 5, out: 60 })
  })

  it('defaults both to 0 when nothing is set and no duration', () => {
    const clip = { ...baseClip, duration_s: null }
    expect(initialSelection(clip)).toEqual({ in: 0, out: 0 })
  })
})

describe('effectiveDuration', () => {
  it('returns trimmed duration when both trim values are set', () => {
    const clip = { ...baseClip, trim_in_s: 5, trim_out_s: 25 }
    expect(effectiveDuration(clip)).toBe(20)
  })

  it('returns duration_s when trim values are null', () => {
    expect(effectiveDuration(baseClip)).toBe(60)
  })

  it('returns null when all values are null', () => {
    const clip = { ...baseClip, duration_s: null }
    expect(effectiveDuration(clip)).toBeNull()
  })

  it('uses duration_s when only trim_in_s is set (partial trim)', () => {
    const clip = { ...baseClip, trim_in_s: 5 }
    expect(effectiveDuration(clip)).toBe(60)
  })
})

describe('formatTimestamp', () => {
  it('formats 0 as 0:00.0', () => {
    expect(formatTimestamp(0)).toBe('0:00.0')
  })

  it('formats 63.45 as 1:03.4', () => {
    expect(formatTimestamp(63.45)).toBe('1:03.4')
  })

  it('formats 9.9 as 0:09.9', () => {
    expect(formatTimestamp(9.9)).toBe('0:09.9')
  })

  it('handles negative input (clamps to 0)', () => {
    expect(formatTimestamp(-5)).toBe('0:00.0')
  })

  it('formats exact minutes', () => {
    expect(formatTimestamp(120)).toBe('2:00.0')
  })

  it('formats sub-second correctly', () => {
    expect(formatTimestamp(0.5)).toBe('0:00.5')
  })
})
