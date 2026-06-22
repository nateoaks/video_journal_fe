import type { Clip, UpdateClipInput } from '@/types/clip'
import { ApiError, type ApiErrorBody } from '@/types/api'
import { request } from './client'

export function listClips(): Promise<Clip[]> {
  return request<Clip[]>('/api/v1/clips')
}

export function getClip(id: string): Promise<Clip> {
  return request<Clip>(`/api/v1/clips/${encodeURIComponent(id)}`)
}

export function patchClip(id: string, input: UpdateClipInput): Promise<Clip> {
  return request<Clip>(`/api/v1/clips/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function deleteClip(id: string): Promise<void> {
  return request<void>(`/api/v1/clips/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

export function buildClipVideoUrl(id: string): string {
  return `${process.env.BACKEND_URL}/api/v1/clips/${encodeURIComponent(id)}/video`
}

export function buildClipFilmstripUrl(id: string): string {
  return `${process.env.BACKEND_URL}/api/v1/clips/${encodeURIComponent(id)}/filmstrip`
}

/**
 * Upload a video file directly from the browser via XHR so we can report
 * byte-level progress.  Uses a relative URL (`/api/v1/clips`) which Next.js
 * rewrites to the backend — never uses BACKEND_URL or the server-only
 * `request()` helper.
 */
export function uploadClip(
  file: File,
  onProgress: (pct: number) => void,
  progressThrottleMs = 100
): Promise<Clip> {
  return new Promise<Clip>((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    let lastProgressAt = 0
    xhr.upload.addEventListener('progress', (e) => {
      if (!e.lengthComputable) return
      const now = Date.now()
      // Throttle progress callbacks to prevent excessive state updates and re-renders
      // from high-frequency XHR progress events, especially on slow connections.
      // Default 100ms allows ~10 updates/sec while keeping the UI responsive.
      if (now - lastProgressAt < progressThrottleMs) return
      lastProgressAt = now
      onProgress(Math.round((e.loaded / e.total) * 100))
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText) as Clip)
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

    xhr.open('POST', '/api/v1/clips')
    xhr.send(formData)
  })
}

/**
 * Same-origin path helpers for use in client components (no BACKEND_URL needed).
 * Route these through Next.js rewrites → backend proxy.
 */
export function clipVideoPath(id: string): string {
  return `/api/v1/clips/${encodeURIComponent(id)}/video`
}

export function clipFilmstripPath(id: string): string {
  return `/api/v1/clips/${encodeURIComponent(id)}/filmstrip`
}
