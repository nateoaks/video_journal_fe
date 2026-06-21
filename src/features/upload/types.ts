export type UploadStatus = 'queued' | 'uploading' | 'processing' | 'failed'

export interface UploadFileState {
  id: string
  file: File
  name: string
  status: UploadStatus
  progress: number
  error?: string
  clipId?: string
}
