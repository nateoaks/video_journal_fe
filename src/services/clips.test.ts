import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type MockedFunction,
} from 'vitest'
import { ApiError } from '@/types/api'

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
  uploadClip,
} from './clips'

const mockRequest = request as MockedFunction<typeof request>

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

// ---- uploadClip (XHR-based, browser-side) --------------------------------

type XhrEventName = 'load' | 'error' | 'abort'
type ProgressEventName = 'progress'

interface XhrMockConfig {
  status?: number
  responseText?: string
  triggerLoad?: boolean
  triggerError?: boolean
  triggerAbort?: boolean
  progressEvents?: Array<{ loaded: number; total: number }>
}

function stubXhr(config: XhrMockConfig) {
  const {
    status = 200,
    responseText = '{}',
    triggerLoad = true,
    triggerError = false,
    triggerAbort = false,
    progressEvents = [],
  } = config

  const listeners: Record<XhrEventName, Array<(e: ProgressEvent) => void>> = {
    load: [],
    error: [],
    abort: [],
  }
  const uploadListeners: Record<
    ProgressEventName,
    Array<(e: ProgressEvent) => void>
  > = { progress: [] }

  const openMock = vi.fn()
  const sendMock = vi.fn(() => {
    for (const prog of progressEvents) {
      uploadListeners.progress.forEach((cb) =>
        cb({
          lengthComputable: true,
          loaded: prog.loaded,
          total: prog.total,
        } as ProgressEvent)
      )
    }
    if (triggerLoad) listeners.load.forEach((cb) => cb({} as ProgressEvent))
    if (triggerError) listeners.error.forEach((cb) => cb({} as ProgressEvent))
    if (triggerAbort) listeners.abort.forEach((cb) => cb({} as ProgressEvent))
  })

  function FakeXHR(this: XMLHttpRequest) {
    Object.defineProperty(this, 'status', { value: status })
    Object.defineProperty(this, 'responseText', { value: responseText })
    Object.defineProperty(this, 'upload', {
      value: {
        addEventListener: (
          event: ProgressEventName,
          cb: (e: ProgressEvent) => void
        ) => {
          if (uploadListeners[event]) uploadListeners[event].push(cb)
        },
      },
    })
    Object.defineProperty(this, 'addEventListener', {
      value: (event: XhrEventName, cb: (e: ProgressEvent) => void) => {
        if (listeners[event]) listeners[event].push(cb)
      },
    })
    Object.defineProperty(this, 'open', { value: openMock })
    Object.defineProperty(this, 'send', { value: sendMock })
  }

  // vi.stubGlobal not shimmed in bun — assign directly
  ;(globalThis as Record<string, unknown>).XMLHttpRequest = FakeXHR

  return { openMock, sendMock }
}

describe('uploadClip', () => {
  afterEach(() => {
    // vi.unstubAllGlobals not shimmed in bun — delete manually
    delete (globalThis as Record<string, unknown>).XMLHttpRequest
    vi.clearAllMocks()
  })

  it('opens POST to /api/v1/clips and sends FormData with the file', async () => {
    const clip = { id: 'clip_1', status: 'processing' }
    const { openMock, sendMock } = stubXhr({
      status: 201,
      responseText: JSON.stringify(clip),
    })

    const file = new File(['video'], 'test.mp4', { type: 'video/mp4' })
    const result = await uploadClip(file, vi.fn())

    expect(openMock).toHaveBeenCalledWith('POST', '/api/v1/clips')
    expect(sendMock).toHaveBeenCalledWith(expect.any(FormData))
    expect(result).toEqual(clip)
  })

  it('calls onProgress with correct percentages', async () => {
    const clip = { id: 'clip_1', status: 'processing' }
    stubXhr({
      status: 201,
      responseText: JSON.stringify(clip),
      progressEvents: [
        { loaded: 25, total: 100 },
        { loaded: 75, total: 100 },
        { loaded: 100, total: 100 },
      ],
    })

    const file = new File(['video'], 'test.mp4', { type: 'video/mp4' })
    const onProgress = vi.fn()
    await uploadClip(file, onProgress, 0)

    expect(onProgress).toHaveBeenCalledTimes(3)
    expect(onProgress).toHaveBeenNthCalledWith(1, 25)
    expect(onProgress).toHaveBeenNthCalledWith(2, 75)
    expect(onProgress).toHaveBeenNthCalledWith(3, 100)
  })

  it('rejects with ApiError on non-2xx status with correct fields', async () => {
    const errorBody = { code: 'unsupported_type', message: 'Bad file type' }
    stubXhr({ status: 422, responseText: JSON.stringify(errorBody) })

    const file = new File(['video'], 'bad.avi', { type: 'video/avi' })
    const err = await uploadClip(file, vi.fn()).catch((e: unknown) => e)

    expect(err).toBeInstanceOf(ApiError)
    const apiErr = err as ApiError
    expect(apiErr.status).toBe(422)
    expect(apiErr.code).toBe('unsupported_type')
    expect(apiErr.message).toBe('Bad file type')
  })

  it('rejects with ApiError (network_error) on XHR error event', async () => {
    stubXhr({ triggerLoad: false, triggerError: true })

    const file = new File(['video'], 'test.mp4', { type: 'video/mp4' })
    const err = await uploadClip(file, vi.fn()).catch((e: unknown) => e)

    expect(err).toBeInstanceOf(ApiError)
    expect((err as ApiError).code).toBe('network_error')
  })

  it('rejects with ApiError (aborted) on XHR abort event', async () => {
    stubXhr({ triggerLoad: false, triggerAbort: true })

    const file = new File(['video'], 'test.mp4', { type: 'video/mp4' })
    const err = await uploadClip(file, vi.fn()).catch((e: unknown) => e)

    expect(err).toBeInstanceOf(ApiError)
    expect((err as ApiError).code).toBe('aborted')
  })
})
