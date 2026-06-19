export type ClipStatus = 'processing' | 'ready' | 'failed'

export interface Clip {
  id: string
  original_key: string
  normalized_key: string | null
  filmstrip_key: string | null
  duration_s: number | null
  width: number | null
  height: number | null
  codec_name: string | null
  recorded_at: string | null
  uploaded_at: string
  trim_in_s: number | null
  trim_out_s: number | null
  sort_index: number
  status: ClipStatus
  error_message: string | null
}

export interface UpdateClipInput {
  trim_in_s?: number | null
  trim_out_s?: number | null
  sort_index?: number | null
}
