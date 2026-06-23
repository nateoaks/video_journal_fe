'use client'

import { useEffect, useRef, useState } from 'react'
import { compilationEventsPath } from '@/services/compilations'
import { parseProgressEvent, isTerminal } from '@/features/compilations/lib'
import type { CompilationStatus } from '@/types/compilation'

export interface CompilationProgressState {
  status: CompilationStatus | null
  progress: number
  error: string | null
  outputKey: string | null
  /**
   * True if the SSE connection dropped.
   * Callers should use this flag to decide whether to fall back to polling (e.g., via router.refresh()).
   * The hook does not implement its own fallback so that different consumers can choose different strategies.
   */
  sseDropped: boolean
}

const IDLE_STATE: CompilationProgressState = {
  status: null,
  progress: 0,
  error: null,
  outputKey: null,
  sseDropped: false,
}

/**
 * Hook for live compilation progress via Server-Sent Events.
 * Connects to the backend SSE stream and updates state in real-time.
 * If the connection drops, signals via `sseDropped` so the caller can implement their own fallback (e.g., polling).
 * Returns idle state when compilationId is null.
 */
export function useCompilationProgress(
  compilationId: string | null
): CompilationProgressState {
  const [sseState, setSseState] = useState<CompilationProgressState>(IDLE_STATE)
  const sourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    // Close any previous connection
    if (sourceRef.current) {
      sourceRef.current.close()
      sourceRef.current = null
    }

    if (!compilationId) {
      return
    }

    const source = new EventSource(compilationEventsPath(compilationId))
    sourceRef.current = source

    source.addEventListener('message', (event: MessageEvent) => {
      const parsed = parseProgressEvent(event.data as string)
      if (!parsed) return

      setSseState((prev) => ({
        ...prev,
        status: parsed.status,
        progress: parsed.progress,
        error: parsed.error ?? null,
        outputKey: parsed.output_key ?? null,
      }))

      if (isTerminal(parsed.status)) {
        source.close()
        sourceRef.current = null
      }
    })

    source.addEventListener('error', () => {
      source.close()
      sourceRef.current = null
      setSseState((prev) => ({ ...prev, sseDropped: true }))
    })

    return () => {
      // Reset SSE state when compilationId changes or component unmounts,
      // so a stale sseDropped flag from a previous compilation never
      // immediately triggers the polling fallback for a new one.
      setSseState(IDLE_STATE)
      source.close()
      sourceRef.current = null
    }
  }, [compilationId])

  // When compilationId is null, return idle state regardless of internal state
  if (!compilationId) {
    return IDLE_STATE
  }

  return sseState
}
