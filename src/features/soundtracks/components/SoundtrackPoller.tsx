'use client'

import { usePolling } from '@/hooks/usePolling'

interface SoundtrackPollerProps {
  active: boolean
}

export function SoundtrackPoller({ active }: SoundtrackPollerProps) {
  usePolling(active)
  return null
}
