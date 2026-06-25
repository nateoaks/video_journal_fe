import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  type MockedFunction,
} from 'vitest'

vi.mock('./client', () => ({
  request: vi.fn(),
}))

import { request } from './client'
import { getStorageUsage } from './storage'

const mockRequest = request as MockedFunction<typeof request>

describe('storage service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getStorageUsage calls request with /api/v1/storage/usage and cache: no-store', async () => {
    mockRequest.mockResolvedValueOnce({
      originals_bytes: 1000,
      normalized_bytes: 2000,
      filmstrips_bytes: 3000,
      soundtracks_bytes: 4000,
      outputs_bytes: 5000,
      total_bytes: 15000,
    })

    await getStorageUsage()

    expect(mockRequest).toHaveBeenCalledWith('/api/v1/storage/usage', {
      cache: 'no-store',
    })
  })

  it('getStorageUsage maps snake_case response to camelCase StorageUsage', async () => {
    mockRequest.mockResolvedValueOnce({
      originals_bytes: 1000,
      normalized_bytes: 2000,
      filmstrips_bytes: 3000,
      soundtracks_bytes: 4000,
      outputs_bytes: 5000,
      total_bytes: 15000,
    })

    const result = await getStorageUsage()

    expect(result).toEqual({
      originalsBytes: 1000,
      normalizedBytes: 2000,
      filmstripsBytes: 3000,
      soundtracksBytes: 4000,
      outputsBytes: 5000,
      totalBytes: 15000,
    })
  })
})
