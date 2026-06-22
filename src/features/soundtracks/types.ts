export type { Soundtrack, SoundtrackStatus } from '@/types/soundtrack'

export type SoundtrackUploadStatus = 'pending' | 'uploading' | 'done' | 'error'

export interface SoundtrackUploadState {
  id: string // local uuid for list key
  file: File
  status: SoundtrackUploadStatus
  progress: number
  error?: string
}
