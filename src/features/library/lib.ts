import type { Clip } from './types'
export { effectiveDuration } from '@/lib/clips'
export { clipFilmstripPath } from '@/services/clips'

/**
 * Returns a copy of clips sorted by sort_index ascending.
 */
export function sortClips(clips: Clip[]): Clip[] {
  return [...clips].sort((a, b) => a.sort_index - b.sort_index)
}
