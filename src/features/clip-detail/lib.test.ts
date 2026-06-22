import { describe, it, expect } from 'vitest'
import { findNeighbors } from './lib'
import type { Clip } from '@/types/clip'

function makeClip(id: string, sort_index: number): Clip {
  return {
    id,
    sort_index,
    original_key: `key-${id}`,
    normalized_key: null,
    filmstrip_key: null,
    duration_s: null,
    width: null,
    height: null,
    codec_name: null,
    recorded_at: null,
    uploaded_at: '2024-01-01T00:00:00Z',
    trim_in_s: null,
    trim_out_s: null,
    status: 'ready',
    error_message: null,
  }
}

const clips = [makeClip('a', 0), makeClip('b', 1), makeClip('c', 2)]

describe('findNeighbors', () => {
  it('returns both neighbors for a middle clip', () => {
    expect(findNeighbors(clips, 'b')).toEqual({ prevId: 'a', nextId: 'c' })
  })

  it('returns null prevId for the first clip', () => {
    expect(findNeighbors(clips, 'a')).toEqual({ prevId: null, nextId: 'b' })
  })

  it('returns null nextId for the last clip', () => {
    expect(findNeighbors(clips, 'c')).toEqual({ prevId: 'b', nextId: null })
  })

  it('returns both null for a single-clip list', () => {
    expect(findNeighbors([makeClip('x', 0)], 'x')).toEqual({
      prevId: null,
      nextId: null,
    })
  })

  it('returns both null when clip is not present', () => {
    expect(findNeighbors(clips, 'z')).toEqual({ prevId: null, nextId: null })
  })
})
