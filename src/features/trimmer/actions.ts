'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { patchClip, getClip } from '@/services'

const trimFloat = z.number().finite().nonnegative()

const SaveTrimSchema = z.object({
  trimIn: trimFloat,
  trimOut: trimFloat,
})

export async function saveTrim(
  id: string,
  trimIn: number,
  trimOut: number
): Promise<{ error?: string }> {
  const parsed = SaveTrimSchema.safeParse({ trimIn, trimOut })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  if (parsed.data.trimOut <= parsed.data.trimIn) {
    return { error: 'Trim out must be after trim in' }
  }

  // Server-side guard: trim out must not exceed the clip's actual duration
  const clip = await getClip(id)
  if (clip.duration_s !== null && parsed.data.trimOut > clip.duration_s) {
    return { error: 'Trim end exceeds clip duration' }
  }

  await patchClip(id, {
    trim_in_s: parsed.data.trimIn,
    trim_out_s: parsed.data.trimOut,
  })

  revalidatePath('/library')
  revalidatePath('/library/[clipId]', 'page')

  return {}
}
