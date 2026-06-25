'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { ApiError } from '@/types/api'
import type { Clip } from '@/types/clip'
import { createCompilation, deleteCompilation } from '@/services/compilations'
import { buildCompilePayload } from './lib'

const DeleteCompilationSchema = z.object({
  id: z.string().uuid(),
})

export async function deleteCompilationAction(
  id: string
): Promise<{ error?: string }> {
  const parsed = DeleteCompilationSchema.safeParse({ id })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  try {
    await deleteCompilation(parsed.data.id)
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 404) {
        // Already gone — treat as removed
        revalidatePath('/history')
        return {}
      }
      if (err.status === 409) {
        return {
          error: 'Cannot delete a compilation that is currently running',
        }
      }
      return { error: err.message }
    }
    throw err
  }

  revalidatePath('/history')
  return {}
}

const ClipSnapshotSchema = z.object({
  id: z.string().min(1),
  trim_in_s: z.number().finite(),
  trim_out_s: z.number().finite(),
})

const StartCompilationSchema = z.object({
  clips: z.array(ClipSnapshotSchema).min(1),
  soundtrackId: z.string().min(1),
  mixClipAudio: z.boolean(),
  clipAudioVolume: z.number().int().min(0).max(100),
})

export async function startCompilation(
  clips: Clip[],
  soundtrackId: string,
  mixClipAudio: boolean = false,
  clipAudioVolume: number = 0
): Promise<{ id: string } | { error: string; conflict?: boolean }> {
  // Validate scalar inputs and that at least one clip exists before building payload
  const preCheck = z
    .object({
      soundtrackId: z.string().min(1),
      mixClipAudio: z.boolean(),
      clipAudioVolume: z.number().int().min(0).max(100),
      clips: z.array(z.unknown()).min(1),
    })
    .safeParse({ soundtrackId, mixClipAudio, clipAudioVolume, clips })

  if (!preCheck.success) {
    return { error: preCheck.error.issues[0]?.message ?? 'Invalid input' }
  }

  const payload = buildCompilePayload(
    clips,
    soundtrackId,
    mixClipAudio,
    clipAudioVolume
  )

  // Validate the processed payload clips (nulls resolved by buildCompilePayload)
  const parsed = StartCompilationSchema.safeParse({
    clips: payload.clips,
    soundtrackId,
    mixClipAudio,
    clipAudioVolume,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  try {
    const result = await createCompilation(payload)
    return { id: result.id }
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 409) {
        return { error: 'A compilation is already in progress', conflict: true }
      }
      return { error: err.message }
    }
    return { error: 'An unexpected error occurred' }
  }
}
