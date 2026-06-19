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

  it('returns error for empty title', async () => {
    const formData = new FormData()
    formData.set('title', '')

    const result = await updateClip('clip_1', undefined, formData)

    expect(result.error).toBeDefined()
    expect(mockPatchClip).not.toHaveBeenCalled()
  })

  it('calls patchClip and revalidatePath with valid formData and returns {}', async () => {
    mockPatchClip.mockResolvedValueOnce({
      id: 'clip_1',
      title: 'Updated Title',
      status: 'ready',
      createdAt: '2024-01-01T00:00:00Z',
    })

    const formData = new FormData()
    formData.set('title', 'Updated Title')

    const result = await updateClip('clip_1', undefined, formData)

    expect(result.error).toBeUndefined()
    expect(mockPatchClip).toHaveBeenCalledWith('clip_1', {
      title: 'Updated Title',
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
