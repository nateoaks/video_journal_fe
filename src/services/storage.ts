import { request } from './client'
import type { StorageUsage } from '@/features/storage/types'

interface StorageUsageRaw {
  originals_bytes: number
  normalized_bytes: number
  filmstrips_bytes: number
  soundtracks_bytes: number
  outputs_bytes: number
  total_bytes: number
}

export async function getStorageUsage(): Promise<StorageUsage> {
  const raw = await request<StorageUsageRaw>('/api/v1/storage/usage', {
    cache: 'no-store',
  })
  return {
    originalsBytes: raw.originals_bytes,
    normalizedBytes: raw.normalized_bytes,
    filmstripsBytes: raw.filmstrips_bytes,
    soundtracksBytes: raw.soundtracks_bytes,
    outputsBytes: raw.outputs_bytes,
    totalBytes: raw.total_bytes,
  }
}
