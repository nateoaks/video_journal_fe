import type { Compilation, CreateCompilationInput } from '@/types/compilation'
import { request } from './client'

export function createCompilation(
  input: CreateCompilationInput
): Promise<{ id: string }> {
  return request<{ id: string }>('/api/v1/compilations', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function getCompilation(id: string): Promise<Compilation> {
  return request<Compilation>(`/api/v1/compilations/${encodeURIComponent(id)}`)
}

/**
 * Returns the same-origin proxy path for SSE events.
 * Used in the browser — NOT through BACKEND_URL.
 */
export function compilationEventsPath(id: string): string {
  return `/api/v1/compilations/${encodeURIComponent(id)}/events`
}

/**
 * Returns the same-origin path for streaming the compiled video.
 * Supports Range requests / 206 partial content.
 * Used in the browser — NOT through BACKEND_URL.
 */
export function compilationVideoPath(id: string): string {
  return `/api/v1/compilations/${encodeURIComponent(id)}/video`
}
