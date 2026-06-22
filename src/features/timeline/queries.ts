import { listClips as listClipsService } from '@/services'
import type { Clip } from './types'

/**
 * Returns all clips with status "ready", sorted ascending by sort_index.
 */
export async function listReadyClips(): Promise<Clip[]> {
  const clips = await listClipsService()
  return clips
    .filter((c) => c.status === 'ready')
    .sort((a, b) => a.sort_index - b.sort_index)
}
