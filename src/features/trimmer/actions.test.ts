import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services', () => ({
  patchClip: vi.fn(),
  getClip: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { patchClip, getClip } from '@/services'
import { revalidatePath } from 'next/cache'

const mockPatchClip = vi.mocked(patchClip)
const mockGetClip = vi.mocked(getClip)
const mockRevalidatePath = vi.mocked(revalidatePath)

// Actions use 'use server' so we import them after mocks
const { saveTrim } = await import('./actions')

const clipResponse = {
  id: 'clip_1',
  status: 'ready' as const,
  uploaded_at: '2024-01-01T00:00:00Z',
  original_key: 'key',
  normalized_key: null,
  filmstrip_key: null,
  duration_s: 60,
  width: null,
  height: null,
  codec_name: null,
  recorded_at: null,
  trim_in_s: 1.5,
  trim_out_s: 10.0,
  sort_index: 0,
  error_message: null,
}

describe('saveTrim', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: getClip returns a 60-second clip
    mockGetClip.mockResolvedValue(clipResponse)
  })

  it('returns error for negative trimIn', async () => {
    const result = await saveTrim('clip_1', -1, 10)
    expect(result.error).toBeDefined()
    expect(mockPatchClip).not.toHaveBeenCalled()
  })

  it('returns error for NaN trimIn', async () => {
    const result = await saveTrim('clip_1', NaN, 10)
    expect(result.error).toBeDefined()
    expect(mockPatchClip).not.toHaveBeenCalled()
  })

  it('returns error for Infinity trimOut', async () => {
    const result = await saveTrim('clip_1', 0, Infinity)
    expect(result.error).toBeDefined()
    expect(mockPatchClip).not.toHaveBeenCalled()
  })

  it('returns error when trimOut <= trimIn', async () => {
    const result = await saveTrim('clip_1', 10, 5)
    expect(result.error).toBeDefined()
    expect(mockPatchClip).not.toHaveBeenCalled()
  })

  it('returns error when trimOut === trimIn', async () => {
    const result = await saveTrim('clip_1', 5, 5)
    expect(result.error).toBeDefined()
    expect(mockPatchClip).not.toHaveBeenCalled()
  })

  it('returns error when trimOut exceeds clip duration_s', async () => {
    // clip is 60s; caller passes trimOut = 61
    const result = await saveTrim('clip_1', 0, 61)
    expect(result.error).toBe('Trim end exceeds clip duration')
    expect(mockPatchClip).not.toHaveBeenCalled()
  })

  it('allows trimOut exactly equal to clip duration_s', async () => {
    mockPatchClip.mockResolvedValueOnce(clipResponse)

    const result = await saveTrim('clip_1', 0, 60)

    expect(result.error).toBeUndefined()
    expect(mockPatchClip).toHaveBeenCalledWith('clip_1', {
      trim_in_s: 0,
      trim_out_s: 60,
    })
  })

  it('skips duration check when clip duration_s is null', async () => {
    mockGetClip.mockResolvedValueOnce({ ...clipResponse, duration_s: null })
    mockPatchClip.mockResolvedValueOnce(clipResponse)

    // Even a very large trimOut passes when duration is unknown
    const result = await saveTrim('clip_1', 0, 9999)

    expect(result.error).toBeUndefined()
    expect(mockPatchClip).toHaveBeenCalled()
  })

  it('passes valid floats un-rounded to patchClip and calls revalidatePath', async () => {
    mockPatchClip.mockResolvedValueOnce(clipResponse)

    const result = await saveTrim('clip_1', 1.5, 10.75)

    expect(result.error).toBeUndefined()
    expect(mockPatchClip).toHaveBeenCalledWith('clip_1', {
      trim_in_s: 1.5,
      trim_out_s: 10.75,
    })
    expect(mockRevalidatePath).toHaveBeenCalledWith('/library')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/library/[clipId]', 'page')
  })

  it('passes trimIn of 0 as a valid value', async () => {
    mockPatchClip.mockResolvedValueOnce(clipResponse)

    const result = await saveTrim('clip_1', 0, 30)

    expect(result.error).toBeUndefined()
    expect(mockPatchClip).toHaveBeenCalledWith('clip_1', {
      trim_in_s: 0,
      trim_out_s: 30,
    })
  })
})
