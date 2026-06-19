import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('./client', () => ({
  request: vi.fn(),
}))

import { request } from './client'
import {
  listClips,
  getClip,
  patchClip,
  deleteClip,
  buildClipVideoUrl,
  buildClipFilmstripUrl,
} from './clips'

const mockRequest = vi.mocked(request)

describe('clips service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.BACKEND_URL = 'http://localhost:8000'
  })

  it('listClips calls request with /api/v1/clips', async () => {
    mockRequest.mockResolvedValueOnce([])
    await listClips()
    expect(mockRequest).toHaveBeenCalledWith('/api/v1/clips')
  })

  it('getClip calls request with /api/v1/clips/:id', async () => {
    mockRequest.mockResolvedValueOnce({ id: 'clip_1' })
    await getClip('clip_1')
    expect(mockRequest).toHaveBeenCalledWith('/api/v1/clips/clip_1')
  })

  it('patchClip calls request with PATCH method and correct path', async () => {
    mockRequest.mockResolvedValueOnce({ id: 'clip_1' })
    await patchClip('clip_1', { trim_in_s: 1.5 })
    expect(mockRequest).toHaveBeenCalledWith('/api/v1/clips/clip_1', {
      method: 'PATCH',
      body: JSON.stringify({ trim_in_s: 1.5 }),
    })
  })

  it('deleteClip calls request with DELETE method and correct path', async () => {
    mockRequest.mockResolvedValueOnce(undefined)
    await deleteClip('clip_1')
    expect(mockRequest).toHaveBeenCalledWith('/api/v1/clips/clip_1', {
      method: 'DELETE',
    })
  })

  it('buildClipVideoUrl returns correct URL', () => {
    const url = buildClipVideoUrl('clip_1')
    expect(url).toBe('http://localhost:8000/api/v1/clips/clip_1/video')
  })

  it('buildClipFilmstripUrl returns correct URL', () => {
    const url = buildClipFilmstripUrl('clip_1')
    expect(url).toBe('http://localhost:8000/api/v1/clips/clip_1/filmstrip')
  })
})
