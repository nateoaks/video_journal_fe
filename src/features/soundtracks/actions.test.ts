import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  type MockedFunction,
} from 'vitest'

vi.mock('@/services', () => ({
  deleteSoundtrack: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { deleteSoundtrack as deleteSoundtrackService } from '@/services'
import { revalidatePath } from 'next/cache'
import { ApiError } from '@/types/api'

const mockDelete = deleteSoundtrackService as MockedFunction<
  typeof deleteSoundtrackService
>
const mockRevalidatePath = revalidatePath as MockedFunction<
  typeof revalidatePath
>

// Actions use 'use server' so we import them after mocks
const { deleteSoundtrackAction } = await import('./actions')

describe('deleteSoundtrackAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns {} on success and calls revalidatePath', async () => {
    mockDelete.mockResolvedValueOnce(undefined)

    const result = await deleteSoundtrackAction('st_1')

    expect(result).toEqual({})
    expect(mockDelete).toHaveBeenCalledWith('st_1')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/soundtracks')
  })

  it('returns { error } when service throws ApiError', async () => {
    mockDelete.mockRejectedValueOnce(
      new ApiError(404, 'NOT_FOUND', 'Soundtrack not found')
    )

    const result = await deleteSoundtrackAction('st_1')

    expect(result).toEqual({ error: 'Soundtrack not found' })
    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })

  it('re-throws non-ApiError errors', async () => {
    mockDelete.mockRejectedValueOnce(new Error('Network failure'))

    await expect(deleteSoundtrackAction('st_1')).rejects.toThrow(
      'Network failure'
    )
  })

  it('returns error when id is empty string (Zod validation)', async () => {
    const result = await deleteSoundtrackAction('')

    expect(result.error).toBeDefined()
    expect(mockDelete).not.toHaveBeenCalled()
  })
})
