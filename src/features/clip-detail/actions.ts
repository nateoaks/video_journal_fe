'use server'

import { deleteClip } from '@/features/library'

export async function deleteClipAction(
  id: string
): Promise<{ error?: string }> {
  return deleteClip(id)
}
