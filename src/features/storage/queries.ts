import { getStorageUsage } from '@/services/storage'
import type { StorageUsage } from './types'

/**
 * Fetches storage usage, returning null on any error.
 * Intentional deviation from the normal throw rule — a slow or unavailable
 * storage endpoint renders nothing rather than tripping the error boundary.
 */
export async function getStorageUsageSafe(): Promise<StorageUsage | null> {
  try {
    return await getStorageUsage()
  } catch {
    return null
  }
}
