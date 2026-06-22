'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { deleteSoundtrack } from '@/services'
import { ApiError } from '@/types/api'

const DeleteSoundtrackSchema = z.object({
  id: z.string().min(1),
})

export async function deleteSoundtrackAction(
  id: string
): Promise<{ error?: string }> {
  const parsed = DeleteSoundtrackSchema.safeParse({ id })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  try {
    await deleteSoundtrack(parsed.data.id)
  } catch (err) {
    if (err instanceof ApiError) {
      return { error: err.message }
    }
    throw err
  }

  revalidatePath('/soundtracks')
  return {}
}
