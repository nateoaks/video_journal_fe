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

  it('listClips calls request with /clips', async () => {
    mockRequest.mockResolvedValueOnce({ items: [] })
    await listClips()
    expect(mockRequest).toHaveBeenCalledWith('/clips')
  })

  it('getClip calls request with /clips/:id', async () => {
    mockRequest.mockResolvedValueOnce({ id: 'clip_1' })
    await getClip('clip_1')
    expect(mockRequest).toHaveBeenCalledWith('/clips/clip_1')
  })

  it('patchClip calls request with PATCH method and correct path', async () => {
    mockRequest.mockResolvedValueOnce({ id: 'clip_1', title: 'New Title' })
    await patchClip('clip_1', { title: 'New Title' })
    expect(mockRequest).toHaveBeenCalledWith('/clips/clip_1', {
      method: 'PATCH',
      body: JSON.stringify({ title: 'New Title' }),
    })
  })

  it('deleteClip calls request with DELETE method and correct path', async () => {
    mockRequest.mockResolvedValueOnce(undefined)
    await deleteClip('clip_1')
    expect(mockRequest).toHaveBeenCalledWith('/clips/clip_1', {
      method: 'DELETE',
    })
  })

  it('buildClipVideoUrl returns correct URL', () => {
    const url = buildClipVideoUrl('clip_1')
    expect(url).toBe('http://localhost:8000/clips/clip_1/video')
  })

  it('buildClipFilmstripUrl returns correct URL', () => {
    const url = buildClipFilmstripUrl('clip_1')
    expect(url).toBe('http://localhost:8000/clips/clip_1/filmstrip')
  })
})
