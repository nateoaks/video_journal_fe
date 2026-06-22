import type { Clip } from '@/types/clip'

export interface ClipNeighbors {
  prevId: string | null
  nextId: string | null
}

export function findNeighbors(
  sortedClips: Clip[],
  clipId: string
): ClipNeighbors {
  const index = sortedClips.findIndex((c) => c.id === clipId)
  if (index === -1) return { prevId: null, nextId: null }
  return {
    prevId: index > 0 ? sortedClips[index - 1].id : null,
    nextId: index < sortedClips.length - 1 ? sortedClips[index + 1].id : null,
  }
}
