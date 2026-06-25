import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ApiError } from '@/types/api'
import type { Clip } from '@/types/clip'

vi.mock('@/services/compilations', () => ({
  createCompilation: vi.fn(),
  deleteCompilation: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { createCompilation, deleteCompilation } from '@/services/compilations'
import { startCompilation, deleteCompilationAction } from './actions'

const mockCreateCompilation = createCompilation as ReturnType<typeof vi.fn>
const mockDeleteCompilation = deleteCompilation as ReturnType<typeof vi.fn>

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

describe('deleteCompilationAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns validation error for non-UUID id', async () => {
    const result = await deleteCompilationAction('not-a-uuid')
    expect(result.error).toBeDefined()
  })

  it('returns {} on success', async () => {
    mockDeleteCompilation.mockResolvedValueOnce(undefined)
    const result = await deleteCompilationAction(
      '550e8400-e29b-41d4-a716-446655440001'
    )
    expect(result).toEqual({})
    expect(mockDeleteCompilation).toHaveBeenCalledWith(
      '550e8400-e29b-41d4-a716-446655440001'
    )
  })

  it('returns {} on 404 (treat as removed)', async () => {
    mockDeleteCompilation.mockRejectedValueOnce(
      new ApiError(404, 'not_found', 'Not found')
    )
    const result = await deleteCompilationAction(
      '550e8400-e29b-41d4-a716-446655440001'
    )
    expect(result).toEqual({})
  })

  it('returns error message on 409 conflict', async () => {
    mockDeleteCompilation.mockRejectedValueOnce(
      new ApiError(409, 'conflict', 'Running')
    )
    const result = await deleteCompilationAction(
      '550e8400-e29b-41d4-a716-446655440001'
    )
    expect(result.error).toMatch(/running/i)
  })

  it('returns error message on other ApiError', async () => {
    mockDeleteCompilation.mockRejectedValueOnce(
      new ApiError(500, 'server_error', 'Internal error')
    )
    const result = await deleteCompilationAction(
      '550e8400-e29b-41d4-a716-446655440001'
    )
    expect(result.error).toBe('Internal error')
  })

  it('rethrows non-ApiError', async () => {
    mockDeleteCompilation.mockRejectedValueOnce(new Error('network failure'))
    await expect(
      deleteCompilationAction('550e8400-e29b-41d4-a716-446655440001')
    ).rejects.toThrow('network failure')
  })
})

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

  it('returns { id } with mixClipAudio and clipAudioVolume', async () => {
    mockCreateCompilation.mockResolvedValueOnce({ id: 'comp_2' })

    const clips = [makeClip({ status: 'ready' })]
    const result = await startCompilation(clips, 'track_1', true, 50)

    expect(result).toEqual({ id: 'comp_2' })
    expect(mockCreateCompilation).toHaveBeenCalledWith(
      expect.objectContaining({
        mix_clip_audio: true,
        clip_audio_volume: 0.5,
      })
    )
  })

  it('passes mix_clip_audio: false and clip_audio_volume: 0 by default', async () => {
    mockCreateCompilation.mockResolvedValueOnce({ id: 'comp_3' })

    const clips = [makeClip({ status: 'ready' })]
    await startCompilation(clips, 'track_1')

    expect(mockCreateCompilation).toHaveBeenCalledWith(
      expect.objectContaining({
        mix_clip_audio: false,
        clip_audio_volume: 0,
      })
    )
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

  it('returns validation error when clipAudioVolume is out of range (> 100)', async () => {
    const clips = [makeClip({ status: 'ready' })]
    const result = await startCompilation(clips, 'track_1', true, 150)
    expect('error' in result).toBe(true)
  })

  it('returns validation error when clipAudioVolume is out of range (< 0)', async () => {
    const clips = [makeClip({ status: 'ready' })]
    const result = await startCompilation(clips, 'track_1', true, -5)
    expect('error' in result).toBe(true)
  })
})
