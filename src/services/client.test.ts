import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ApiError } from '@/types/api'

// Mock loggedFetch
vi.mock('@/lib/fetch', () => ({
  loggedFetch: vi.fn(),
}))

import { loggedFetch } from '@/lib/fetch'
import { request } from './client'

const mockLoggedFetch = vi.mocked(loggedFetch)

describe('request', () => {
  const originalEnv = process.env.BACKEND_URL

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.BACKEND_URL = 'http://localhost:8000'
  })

  afterEach(() => {
    process.env.BACKEND_URL = originalEnv
  })

  it('returns typed body on 2xx JSON response', async () => {
    const data = { id: 'clip_1', title: 'My Clip' }
    mockLoggedFetch.mockResolvedValueOnce(
      new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    const result = await request<typeof data>('/clips/clip_1')
    expect(result).toEqual(data)
  })

  it('returns undefined on 204 response', async () => {
    mockLoggedFetch.mockResolvedValueOnce(new Response(null, { status: 204 }))

    const result = await request<void>('/clips/clip_1', { method: 'DELETE' })
    expect(result).toBeUndefined()
  })

  it('throws ApiError with correct status/code/message on non-2xx with JSON error body', async () => {
    mockLoggedFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ code: 'NOT_FOUND', message: 'Clip not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    )

    await expect(request('/clips/missing')).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
      code: 'NOT_FOUND',
      message: 'Clip not found',
    })
  })

  it('throws ApiError with status and statusText on non-2xx with non-JSON body', async () => {
    mockLoggedFetch.mockResolvedValueOnce(
      new Response('Internal Server Error', {
        status: 500,
        statusText: 'Internal Server Error',
      })
    )

    await expect(request('/clips')).rejects.toMatchObject({
      name: 'ApiError',
      status: 500,
      code: 'unknown',
      message: 'Internal Server Error',
    })
  })

  it('builds URL including BACKEND_URL prefix', async () => {
    mockLoggedFetch.mockResolvedValueOnce(
      new Response(JSON.stringify([]), { status: 200 })
    )

    await request('/clips')

    expect(mockLoggedFetch).toHaveBeenCalledWith(
      'http://localhost:8000/clips',
      expect.any(Object)
    )
  })

  it('does not include Authorization header in request', async () => {
    mockLoggedFetch.mockResolvedValueOnce(
      new Response(JSON.stringify([]), { status: 200 })
    )

    await request('/clips')

    const callArgs = mockLoggedFetch.mock.calls[0]
    const init = callArgs[1] as RequestInit
    const headers = init?.headers as Record<string, string> | undefined
    expect(headers?.Authorization).toBeUndefined()
  })

  it('throws when BACKEND_URL is not set', async () => {
    delete process.env.BACKEND_URL

    await expect(request('/clips')).rejects.toThrow('BACKEND_URL is not set')
  })

  it('throws ApiError instance', async () => {
    mockLoggedFetch.mockResolvedValueOnce(
      new Response('{}', { status: 403, statusText: 'Forbidden' })
    )

    await expect(request('/clips')).rejects.toBeInstanceOf(ApiError)
  })
})
