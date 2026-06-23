import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  type MockedFunction,
} from 'vitest'
import { ApiError } from '@/types/api'

vi.mock('./client', () => ({
  request: vi.fn(),
}))

import { request } from './client'
import {
  createCompilation,
  getCompilation,
  compilationEventsPath,
} from './compilations'

const mockRequest = request as MockedFunction<typeof request>

describe('compilations service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createCompilation', () => {
    it('calls request with POST /api/compilations and body', async () => {
      mockRequest.mockResolvedValueOnce({ id: 'comp_1' })

      const input = {
        clips: [{ id: 'clip_1', trim_in_s: 0, trim_out_s: 10 }],
        soundtrack_id: 'track_1',
      }
      const result = await createCompilation(input)

      expect(mockRequest).toHaveBeenCalledWith('/api/compilations', {
        method: 'POST',
        body: JSON.stringify(input),
      })
      expect(result).toEqual({ id: 'comp_1' })
    })

    it('propagates ApiError with status 409 on conflict', async () => {
      mockRequest.mockRejectedValueOnce(
        new ApiError(409, 'conflict', 'A compilation is already running')
      )

      const input = {
        clips: [{ id: 'clip_1', trim_in_s: 0, trim_out_s: 10 }],
        soundtrack_id: 'track_1',
      }

      const err = await createCompilation(input).catch((e: unknown) => e)
      expect(err).toBeInstanceOf(ApiError)
      expect((err as ApiError).status).toBe(409)
    })
  })

  describe('getCompilation', () => {
    it('calls request with /api/compilations/:id', async () => {
      const compilation = {
        id: 'comp_1',
        status: 'running' as const,
        progress: 50,
      }
      mockRequest.mockResolvedValueOnce(compilation)

      const result = await getCompilation('comp_1')

      expect(mockRequest).toHaveBeenCalledWith('/api/compilations/comp_1')
      expect(result).toEqual(compilation)
    })
  })

  describe('compilationEventsPath', () => {
    it('returns the correct same-origin proxy path', () => {
      expect(compilationEventsPath('comp_1')).toBe(
        '/api/compilations/comp_1/events'
      )
    })

    it('URL-encodes the id', () => {
      expect(compilationEventsPath('comp/1')).toBe(
        '/api/compilations/comp%2F1/events'
      )
    })
  })
})
