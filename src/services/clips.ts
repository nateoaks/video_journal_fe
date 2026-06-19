import type {
  Clip,
  ClipListResponse,
  UpdateClipInput,
} from '@/features/library/types'
import { request } from './client'

export function listClips(): Promise<ClipListResponse> {
  return request<ClipListResponse>('/clips')
}

export function getClip(id: string): Promise<Clip> {
  return request<Clip>(`/clips/${encodeURIComponent(id)}`)
}

export function patchClip(id: string, input: UpdateClipInput): Promise<Clip> {
  return request<Clip>(`/clips/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function deleteClip(id: string): Promise<void> {
  return request<void>(`/clips/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export function buildClipVideoUrl(id: string): string {
  return `${process.env.BACKEND_URL}/clips/${encodeURIComponent(id)}/video`
}

export function buildClipFilmstripUrl(id: string): string {
  return `${process.env.BACKEND_URL}/clips/${encodeURIComponent(id)}/filmstrip`
}
