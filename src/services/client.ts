import { loggedFetch } from '@/lib/fetch'
import { ApiError, type ApiErrorBody } from '@/types/api'

// This is the single module for all backend HTTP calls — all service functions must use request<T>() to enforce consistent error handling and auth.
export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = process.env.BACKEND_URL
  if (!baseUrl) throw new Error('BACKEND_URL is not set')

  const url = `${baseUrl}${path}`
  const headers: Record<string, string> = {}
  if (init?.body) headers['Content-Type'] = 'application/json'

  const res = await loggedFetch(url, {
    ...init,
    headers: { ...headers, ...init?.headers },
  })

  if (!res.ok) {
    let body: ApiErrorBody = {}
    try {
      body = (await res.json()) as ApiErrorBody
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(
      res.status,
      body.code ?? 'unknown',
      body.message ?? res.statusText
    )
  }

  if (res.status === 204) return undefined as T

  return res.json() as Promise<T>
}
