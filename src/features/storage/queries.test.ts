import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  type MockedFunction,
} from 'vitest'

vi.mock('@/services/storage', () => ({
  getStorageUsage: vi.fn(),
}))

import { getStorageUsage } from '@/services/storage'
import { getStorageUsageSafe } from './queries'

const mockGetStorageUsage = getStorageUsage as MockedFunction<
  typeof getStorageUsage
>

const exampleUsage = {
  originalsBytes: 1000,
  normalizedBytes: 2000,
  filmstripsBytes: 3000,
  soundtracksBytes: 4000,
  outputsBytes: 5000,
  totalBytes: 15000,
}

describe('getStorageUsageSafe', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns StorageUsage on success', async () => {
    mockGetStorageUsage.mockResolvedValueOnce(exampleUsage)

    const result = await getStorageUsageSafe()

    expect(result).toEqual(exampleUsage)
  })

  it('returns null when the service throws', async () => {
    mockGetStorageUsage.mockRejectedValueOnce(new Error('Network error'))

    const result = await getStorageUsageSafe()

    expect(result).toBeNull()
  })
})
