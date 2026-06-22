import { listSoundtracks as listSoundtracksService } from '@/services'
import type { Soundtrack } from './types'

export async function listSoundtracks(): Promise<Soundtrack[]> {
  return listSoundtracksService()
}
