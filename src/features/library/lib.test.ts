import { describe, it, expect } from 'vitest'
import { sortClips, effectiveDuration, clipFilmstripPath } from './lib'
import type { Clip } from './types'

function makeClip(overrides: Partial<Clip>): Clip {
  return {
    id: 'clip-1',
    original_key: 'uploads/test.mp4',
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
    sort_index: 0,
    status: 'ready',
    error_message: null,
    ...overrides,
  }
}

describe('sortClips', () => {
  it('sorts clips by sort_index ascending', () => {
    const clips = [
      makeClip({ id: 'c', sort_index: 3 }),
      makeClip({ id: 'a', sort_index: 1 }),
      makeClip({ id: 'b', sort_index: 2 }),
    ]
    const sorted = sortClips(clips)
    expect(sorted.map((c) => c.id)).toEqual(['a', 'b', 'c'])
  })

  it('does not mutate the original array', () => {
    const clips = [
      makeClip({ id: 'b', sort_index: 2 }),
      makeClip({ id: 'a', sort_index: 1 }),
    ]
    const original = [...clips]
    sortClips(clips)
    expect(clips[0].id).toBe(original[0].id)
  })

  it('handles an empty array', () => {
    expect(sortClips([])).toEqual([])
  })
})

describe('effectiveDuration', () => {
  it('returns duration_s when no trim fields are set', () => {
    const clip = makeClip({ duration_s: 120, trim_in_s: null, trim_out_s: null })
    expect(effectiveDuration(clip)).toBe(120)
  })

  it('returns trimmed runtime when both trim fields are set', () => {
    const clip = makeClip({ duration_s: 120, trim_in_s: 10, trim_out_s: 50 })
    expect(effectiveDuration(clip)).toBe(40)
  })

  it('returns duration_s when only trim_in_s is set', () => {
    const clip = makeClip({ duration_s: 120, trim_in_s: 10, trim_out_s: null })
    expect(effectiveDuration(clip)).toBe(120)
  })

  it('returns duration_s when only trim_out_s is set', () => {
    const clip = makeClip({ duration_s: 120, trim_in_s: null, trim_out_s: 50 })
    expect(effectiveDuration(clip)).toBe(120)
  })

  it('returns null when duration_s is null and no trim fields', () => {
    const clip = makeClip({ duration_s: null, trim_in_s: null, trim_out_s: null })
    expect(effectiveDuration(clip)).toBeNull()
  })
})

describe('clipFilmstripPath', () => {
  it('returns a proxy path for the given clip id', () => {
    expect(clipFilmstripPath('abc-123')).toBe('/api/v1/clips/abc-123/filmstrip')
  })

  it('URL-encodes special characters in clip id', () => {
    expect(clipFilmstripPath('id/with spaces')).toBe(
      '/api/v1/clips/id%2Fwith%20spaces/filmstrip'
    )
  })
})
