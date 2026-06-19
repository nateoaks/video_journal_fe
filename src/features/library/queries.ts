import { listClips as listClipsService } from '@/services'
import type { Clip } from './types'

export async function listClips(): Promise<Clip[]> {
  const data = await listClipsService()
  return data.items
}
