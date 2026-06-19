export type ClipStatus = 'uploading' | 'processing' | 'ready' | 'error'

export interface Clip {
  id: string
  title: string
  status: ClipStatus
  createdAt: string
  durationMs?: number
  errorMessage?: string
  videoUrl?: string
  filmstripUrl?: string
}

export interface ClipListResponse {
  items: Clip[]
}

export interface UpdateClipInput {
  title?: string
}
