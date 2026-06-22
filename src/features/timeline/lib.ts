import type { Clip } from './types'

/**
 * Computes the new sort_index for a clip dragged from `fromIndex` to `toIndex`
 * in the current ordered array (before the move).
 *
 * Uses the float-index / fractional indexing trick: new index = average of neighbours.
 * Returns the original sort_index when the position does not change.
 */
export function computeDroppedSortIndex(
  clips: Clip[],
  fromIndex: number,
  toIndex: number
): number {
  if (fromIndex === toIndex) return clips[fromIndex].sort_index

  // Simulate the array after the move so we can read the new neighbours.
  const reordered = [...clips]
  const [moved] = reordered.splice(fromIndex, 1)
  reordered.splice(toIndex, 0, moved)

  const prev = reordered[toIndex - 1]
  const next = reordered[toIndex + 1]

  if (!prev) {
    // Dropped at the very start
    if (!next) {
      // Only one clip — keep index unchanged (or use 0.5 as a stable default)
      return 0.5
    }
    return next.sort_index / 2
  }

  if (!next) {
    // Dropped at the very end
    return prev.sort_index + 1
  }

  return (prev.sort_index + next.sort_index) / 2
}

/**
 * Returns true when any two adjacent clips are so close in sort_index that
 * further midpoint splits would lose precision (within 10× machine epsilon).
 *
 * TODO(BLA-?): Call after reorderClip resolves to detect float-precision exhaustion.
 * When true, a follow-up ticket will add a bulk-renumber server action.
 */
export function needsRenumber(clips: Clip[]): boolean {
  for (let i = 0; i < clips.length - 1; i++) {
    if (
      Math.abs(clips[i].sort_index - clips[i + 1].sort_index) <
      Number.EPSILON * 10
    ) {
      return true
    }
  }
  return false
}
