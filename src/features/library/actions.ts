'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { patchClip, deleteClip as deleteClipService } from '@/services'
import { ApiError } from '@/types/api'
import type { UpdateClipInput } from './types'

const numericField = z.preprocess(
  (v) => (v === null || v === '' ? undefined : Number(v)),
  z.number().optional()
)

const UpdateClipSchema = z.object({
  trim_in_s: numericField.pipe(z.number().min(0).optional()),
  trim_out_s: numericField.pipe(z.number().min(0).optional()),
  sort_index: numericField,
})

export async function updateClip(
  id: string,
  _prevState: unknown,
  formData: FormData
): Promise<{ error?: string }> {
  const parsed = UpdateClipSchema.safeParse({
    trim_in_s: formData.get('trim_in_s'),
    trim_out_s: formData.get('trim_out_s'),
    sort_index: formData.get('sort_index'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  // Strip undefined keys so we only send fields the caller explicitly provided
  const input = Object.fromEntries(
    Object.entries(parsed.data).filter(([, v]) => v !== undefined)
  ) as UpdateClipInput
  await patchClip(id, input)
  revalidatePath('/library')
  return {}
}

export async function deleteClip(id: string): Promise<{ error?: string }> {
  try {
    await deleteClipService(id)
    revalidatePath('/library')
    // Invalidate the clip detail page so it triggers notFound() when accessed
    revalidatePath(`/library/${id}`)
    return {}
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message }
    throw err
  }
}
