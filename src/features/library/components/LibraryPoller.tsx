'use client'

import { usePolling } from '@/hooks/usePolling'

interface LibraryPollerProps {
  active: boolean
}

export function LibraryPoller({ active }: LibraryPollerProps) {
  usePolling(active)
  return null
}
