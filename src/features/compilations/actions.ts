'use server'

import { z } from 'zod'
import { ApiError } from '@/types/api'
import type { Clip } from '@/types/clip'
import { createCompilation } from '@/services/compilations'
import { buildCompilePayload } from './lib'

const ClipSnapshotSchema = z.object({
  id: z.string().min(1),
  trim_in_s: z.number().finite(),
  trim_out_s: z.number().finite(),
})

const StartCompilationSchema = z.object({
  clips: z.array(ClipSnapshotSchema).min(1),
  soundtrackId: z.string().min(1),
})

export async function startCompilation(
  clips: Clip[],
  soundtrackId: string
): Promise<{ id: string } | { error: string; conflict?: boolean }> {
  const payload = buildCompilePayload(clips, soundtrackId)

  const parsed = StartCompilationSchema.safeParse({
    clips: payload.clips,
    soundtrackId,
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
