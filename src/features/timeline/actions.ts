'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { patchClip } from '@/services'
import { ApiError } from '@/types/api'

const ReorderClipSchema = z.object({
  id: z.string().min(1),
  sort_index: z.number().finite(),
})

/**
 * Persists a new sort_index for the given clip.
 * Called after a drag-and-drop reorder in TimelineBoard.
 */
export async function reorderClip(
  id: string,
  sortIndex: number
): Promise<{ error?: string }> {
  const parsed = ReorderClipSchema.safeParse({ id, sort_index: sortIndex })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    await patchClip(parsed.data.id, { sort_index: parsed.data.sort_index })
    revalidatePath('/timeline')
    revalidatePath('/library')
    return {}
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message }
    throw err
  }
}
