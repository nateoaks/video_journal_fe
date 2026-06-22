'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { toast } from 'sonner'
import { reorderClip } from '../actions'
import { computeDroppedSortIndex } from '../lib'
import { SortableClipCard } from './SortableClipCard'
import type { Clip } from '../types'

interface TimelineBoardProps {
  initialClips: Clip[]
}

export function TimelineBoard({ initialClips }: TimelineBoardProps) {
  const router = useRouter()
  const [orderedClips, setOrderedClips] = useState<Clip[]>(initialClips)
  const [activeId, setActiveId] = useState<string | null>(null)

  const clipIds = useMemo(() => orderedClips.map((c) => c.id), [orderedClips])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        // Require a small movement to distinguish drag from click
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const { active, over } = event

    if (!over || active.id === over.id) return

    const fromIndex = orderedClips.findIndex((c) => c.id === active.id)
    const toIndex = orderedClips.findIndex((c) => c.id === over.id)

    if (fromIndex === -1 || toIndex === -1) return

    const newSortIndex = computeDroppedSortIndex(
      orderedClips,
      fromIndex,
      toIndex
    )

    // Optimistic update (functional form avoids stale closure)
    setOrderedClips((current) => arrayMove(current, fromIndex, toIndex))

    // Persist to server; roll back on error using functional updater so we
    // always read the latest state even under concurrent drags.
    reorderClip(active.id as string, newSortIndex)
      .then((result) => {
        if (result?.error) {
          setOrderedClips((current) => arrayMove(current, toIndex, fromIndex))
          toast.error(`Failed to save order: ${result.error}`)
        } else {
          router.refresh() // reconcile with server data
        }
      })
      .catch(() => {
        setOrderedClips((current) => arrayMove(current, toIndex, fromIndex))
        toast.error('Failed to save order')
      })
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={clipIds} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {orderedClips.map((clip) => (
            <SortableClipCard
              key={clip.id}
              clip={clip}
              isDragging={activeId === clip.id}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
