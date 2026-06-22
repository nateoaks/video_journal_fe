import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  type MockedFunction,
} from 'vitest'

vi.mock('@/services', () => ({
  deleteClip: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { deleteClip as deleteClipService } from '@/services'
import { revalidatePath } from 'next/cache'
import { ApiError } from '@/types/api'

const mockDeleteClipService = deleteClipService as MockedFunction<
  typeof deleteClipService
>
const mockRevalidatePath = revalidatePath as MockedFunction<
  typeof revalidatePath
>

const { deleteClipAction } = await import('./actions')

describe('deleteClipAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls service and revalidatePath, returns {}', async () => {
    mockDeleteClipService.mockResolvedValueOnce(undefined)

    const result = await deleteClipAction('clip_1')

    expect(result).toEqual({})
    expect(mockDeleteClipService).toHaveBeenCalledWith('clip_1')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/library')
  })

  it('returns { error } when service throws ApiError', async () => {
    mockDeleteClipService.mockRejectedValueOnce(
      new ApiError(404, 'NOT_FOUND', 'Clip not found')
    )

    const result = await deleteClipAction('clip_1')

    expect(result).toEqual({ error: 'Clip not found' })
  })

  it('re-throws unexpected errors', async () => {
    mockDeleteClipService.mockRejectedValueOnce(new Error('Network failure'))

    await expect(deleteClipAction('clip_1')).rejects.toThrow('Network failure')
  })
})
