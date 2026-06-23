import { describe, it, expect } from 'vitest'
import {
  canCompile,
  buildCompilePayload,
  isTerminal,
  parseProgressEvent,
} from './lib'
import type { Clip } from '@/types/clip'

function makeClip(overrides: Partial<Clip> = {}): Clip {
  return {
    id: 'clip_1',
    original_key: 'key',
    normalized_key: null,
    filmstrip_key: null,
    duration_s: 10,
    width: 1920,
    height: 1080,
    codec_name: 'h264',
    recorded_at: null,
    uploaded_at: '2024-01-01T00:00:00Z',
    trim_in_s: null,
    trim_out_s: null,
    sort_index: 0,
    status: 'ready',
    error_message: null,
    ...overrides,
  }
}

describe('canCompile', () => {
  it('returns false when soundtrackId is null', () => {
    expect(canCompile([makeClip()], null)).toBe(false)
  })

  it('returns false when there are no clips', () => {
    expect(canCompile([], 'track_1')).toBe(false)
  })

  it('returns false when no clips have status ready', () => {
    const clips = [
      makeClip({ status: 'processing' }),
      makeClip({ status: 'failed' }),
    ]
    expect(canCompile(clips, 'track_1')).toBe(false)
  })

  it('returns true when at least one ready clip and soundtrackId is non-null', () => {
    const clips = [
      makeClip({ status: 'ready' }),
      makeClip({ status: 'processing' }),
    ]
    expect(canCompile(clips, 'track_1')).toBe(true)
  })

  it('returns true when all clips are ready', () => {
    const clips = [
      makeClip({ status: 'ready' }),
      makeClip({ id: 'clip_2', status: 'ready' }),
    ]
    expect(canCompile(clips, 'track_1')).toBe(true)
  })
})

describe('buildCompilePayload', () => {
  it('filters out non-ready clips', () => {
    const clips = [
      makeClip({ id: 'a', status: 'ready', sort_index: 0 }),
      makeClip({ id: 'b', status: 'processing', sort_index: 1 }),
      makeClip({ id: 'c', status: 'failed', sort_index: 2 }),
    ]

    const payload = buildCompilePayload(clips, 'track_1')
    expect(payload.clips).toHaveLength(1)
    expect(payload.clips[0].id).toBe('a')
  })

  it('sorts clips by sort_index ascending', () => {
    const clips = [
      makeClip({ id: 'c', sort_index: 2, status: 'ready' }),
      makeClip({ id: 'a', sort_index: 0, status: 'ready' }),
      makeClip({ id: 'b', sort_index: 1, status: 'ready' }),
    ]

    const payload = buildCompilePayload(clips, 'track_1')
    expect(payload.clips.map((c) => c.id)).toEqual(['a', 'b', 'c'])
  })

  it('includes trim_in_s and trim_out_s from the clip', () => {
    const clip = makeClip({
      id: 'a',
      status: 'ready',
      trim_in_s: 1.5,
      trim_out_s: 8.0,
      duration_s: 10,
    })

    const payload = buildCompilePayload([clip], 'track_1')
    expect(payload.clips[0].trim_in_s).toBe(1.5)
    expect(payload.clips[0].trim_out_s).toBe(8.0)
  })

  it('defaults trim_in_s to 0 when null', () => {
    const clip = makeClip({
      id: 'a',
      status: 'ready',
      trim_in_s: null,
      duration_s: 10,
    })
    const payload = buildCompilePayload([clip], 'track_1')
    expect(payload.clips[0].trim_in_s).toBe(0)
  })

  it('defaults trim_out_s to duration_s when null', () => {
    const clip = makeClip({
      id: 'a',
      status: 'ready',
      trim_out_s: null,
      duration_s: 10,
    })
    const payload = buildCompilePayload([clip], 'track_1')
    expect(payload.clips[0].trim_out_s).toBe(10)
  })

  it('includes soundtrack_id in the payload', () => {
    const payload = buildCompilePayload([makeClip()], 'track_abc')
    expect(payload.soundtrack_id).toBe('track_abc')
  })
})

describe('isTerminal', () => {
  it('returns true for complete', () => {
    expect(isTerminal('complete')).toBe(true)
  })

  it('returns true for failed', () => {
    expect(isTerminal('failed')).toBe(true)
  })

  it('returns false for queued', () => {
    expect(isTerminal('queued')).toBe(false)
  })

  it('returns false for running', () => {
    expect(isTerminal('running')).toBe(false)
  })
})

describe('parseProgressEvent', () => {
  it('parses a valid event', () => {
    const result = parseProgressEvent(
      JSON.stringify({ status: 'running', progress: 42 })
    )
    expect(result).toEqual({ status: 'running', progress: 42 })
  })

  it('includes error when present', () => {
    const result = parseProgressEvent(
      JSON.stringify({ status: 'failed', progress: 0, error: 'Oops' })
    )
    expect(result?.error).toBe('Oops')
  })

  it('includes output_key when present', () => {
    const result = parseProgressEvent(
      JSON.stringify({
        status: 'complete',
        progress: 100,
        output_key: 'out/file.mp4',
      })
    )
    expect(result?.output_key).toBe('out/file.mp4')
  })

  it('returns null for invalid JSON', () => {
    expect(parseProgressEvent('not json')).toBeNull()
  })

  it('returns null when status is missing', () => {
    expect(parseProgressEvent(JSON.stringify({ progress: 50 }))).toBeNull()
  })

  it('returns null when progress is not a number', () => {
    expect(
      parseProgressEvent(
        JSON.stringify({ status: 'running', progress: 'fast' })
      )
    ).toBeNull()
  })

  it('returns null for null input parsed as JSON', () => {
    expect(parseProgressEvent('null')).toBeNull()
  })
})
