export type CompilationStatus = 'queued' | 'running' | 'complete' | 'failed'

export interface Compilation {
  id: string
  status: CompilationStatus
  progress: number
  error_message?: string
  output_key?: string
}

export interface ClipSnapshot {
  id: string
  trim_in_s: number
  trim_out_s: number
}

export interface CreateCompilationInput {
  clips: ClipSnapshot[]
  soundtrack_id: string
}

export interface CompilationSseEvent {
  status: CompilationStatus
  progress: number
  error?: string
  output_key?: string
}
