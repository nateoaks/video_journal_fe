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
  listSoundtracks,
  getSoundtrack,
  deleteSoundtrack,
  uploadSoundtrack,
  soundtrackAudioPath,
} from './soundtracks'

const mockRequest = request as MockedFunction<typeof request>

describe('soundtracks service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.BACKEND_URL = 'http://localhost:8000'
  })

  it('listSoundtracks calls request with /api/v1/soundtracks', async () => {
    mockRequest.mockResolvedValueOnce([])
    await listSoundtracks()
    expect(mockRequest).toHaveBeenCalledWith('/api/v1/soundtracks', {
      next: { revalidate: 60 },
    })
  })

  it('getSoundtrack calls request with /api/v1/soundtracks/:id', async () => {
    mockRequest.mockResolvedValueOnce({
      id: 'st_1',
      title: 'Test',
      status: 'ready',
      duration_s: 120,
      error_message: null,
    })
    await getSoundtrack('st_1')
    expect(mockRequest).toHaveBeenCalledWith('/api/v1/soundtracks/st_1')
  })

  it('deleteSoundtrack calls request with DELETE method and correct path', async () => {
    mockRequest.mockResolvedValueOnce(undefined)
    await deleteSoundtrack('st_1')
    expect(mockRequest).toHaveBeenCalledWith('/api/v1/soundtracks/st_1', {
      method: 'DELETE',
    })
  })

  it('soundtrackAudioPath encodes the id and returns a same-origin path', () => {
    expect(soundtrackAudioPath('st_1')).toBe('/api/v1/soundtracks/st_1/audio')
  })

  it('soundtrackAudioPath URL-encodes special characters', () => {
    expect(soundtrackAudioPath('id/with spaces')).toBe(
      '/api/v1/soundtracks/id%2Fwith%20spaces/audio'
    )
  })
})

// ---- uploadSoundtrack (XHR-based, browser-side) --------------------------

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

  ;(globalThis as Record<string, unknown>).XMLHttpRequest = FakeXHR

  return { openMock, sendMock }
}

describe('uploadSoundtrack', () => {
  afterEach(() => {
    delete (globalThis as Record<string, unknown>).XMLHttpRequest
    vi.clearAllMocks()
  })

  it('opens POST to /api/v1/soundtracks and sends FormData with the file', async () => {
    const soundtrack = {
      id: 'st_1',
      title: 'test.mp3',
      status: 'processing',
      duration_s: null,
      error_message: null,
    }
    const { openMock, sendMock } = stubXhr({
      status: 201,
      responseText: JSON.stringify(soundtrack),
    })

    const file = new File(['audio'], 'test.mp3', { type: 'audio/mpeg' })
    const result = await uploadSoundtrack(file, vi.fn())

    expect(openMock).toHaveBeenCalledWith('POST', '/api/v1/soundtracks')
    expect(sendMock).toHaveBeenCalledWith(expect.any(FormData))
    expect(result).toEqual(soundtrack)
  })

  it('calls onProgress with correct percentages', async () => {
    const soundtrack = {
      id: 'st_1',
      title: 'test.mp3',
      status: 'processing',
      duration_s: null,
      error_message: null,
    }
    stubXhr({
      status: 201,
      responseText: JSON.stringify(soundtrack),
      progressEvents: [
        { loaded: 25, total: 100 },
        { loaded: 75, total: 100 },
        { loaded: 100, total: 100 },
      ],
    })

    const file = new File(['audio'], 'test.mp3', { type: 'audio/mpeg' })
    const onProgress = vi.fn()
    await uploadSoundtrack(file, onProgress, 0)

    expect(onProgress).toHaveBeenCalledTimes(3)
    expect(onProgress).toHaveBeenNthCalledWith(1, 25)
    expect(onProgress).toHaveBeenNthCalledWith(2, 75)
    expect(onProgress).toHaveBeenNthCalledWith(3, 100)
  })

  it('rejects with ApiError on non-2xx status', async () => {
    const errorBody = { code: 'unsupported_type', message: 'Bad file type' }
    stubXhr({ status: 422, responseText: JSON.stringify(errorBody) })

    const file = new File(['audio'], 'bad.txt', { type: 'text/plain' })
    const err = await uploadSoundtrack(file, vi.fn()).catch((e: unknown) => e)

    expect(err).toBeInstanceOf(ApiError)
    const apiErr = err as ApiError
    expect(apiErr.status).toBe(422)
    expect(apiErr.code).toBe('unsupported_type')
    expect(apiErr.message).toBe('Bad file type')
  })

  it('rejects with ApiError (network_error) on XHR error event', async () => {
    stubXhr({ triggerLoad: false, triggerError: true })

    const file = new File(['audio'], 'test.mp3', { type: 'audio/mpeg' })
    const err = await uploadSoundtrack(file, vi.fn()).catch((e: unknown) => e)

    expect(err).toBeInstanceOf(ApiError)
    expect((err as ApiError).code).toBe('network_error')
  })

  it('rejects with ApiError (aborted) on XHR abort event', async () => {
    stubXhr({ triggerLoad: false, triggerAbort: true })

    const file = new File(['audio'], 'test.mp3', { type: 'audio/mpeg' })
    const err = await uploadSoundtrack(file, vi.fn()).catch((e: unknown) => e)

    expect(err).toBeInstanceOf(ApiError)
    expect((err as ApiError).code).toBe('aborted')
  })
})
