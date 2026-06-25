import { listCompilations as listCompilationsService } from '@/services'
import type { Compilation } from '@/types/compilation'

export async function listCompilations(): Promise<Compilation[]> {
  return listCompilationsService()
}
