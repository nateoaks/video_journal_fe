import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services', () => ({
  patchClip: vi.fn(),
  deleteClip: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { patchClip, deleteClip as deleteClipService } from '@/services'
import { revalidatePath } from 'next/cache'
import { ApiError } from '@/types/api'

const mockPatchClip = vi.mocked(patchClip)
const mockDeleteClipService = vi.mocked(deleteClipService)
const mockRevalidatePath = vi.mocked(revalidatePath)

// Actions use 'use server' so we import them after mocks
const { updateClip, deleteClip } = await import('./actions')

describe('updateClip', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns error for invalid trim_in_s (non-numeric)', async () => {
    const formData = new FormData()
    formData.set('trim_in_s', 'not-a-number')

    const result = await updateClip('clip_1', undefined, formData)

    expect(result.error).toBeDefined()
    expect(mockPatchClip).not.toHaveBeenCalled()
  })

  it('calls patchClip and revalidatePath with valid trim values and returns {}', async () => {
    mockPatchClip.mockResolvedValueOnce({
      id: 'clip_1',
      status: 'ready',
      uploaded_at: '2024-01-01T00:00:00Z',
      original_key: 'key',
      normalized_key: null,
      filmstrip_key: null,
      duration_s: null,
      width: null,
      height: null,
      codec_name: null,
      recorded_at: null,
      trim_in_s: 1.5,
      trim_out_s: 10.0,
      sort_index: 0,
      error_message: null,
    })

    const formData = new FormData()
    formData.set('trim_in_s', '1.5')
    formData.set('trim_out_s', '10.0')

    const result = await updateClip('clip_1', undefined, formData)

    expect(result.error).toBeUndefined()
    expect(mockPatchClip).toHaveBeenCalledWith('clip_1', {
      trim_in_s: 1.5,
      trim_out_s: 10.0,
    })
    expect(mockRevalidatePath).toHaveBeenCalledWith('/library')
  })
})

describe('deleteClip', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls service deleteClip and revalidatePath, returns {}', async () => {
    mockDeleteClipService.mockResolvedValueOnce(undefined)

    const result = await deleteClip('clip_1')

    expect(result).toEqual({})
    expect(mockDeleteClipService).toHaveBeenCalledWith('clip_1')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/library')
  })

  it('returns { error } when service throws ApiError', async () => {
    mockDeleteClipService.mockRejectedValueOnce(
      new ApiError(404, 'NOT_FOUND', 'Clip not found')
    )

    const result = await deleteClip('clip_1')

    expect(result).toEqual({ error: 'Clip not found' })
    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })

  it('re-throws unexpected errors', async () => {
    mockDeleteClipService.mockRejectedValueOnce(new Error('Network failure'))

    await expect(deleteClip('clip_1')).rejects.toThrow('Network failure')
  })
})
