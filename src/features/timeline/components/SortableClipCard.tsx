'use client'

import React from 'react'
import Link from 'next/link'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ClipCard } from '@/components/ui'
import { effectiveDuration } from '@/lib/clips'
import { clipFilmstripPath } from '@/services/clips'
import { formatDuration, formatRecordedDate } from '@/lib/format'
import type { Clip } from '../types'

interface SortableClipCardProps {
  clip: Clip
  isDragging?: boolean
}

function SortableClipCardInner({ clip, isDragging }: SortableClipCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: clip.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const duration = formatDuration(effectiveDuration(clip))
  const recordedDate = formatRecordedDate(clip.recorded_at)
  const isTrimmed = clip.trim_in_s != null && clip.trim_out_s != null

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-manipulation"
      aria-label={`Clip recorded ${recordedDate}, duration ${duration}. Drag to reorder.`}
    >
      <Link
        href={`/library/${clip.id}`}
        onClick={(e) => {
          // Prevent navigation during or immediately after a drag
          if (isDragging) e.preventDefault()
        }}
        className="focus-visible:ring-ring block rounded-lg focus-visible:ring-2 focus-visible:outline-none"
        tabIndex={isDragging ? -1 : 0}
      >
        <ClipCard
          thumbnailSrc={clip.filmstrip_key ? clipFilmstripPath(clip.id) : null}
          duration={duration}
          recordedDate={recordedDate}
          status={clip.status}
          isTrimmed={isTrimmed}
          className={isDragging ? 'opacity-50 shadow-lg' : undefined}
        />
      </Link>
    </div>
  )
}

export const SortableClipCard = React.memo(SortableClipCardInner)
