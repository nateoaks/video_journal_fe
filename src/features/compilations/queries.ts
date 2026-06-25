import { listCompilations as listCompilationsService } from '@/services'
import type { Compilation } from '@/types/compilation'

/**
 * Server-side query to fetch all compilations for the authenticated user.
 * Called only from server components; never imported by client components.
 * Use `revalidatePath('/history')` to refresh after mutations.
 */
export async function listCompilations(): Promise<Compilation[]> {
  return listCompilationsService()
}
