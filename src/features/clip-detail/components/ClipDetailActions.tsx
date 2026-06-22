'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui'
import { Modal } from '@/components/ui'
import { deleteClipAction } from '../actions'

interface ClipDetailActionsProps {
  clipId: string
}

export function ClipDetailActions({ clipId }: ClipDetailActionsProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteClipAction(clipId)
      if (result?.error) {
        toast.error(result.error)
        setOpen(false)
      } else {
        router.push('/library')
      }
    })
  }

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
        Delete clip
      </Button>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Delete clip"
        description="This action cannot be undone. The clip and all its trim data will be permanently removed."
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </>
        }
      >
        <p className="text-muted-foreground text-sm">
          Are you sure you want to delete this clip?
        </p>
      </Modal>
    </>
  )
}
