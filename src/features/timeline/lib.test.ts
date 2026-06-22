import { describe, it, expect } from 'vitest'
import { computeDroppedSortIndex, needsRenumber } from './lib'
import type { Clip } from './types'

function makeClip(id: string, sortIndex: number): Clip {
  return {
    id,
    original_key: `uploads/${id}.mp4`,
    normalized_key: null,
    filmstrip_key: null,
    duration_s: 60,
    width: 1920,
    height: 1080,
    codec_name: 'h264',
    recorded_at: '2024-03-15T10:00:00.000Z',
    uploaded_at: '2024-03-15T10:01:00.000Z',
    trim_in_s: null,
    trim_out_s: null,
    sort_index: sortIndex,
    status: 'ready',
    error_message: null,
  }
}

// clips with sort_index 1, 2, 3, 4, 5
const clips = [
  makeClip('a', 1),
  makeClip('b', 2),
  makeClip('c', 3),
  makeClip('d', 4),
  makeClip('e', 5),
]

describe('computeDroppedSortIndex', () => {
  it('returns original sort_index when position does not change', () => {
    const result = computeDroppedSortIndex(clips, 2, 2)
    expect(result).toBe(3) // clips[2].sort_index
  })

  it('computes midpoint when dropped between two existing clips', () => {
    // Move 'e' (index 4) to index 1 — between 'a' (1) and 'b' (2)
    const result = computeDroppedSortIndex(clips, 4, 1)
    expect(result).toBe(1.5) // (1 + 2) / 2
  })

  it('returns half of next clip index when dropped at start', () => {
    // Move 'e' (index 4) to index 0 — before 'a' (1)
    const result = computeDroppedSortIndex(clips, 4, 0)
    expect(result).toBe(0.5) // 1 / 2
  })

  it('returns last index + 1 when dropped at end', () => {
    // Move 'a' (index 0) to index 4 — after 'e' (5)
    const result = computeDroppedSortIndex(clips, 0, 4)
    expect(result).toBe(6) // 5 + 1
  })

  it('handles a single-clip array — does not change position', () => {
    const single = [makeClip('a', 1)]
    const result = computeDroppedSortIndex(single, 0, 0)
    expect(result).toBe(1)
  })

  it('handles move from index 0 to last position', () => {
    // Move 'a' (index 0) to index 4 (end)
    const result = computeDroppedSortIndex(clips, 0, 4)
    expect(result).toBe(6) // prev = clips[3] = 'd' (4), no next → 4 + 1
  })

  it('handles move to second-to-last position', () => {
    // Move 'a' (index 0) to index 3 — between 'd' (4) and 'e' (5)
    const result = computeDroppedSortIndex(clips, 0, 3)
    expect(result).toBe(4.5) // (4 + 5) / 2
  })
})

describe('needsRenumber', () => {
  it('returns false for well-spaced clips', () => {
    expect(needsRenumber(clips)).toBe(false)
  })

  it('returns true when two adjacent clips have nearly identical sort_index', () => {
    const crowded = [
      makeClip('a', 1),
      makeClip('b', 1 + Number.EPSILON * 5), // within threshold
    ]
    expect(needsRenumber(crowded)).toBe(true)
  })

  it('returns false for an empty array', () => {
    expect(needsRenumber([])).toBe(false)
  })

  it('returns false for a single-clip array', () => {
    expect(needsRenumber([makeClip('a', 1)])).toBe(false)
  })
})
