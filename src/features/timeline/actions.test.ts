import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  type MockedFunction,
} from 'vitest'

vi.mock('@/services', () => ({
  patchClip: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { patchClip } from '@/services'
import { revalidatePath } from 'next/cache'
import { ApiError } from '@/types/api'

const mockPatchClip = patchClip as MockedFunction<typeof patchClip>
const mockRevalidatePath = revalidatePath as MockedFunction<
  typeof revalidatePath
>

// Import after mocks because of 'use server'
const { reorderClip } = await import('./actions')

describe('reorderClip', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns error for NaN sort_index', async () => {
    const result = await reorderClip('clip_1', NaN)
    expect(result.error).toBeDefined()
    expect(mockPatchClip).not.toHaveBeenCalled()
  })

  it('returns error for Infinity sort_index', async () => {
    const result = await reorderClip('clip_1', Infinity)
    expect(result.error).toBeDefined()
    expect(mockPatchClip).not.toHaveBeenCalled()
  })

  it('calls patchClip with the correct id and sort_index, revalidates both paths, returns {}', async () => {
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
      trim_in_s: null,
      trim_out_s: null,
      sort_index: 1.5,
      error_message: null,
    })

    const result = await reorderClip('clip_1', 1.5)

    expect(result.error).toBeUndefined()
    expect(mockPatchClip).toHaveBeenCalledWith('clip_1', { sort_index: 1.5 })
    expect(mockRevalidatePath).toHaveBeenCalledWith('/timeline')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/library')
  })

  it('returns { error } when patchClip throws ApiError', async () => {
    mockPatchClip.mockRejectedValueOnce(
      new ApiError(404, 'NOT_FOUND', 'Clip not found')
    )

    const result = await reorderClip('clip_1', 2.5)

    expect(result).toEqual({ error: 'Clip not found' })
    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })

  it('re-throws unexpected errors', async () => {
    mockPatchClip.mockRejectedValueOnce(new Error('Network failure'))

    await expect(reorderClip('clip_1', 2.5)).rejects.toThrow('Network failure')
  })
})
