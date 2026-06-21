import type { Clip } from './types'

/**
 * Returns a copy of clips sorted by sort_index ascending.
 */
export function sortClips(clips: Clip[]): Clip[] {
  return [...clips].sort((a, b) => a.sort_index - b.sort_index)
}

/**
 * Returns the same-origin proxy path for a clip's filmstrip image.
 * Uses the /api/:path* Next.js rewrite so no CORS / auth headers are needed.
 */
export function clipFilmstripPath(id: string): string {
  return `/api/v1/clips/${encodeURIComponent(id)}/filmstrip`
}

/**
 * Returns the effective playback duration (seconds) for a clip,
 * accounting for trim_in_s and trim_out_s when both are set.
 * Falls back to duration_s when trim fields are absent.
 */
export function effectiveDuration(clip: Clip): number | null {
  if (
    clip.trim_in_s != null &&
    clip.trim_out_s != null &&
    clip.trim_out_s > clip.trim_in_s
  ) {
    return clip.trim_out_s - clip.trim_in_s
  }
  return clip.duration_s
}
