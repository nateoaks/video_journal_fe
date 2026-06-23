'use client'

import { useEffect, useState } from 'react'
import type { CompilationStatus } from '@/types/compilation'
import { isTerminal } from '@/features/compilations/lib'

// Never simulate past this; leaves headroom for real events to "arrive"
const CAP = 90
// Fraction of remaining headroom consumed per tick — exponential decay curve
// that feels fast early then slows as it approaches CAP
const RATE = 0.015
const TICK_MS = 1000

/**
 * Returns a display progress value that ticks upward while status is active,
 * even when no real SSE events arrive. Real progress always wins when higher.
 * Snaps immediately to realProgress on terminal status.
 */
export function useSimulatedProgress(
  realProgress: number,
  status: CompilationStatus | null
): number {
  const [sim, setSim] = useState(0)

  useEffect(() => {
    if (!status || isTerminal(status)) {
      // Cleanup resets sim to 0 for the next compilation run
      return () => setSim(0)
    }

    const id = setInterval(() => {
      setSim((prev) => {
        const floor = Math.max(prev, realProgress)
        if (floor >= CAP) return floor
        return floor + (CAP - floor) * RATE
      })
    }, TICK_MS)

    return () => {
      clearInterval(id)
      setSim(0)
    }
  }, [status, realProgress])

  if (!status || isTerminal(status)) return realProgress
  return Math.max(sim, realProgress)
}
