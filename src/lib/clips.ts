import type { Clip } from '@/types/clip'

/**
 * Shared clip utility helpers.
 * Re-exported by features that need clip metadata calculations (timeline, library, trimmer).
 */

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
