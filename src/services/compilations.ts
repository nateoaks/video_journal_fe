import type { Compilation, CreateCompilationInput } from '@/types/compilation'
import { request } from './client'

/**
 * Submits a new compilation request to the API.
 * Returns the created compilation ID.
 * Throws ApiError on validation or conflict (409 if a compilation is already in progress).
 */
export function createCompilation(
  input: CreateCompilationInput
): Promise<{ id: string }> {
  return request<{ id: string }>('/api/v1/compilations', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

/**
 * Fetches a single compilation by ID.
 * Includes status, progress, error message, and final output details (when available).
 * Throws ApiError on 404 (not found) or other API errors.
 */
export function getCompilation(id: string): Promise<Compilation> {
  return request<Compilation>(`/api/v1/compilations/${encodeURIComponent(id)}`)
}

/**
 * Lists all compilations for the authenticated user, paginated.
 * @param limit Maximum number of results (default 50)
 * @param offset Number of results to skip (default 0)
 * Returns compilations sorted by creation date (newest first server-side).
 */
export function listCompilations(
  limit = 50,
  offset = 0
): Promise<Compilation[]> {
  return request<Compilation[]>(
    `/api/v1/compilations?limit=${limit}&offset=${offset}`
  )
}

/**
 * Deletes a compilation and its video file from storage.
 * Throws ApiError on 404 (already deleted), 409 (still running), or other errors.
 */
export function deleteCompilation(id: string): Promise<void> {
  return request<void>(`/api/v1/compilations/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
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
