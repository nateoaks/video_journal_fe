export type SoundtrackStatus = 'processing' | 'ready' | 'failed'

export interface Soundtrack {
  id: string
  title: string
  duration_s: number | null
  status?: SoundtrackStatus
  error_message: string | null
}
