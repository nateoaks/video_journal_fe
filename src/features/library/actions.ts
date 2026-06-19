'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { patchClip, deleteClip as deleteClipService } from '@/services'
import { ApiError } from '@/types/api'

const UpdateClipSchema = z.object({
  title: z.string().min(1).max(200),
})

export async function updateClip(
  id: string,
  _prevState: unknown,
  formData: FormData
): Promise<{ error?: string }> {
  const parsed = UpdateClipSchema.safeParse({ title: formData.get('title') })
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  await patchClip(id, parsed.data)
  revalidatePath('/library')
  return {}
}

export async function deleteClip(id: string): Promise<{ error?: string }> {
  try {
    await deleteClipService(id)
    revalidatePath('/library')
    return {}
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message }
    throw err
  }
}
