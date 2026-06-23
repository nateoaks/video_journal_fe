import type { Clip } from '@/types/clip'
import type {
  CompilationStatus,
  CompilationSseEvent,
  CreateCompilationInput,
} from '@/types/compilation'

const TERMINAL_STATUSES: Set<CompilationStatus> = new Set([
  'complete',
  'failed',
])

/**
 * Returns true if it is valid to start a compilation:
 * at least one clip with status 'ready' and a non-null soundtrackId.
 */
export function canCompile(
  clips: Clip[],
  soundtrackId: string | null
): boolean {
  if (!soundtrackId) return false
  return clips.some((c) => c.status === 'ready')
}

/**
 * Builds the payload for POST /api/compilations.
 * Filters to ready clips, sorts by sort_index, maps to ClipSnapshot.
 */
export function buildCompilePayload(
  clips: Clip[],
  soundtrackId: string
): CreateCompilationInput {
  const readyClips = clips
    .filter((c) => c.status === 'ready')
    .sort((a, b) => a.sort_index - b.sort_index)
    .map((c) => ({
      id: c.id,
      trim_in_s: c.trim_in_s ?? 0,
      trim_out_s: c.trim_out_s ?? c.duration_s ?? 0,
    }))

  return {
    clips: readyClips,
    soundtrack_id: soundtrackId,
  }
}

/**
 * Returns true for terminal compilation statuses.
 */
export function isTerminal(status: CompilationStatus): boolean {
  return TERMINAL_STATUSES.has(status)
}

/**
 * Formats a duration in seconds to a human-readable "m:ss" string.
 * Returns "0:00" for null or negative values.
 */
export function formatDuration(seconds: number | null): string {
  if (seconds == null || seconds < 0) return '0:00'
  const totalSeconds = Math.floor(seconds)
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/**
 * Generates a download filename for a compilation video.
 * Format: video-journal-YYYY-MM-DD.mp4 using today's date.
 */
export function downloadFilename(): string {
  const date = new Date().toISOString().slice(0, 10)
  return `video-journal-${date}.mp4`
}

/**
 * Parses a raw SSE message data string into a CompilationSseEvent.
 * Returns null on any parse or type failure.
 */
export function parseProgressEvent(raw: string): CompilationSseEvent | null {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof (parsed as Record<string, unknown>).status !== 'string' ||
      typeof (parsed as Record<string, unknown>).progress !== 'number'
    ) {
      return null
    }

    const obj = parsed as Record<string, unknown>
    return {
      status: obj.status as CompilationStatus,
      progress: obj.progress as number,
      error: typeof obj.error === 'string' ? obj.error : undefined,
      output_key:
        typeof obj.output_key === 'string' ? obj.output_key : undefined,
    }
  } catch {
    return null
  }
}
