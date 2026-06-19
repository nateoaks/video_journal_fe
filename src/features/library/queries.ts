import { listClips as listClipsService } from '@/services'
import type { Clip } from './types'

export async function listClips(): Promise<Clip[]> {
  return listClipsService()
}
