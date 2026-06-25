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
  listCompilations,
  deleteCompilation,
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
        mix_clip_audio: false,
        clip_audio_volume: 0.4,
      }
      const result = await createCompilation(input)

      expect(mockRequest).toHaveBeenCalledWith('/api/v1/compilations', {
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
        mix_clip_audio: false,
        clip_audio_volume: 0.4,
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

      expect(mockRequest).toHaveBeenCalledWith('/api/v1/compilations/comp_1')
      expect(result).toEqual(compilation)
    })
  })

  describe('listCompilations', () => {
    it('calls request with GET /api/v1/compilations?limit=50&offset=0 by default', async () => {
      const compilations = [{ id: 'comp_1', status: 'complete' as const }]
      mockRequest.mockResolvedValueOnce(compilations)

      const result = await listCompilations()

      expect(mockRequest).toHaveBeenCalledWith(
        '/api/v1/compilations?limit=50&offset=0'
      )
      expect(result).toEqual(compilations)
    })

    it('propagates ApiError', async () => {
      mockRequest.mockRejectedValueOnce(
        new ApiError(401, 'unauthorized', 'Unauthorized')
      )

      const err = await listCompilations().catch((e: unknown) => e)
      expect(err).toBeInstanceOf(ApiError)
      expect((err as ApiError).status).toBe(401)
    })
  })

  describe('deleteCompilation', () => {
    it('calls request with DELETE /api/v1/compilations/:id', async () => {
      mockRequest.mockResolvedValueOnce(undefined)

      await deleteCompilation('comp_1')

      expect(mockRequest).toHaveBeenCalledWith('/api/v1/compilations/comp_1', {
        method: 'DELETE',
      })
    })

    it('propagates ApiError with 404 when compilation not found', async () => {
      mockRequest.mockRejectedValueOnce(
        new ApiError(404, 'not_found', 'Compilation not found')
      )

      const err = await deleteCompilation('missing_id').catch((e: unknown) => e)
      expect(err).toBeInstanceOf(ApiError)
      expect((err as ApiError).status).toBe(404)
    })

    it('propagates ApiError with 409 when compilation is running', async () => {
      mockRequest.mockRejectedValueOnce(
        new ApiError(409, 'conflict', 'Cannot delete a running compilation')
      )

      const err = await deleteCompilation('running_id').catch((e: unknown) => e)
      expect(err).toBeInstanceOf(ApiError)
      expect((err as ApiError).status).toBe(409)
    })
  })

  describe('compilationEventsPath', () => {
    it('returns the correct same-origin proxy path', () => {
      expect(compilationEventsPath('comp_1')).toBe(
        '/api/v1/compilations/comp_1/events'
      )
    })

    it('URL-encodes the id', () => {
      expect(compilationEventsPath('comp/1')).toBe(
        '/api/v1/compilations/comp%2F1/events'
      )
    })
  })
})
