export type CompilationStatus = 'queued' | 'running' | 'complete' | 'failed'

export interface CompilationClip {
  clip_id: string
  position: number
  /**
   * Trim start in seconds (inclusive).
   * If 0, clip plays from the beginning.
   */
  trim_in_s: number
  /**
   * Trim end in seconds (exclusive).
   * The clip stops before reaching this time.
   */
  trim_out_s: number
}

export interface Compilation {
  id: string
  status: CompilationStatus
  progress: number
  soundtrack_id?: string | null
  error_message?: string
  output_key?: string
  /**
   * Final compiled video duration in seconds.
   * Null until status === 'complete'.
   */
  duration_s: number | null
  /**
   * Clips included in this compilation, in final output order.
   * Populated once the compilation reaches a terminal state.
   */
  clips: CompilationClip[]
  /**
   * Whether clip audio was mixed into the soundtrack.
   * Undefined for older compilations created before this feature.
   */
  mix_clip_audio?: boolean
  /**
   * Clip audio volume as a fraction (0–1).
   * Only meaningful when mix_clip_audio is true.
   * Undefined for older compilations created before this feature.
   */
  clip_audio_volume?: number
}

export interface ClipSnapshot {
  id: string
  trim_in_s: number
  trim_out_s: number
}

export interface CreateCompilationInput {
  clips: ClipSnapshot[]
  soundtrack_id: string
  mix_clip_audio: boolean
  clip_audio_volume: number
}

export interface CompilationSseEvent {
  status: CompilationStatus
  progress: number
  error?: string
  output_key?: string
}
