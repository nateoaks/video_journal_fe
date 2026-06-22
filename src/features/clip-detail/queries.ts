import { notFound } from 'next/navigation'
import { getClip, listClips } from '@/services'
import { ApiError } from '@/types/api'
import { findNeighbors } from './lib'
import type { ClipDetailData } from './types'

export async function getClipDetail(clipId: string): Promise<ClipDetailData> {
  let clip
  try {
    clip = await getClip(clipId)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound()
    throw err
  }

  const allClips = await listClips()
  // Sort by the backend-managed sort_index to get consistent clip order for prev/next navigation
  const sorted = [...allClips].sort((a, b) => a.sort_index - b.sort_index)
  const { prevId, nextId } = findNeighbors(sorted, clipId)

  return { clip, prevId, nextId }
}
