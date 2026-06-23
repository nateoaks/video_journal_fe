import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ApiError } from '@/types/api'
import type { Clip } from '@/types/clip'

vi.mock('@/services/compilations', () => ({
  createCompilation: vi.fn(),
}))

import { createCompilation } from '@/services/compilations'
import { startCompilation } from './actions'

const mockCreateCompilation = createCompilation as ReturnType<typeof vi.fn>

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
    trim_in_s: 0,
    trim_out_s: 10,
    sort_index: 0,
    status: 'ready',
    error_message: null,
    ...overrides,
  }
}

describe('startCompilation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns error when no ready clips produce a valid payload', async () => {
    const clips = [makeClip({ status: 'processing' })]
    const result = await startCompilation(clips, 'track_1')
    expect('error' in result).toBe(true)
  })

  it('returns { id } on happy path', async () => {
    mockCreateCompilation.mockResolvedValueOnce({ id: 'comp_1' })

    const clips = [makeClip({ status: 'ready' })]
    const result = await startCompilation(clips, 'track_1')

    expect(result).toEqual({ id: 'comp_1' })
    expect(mockCreateCompilation).toHaveBeenCalledOnce()
  })

  it('returns { error, conflict: true } on 409 ApiError', async () => {
    mockCreateCompilation.mockRejectedValueOnce(
      new ApiError(409, 'conflict', 'Already running')
    )

    const clips = [makeClip({ status: 'ready' })]
    const result = await startCompilation(clips, 'track_1')

    expect(result).toEqual({
      error: 'A compilation is already in progress',
      conflict: true,
    })
  })

  it('returns { error: message } on other ApiError', async () => {
    mockCreateCompilation.mockRejectedValueOnce(
      new ApiError(500, 'server_error', 'Internal server error')
    )

    const clips = [makeClip({ status: 'ready' })]
    const result = await startCompilation(clips, 'track_1')

    expect(result).toEqual({ error: 'Internal server error' })
  })

  it('returns generic error on non-ApiError exception', async () => {
    mockCreateCompilation.mockRejectedValueOnce(new Error('network failure'))

    const clips = [makeClip({ status: 'ready' })]
    const result = await startCompilation(clips, 'track_1')

    expect(result).toEqual({ error: 'An unexpected error occurred' })
  })

  it('returns validation error when soundtrackId is empty', async () => {
    const clips = [makeClip({ status: 'ready' })]
    const result = await startCompilation(clips, '')
    expect('error' in result).toBe(true)
  })
})
