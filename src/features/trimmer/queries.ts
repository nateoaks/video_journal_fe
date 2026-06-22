import { getClip as getClipService } from '@/services'
import type { Clip } from '@/types/clip'

export async function getClip(id: string): Promise<Clip> {
  return getClipService(id)
}
