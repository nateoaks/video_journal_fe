'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { SoundtrackItem } from '@/components/ui'
import { Button } from '@/components/ui'
import { Modal } from '@/components/ui'
import { soundtrackAudioPath } from '@/services'
import { deleteSoundtrackAction } from '../actions'
import { useSelectedSoundtrack } from '../context'
import { sortSoundtracks } from '../lib'
import type { Soundtrack } from '../types'

interface SoundtrackListProps {
  soundtracks: Soundtrack[]
}

export function SoundtrackList({ soundtracks }: SoundtrackListProps) {
  const { selectedId, setSelectedId } = useSelectedSoundtrack()
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  function handleDeleteConfirm() {
    if (!confirmId) return
    const idToDelete = confirmId
    setConfirmId(null)
    setDeletingId(idToDelete)
    startTransition(async () => {
      const result = await deleteSoundtrackAction(idToDelete)
      if (result?.error) {
        toast.error(result.error)
      } else {
        if (idToDelete === selectedId) {
          setSelectedId(null)
        }
      }
      setDeletingId(null)
    })
  }

  const confirmingSoundtrack = soundtracks.find((s) => s.id === confirmId)

  return (
    <>
      <ul className="flex flex-col gap-3">
        {sortSoundtracks(soundtracks).map((soundtrack) => (
          <li key={soundtrack.id}>
            <SoundtrackItem
              title={soundtrack.title}
              duration_s={soundtrack.duration_s}
              status={soundtrack.status}
              selected={soundtrack.id === selectedId}
              audioSrc={soundtrackAudioPath(soundtrack.id)}
              onSelect={() => setSelectedId(soundtrack.id)}
              onDelete={() => setConfirmId(soundtrack.id)}
              isDeleting={isPending && deletingId === soundtrack.id}
            />
          </li>
        ))}
      </ul>

      <Modal
        open={confirmId !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmId(null)
        }}
        title="Delete soundtrack"
        description="This action cannot be undone. The soundtrack will be permanently removed."
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
          Are you sure you want to delete &ldquo;
          {confirmingSoundtrack?.title ?? 'this soundtrack'}&rdquo;?
        </p>
      </Modal>
    </>
  )
}
