import type { Soundtrack } from '@/types/soundtrack'
import { ApiError, type ApiErrorBody } from '@/types/api'
import { request } from './client'

export function listSoundtracks(): Promise<Soundtrack[]> {
  return request<Soundtrack[]>('/api/v1/soundtracks', {
    next: { revalidate: 60 },
  } as RequestInit)
}

export function getSoundtrack(id: string): Promise<Soundtrack> {
  return request<Soundtrack>(`/api/v1/soundtracks/${encodeURIComponent(id)}`)
}

export function deleteSoundtrack(id: string): Promise<void> {
  return request<void>(`/api/v1/soundtracks/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

/**
 * Upload an audio file directly from the browser via XHR so we can report
 * byte-level progress. Uses a relative URL (`/api/v1/soundtracks`) which Next.js
 * rewrites to the backend — never uses BACKEND_URL or the server-only
 * `request()` helper.
 */
export function uploadSoundtrack(
  file: File,
  onProgress: (pct: number) => void,
  progressThrottleMs = 100
): Promise<Soundtrack> {
  return new Promise<Soundtrack>((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    let lastProgressAt = 0
    xhr.upload.addEventListener('progress', (e) => {
      if (!e.lengthComputable) return
      const now = Date.now()
      if (now - lastProgressAt < progressThrottleMs) return
      lastProgressAt = now
      onProgress(Math.round((e.loaded / e.total) * 100))
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText) as Soundtrack)
        } catch {
          reject(
            new ApiError(xhr.status, 'parse_error', 'Invalid JSON response')
          )
        }
      } else {
        let body: ApiErrorBody = {}
        try {
          body = JSON.parse(xhr.responseText) as ApiErrorBody
        } catch {
          /* non-JSON error body */
        }
        reject(
          new ApiError(
            xhr.status,
            body.code ?? 'unknown',
            body.message ?? xhr.statusText
          )
        )
      }
    })

    xhr.addEventListener('error', () => {
      reject(new ApiError(0, 'network_error', 'Network error during upload'))
    })

    xhr.addEventListener('abort', () => {
      reject(new ApiError(0, 'aborted', 'Upload aborted'))
    })

    const formData = new FormData()
    formData.append('file', file)

    xhr.open('POST', '/api/v1/soundtracks')
    xhr.send(formData)
  })
}

/**
 * Same-origin path helper for use in client components (no BACKEND_URL needed).
 * Routes through Next.js rewrites → backend proxy.
 */
export function soundtrackAudioPath(id: string): string {
  return `/api/v1/soundtracks/${encodeURIComponent(id)}/audio`
}
