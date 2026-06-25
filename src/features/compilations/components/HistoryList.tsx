'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { usePolling } from '@/hooks/usePolling'
import { Badge, Button, Modal, CompilationRow } from '@/components/ui'
import { ErrorDetails } from '@/components/composite'
import { compilationVideoPath } from '@/services'
import { deleteCompilationAction } from '../actions'
import { isTerminal, statusBadge, formatMixMode, formatDuration } from '../lib'
import type { Compilation } from '@/types/compilation'

interface HistoryListProps {
  compilations: Compilation[]
  soundtrackMap: Record<string, string>
  active: boolean
}

export function HistoryList({
  compilations,
  soundtrackMap,
  active,
}: HistoryListProps) {
  usePolling(active)

  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  function handleDeleteConfirm() {
    if (!confirmId) return
    const idToDelete = confirmId
    setConfirmId(null)
    setDeletingId(idToDelete)
    startTransition(async () => {
      const result = await deleteCompilationAction(idToDelete)
      if (result?.error) {
        toast.error(result.error)
      }
      setDeletingId(null)
    })
  }

  return (
    <>
      <ul className="flex flex-col gap-3">
        {compilations.map((compilation) => {
          const { label, variant } = statusBadge(compilation.status)
          const soundtrackLabel = compilation.soundtrack_id
            ? (soundtrackMap[compilation.soundtrack_id] ?? null)
            : null
          const terminal = isTerminal(compilation.status)

          const actions = (
            <div className="flex items-center gap-2">
              <Badge variant={variant}>{label}</Badge>
              <Link
                href={`/timeline?compilationId=${compilation.id}`}
                className="text-muted-foreground hover:text-foreground text-xs underline-offset-2 hover:underline"
              >
                {compilation.status === 'complete' ? 'View' : 'Watch progress'}
              </Link>
              {compilation.status === 'complete' && (
                <a
                  href={compilationVideoPath(compilation.id)}
                  download
                  className="text-muted-foreground hover:text-foreground text-xs underline-offset-2 hover:underline"
                >
                  Download
                </a>
              )}
              {terminal && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmId(compilation.id)}
                  disabled={isPending}
                  aria-label="Delete compilation"
                >
                  {isPending && deletingId === compilation.id
                    ? 'Deleting…'
                    : 'Delete'}
                </Button>
              )}
            </div>
          )

          return (
            <li key={compilation.id}>
              <CompilationRow
                status={compilation.status}
                createdAt={compilation.created_at}
                duration={
                  compilation.duration_s != null
                    ? formatDuration(compilation.duration_s)
                    : null
                }
                soundtrackLabel={soundtrackLabel}
                mixMode={formatMixMode(compilation.mix_clip_audio)}
                error={
                  compilation.error ? (
                    <ErrorDetails
                      message="Compilation failed"
                      details={compilation.error}
                    />
                  ) : null
                }
                actions={actions}
              />
            </li>
          )
        })}
      </ul>

      <Modal
        open={confirmId !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmId(null)
        }}
        title="Delete compilation"
        description="This action cannot be undone. The compilation record and video will be permanently removed."
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmId(null)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteConfirm}
              disabled={isPending}
            >
              {isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </>
        }
      >
        <p className="text-muted-foreground text-sm">
          Are you sure you want to delete this compilation?
        </p>
      </Modal>
    </>
  )
}
