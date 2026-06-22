import type { Clip } from '@/types/clip'

export interface ClipDetailData {
  clip: Clip
  prevId: string | null
  nextId: string | null
}
