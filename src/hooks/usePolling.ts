'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { POLL_INTERVAL_MS } from '@/lib/polling'

export function usePolling(
  active: boolean,
  intervalMs: number = POLL_INTERVAL_MS
): void {
  const router = useRouter()
  const refreshRef = useRef(router.refresh.bind(router))

  useEffect(() => {
    if (!active) return
    const id = setInterval(() => refreshRef.current(), intervalMs)
    return () => clearInterval(id)
  }, [active, intervalMs])
}
