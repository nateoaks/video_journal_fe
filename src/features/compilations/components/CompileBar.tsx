'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui'
import type { Clip } from '@/types/clip'
import type { Compilation } from '@/types/compilation'
import { useSelectedSoundtrack } from '@/hooks/useSelectedSoundtrack'
import { useCompilationProgress } from '@/hooks/useCompilationProgress'
import { usePolling } from '@/hooks/usePolling'
import { canCompile, isTerminal } from '../lib'
import { startCompilation } from '../actions'
import { CompileProgress } from './CompileProgress'

interface CompileBarProps {
  clips: Clip[]
  compilation?: Compilation
}

export function CompileBar({ clips, compilation }: CompileBarProps) {
  const router = useRouter()
  const { selectedId: soundtrackId } = useSelectedSoundtrack()
  const [localCompilationId, setLocalCompilationId] = useState<string | null>(
    null
  )
  const [isPending, startTransition] = useTransition()
  const [conflictMessage, setConflictMessage] = useState<string | null>(null)

  // Active compilation ID: prefer server-passed (late-join), then local
  const activeCompilationId = compilation?.id ?? localCompilationId ?? null

  const {
    status: sseStatus,
    progress: sseProgress,
    error: sseError,
    outputKey: sseOutputKey,
    sseDropped,
  } = useCompilationProgress(activeCompilationId)

  // When SSE is dropped, fall back to polling via router.refresh()
  const serverStatus = compilation?.status ?? null
  const activeStatus = sseStatus ?? serverStatus
  const isPollingActive =
    sseDropped && activeStatus !== null && !isTerminal(activeStatus)
  usePolling(isPollingActive)

  // After SSE reaches a terminal state, do one server sync so output_key and
  // final status are available even if the backend omits them from the SSE event.
  const didSyncRef = useRef(false)
  useEffect(() => {
    if (!didSyncRef.current && sseStatus && isTerminal(sseStatus)) {
      didSyncRef.current = true
      router.refresh()
    }
  }, [sseStatus, router])

  // Determine effective display values: prefer SSE state when connected, fall back to server prop
  const displayStatus = sseStatus ?? compilation?.status ?? null
  const displayProgress =
    sseStatus !== null ? sseProgress : (compilation?.progress ?? 0)
  const displayError = sseError ?? compilation?.error_message ?? null

  const isRunning = displayStatus === 'running' || displayStatus === 'queued'

  const compilationIsActive = activeCompilationId !== null

  const disableButton =
    !canCompile(clips, soundtrackId) || isRunning || isPending

  async function handleCompile() {
    if (!soundtrackId) return
    setConflictMessage(null)

    startTransition(async () => {
      const result = await startCompilation(clips, soundtrackId)

      if ('error' in result) {
        if (result.conflict) {
          setConflictMessage(result.error)
        } else {
          toast.error(result.error)
        }
        return
      }

      setLocalCompilationId(result.id)
      router.push(`?compilationId=${encodeURIComponent(result.id)}`, {
        scroll: false,
      })
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Button
          onClick={handleCompile}
          disabled={disableButton}
          variant="primary"
        >
          {isPending ? 'Starting…' : 'Compile'}
        </Button>

        {conflictMessage && (
          <p className="text-muted-foreground text-sm">{conflictMessage}</p>
        )}
      </div>

      {compilationIsActive && (
        <CompileProgress
          status={displayStatus}
          progress={displayProgress}
          error={displayError}
        />
      )}

      {displayStatus === 'complete' &&
        (sseOutputKey ?? compilation?.output_key) && (
          <p className="text-muted-foreground text-sm">
            Output:{' '}
            <span className="font-mono text-xs">
              {sseOutputKey ?? compilation?.output_key}
            </span>
          </p>
        )}
    </div>
  )
}
