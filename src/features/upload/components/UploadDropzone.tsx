'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dropzone, UploadItem } from '@/components/ui'
import { uploadClip } from '@/services'
import { ApiError } from '@/types/api'
import type { UploadFileState, UploadStatus } from '../types'

const ACCEPTED_TYPES = new Set(['video/mp4', 'video/quicktime'])
// Limit concurrent uploads to avoid overwhelming the backend and managing browser limits.
// 3 simultaneous XHR requests provides good parallelism while staying safe for typical servers.
const MAX_CONCURRENT = 3

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function isAccepted(file: File): boolean {
  if (ACCEPTED_TYPES.has(file.type)) return true
  const ext = file.name.split('.').pop()?.toLowerCase()
  return ext === 'mp4' || ext === 'mov'
}

export function UploadDropzone() {
  const [files, setFiles] = useState<UploadFileState[]>([])
  const [dropVariant, setDropVariant] = useState<
    'idle' | 'active' | 'rejected'
  >('idle')
  const router = useRouter()
  // Track how many XHR uploads are active right now
  const activeCount = useRef(0)
  // Keep a ref to the latest files list for the queue processor — synced via effect
  const filesRef = useRef<UploadFileState[]>([])
  // Timer refs for setTimeout cleanup
  const dropVariantTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Refs are used to break a circular dependency: drainQueue calls startUpload,
  // but startUpload depends on scheduleRefresh and drainQueue in its useCallback deps.
  // By reading the latest startUpload from this ref, drainQueue stays stable and
  // doesn't need to include startUpload in its dependency array.
  const startUploadRef = useRef<(item: UploadFileState) => Promise<void>>(
    async () => {}
  )
  // Stable router ref so callbacks don't need router in their dep arrays
  const routerRef = useRef(router)

  useEffect(() => {
    filesRef.current = files
  })

  useEffect(() => {
    routerRef.current = router
  })

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (dropVariantTimerRef.current) clearTimeout(dropVariantTimerRef.current)
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    }
  }, [])

  function updateFile(id: string, patch: Partial<UploadFileState>) {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)))
  }

  // Debounce router.refresh() so concurrent upload completions coalesce into one
  const scheduleRefresh = useCallback(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    refreshTimerRef.current = setTimeout(() => routerRef.current.refresh(), 300)
  }, [])

  // drainQueue reads startUpload from the stable ref, so it never goes stale
  const drainQueue = useCallback(() => {
    if (activeCount.current >= MAX_CONCURRENT) return
    const queued = filesRef.current.find((f) => f.status === 'queued')
    if (queued) {
      void startUploadRef.current(queued)
    }
  }, [])

  const startUpload = useCallback(
    async (item: UploadFileState) => {
      updateFile(item.id, { status: 'uploading' as UploadStatus, progress: 0 })

      try {
        const clip = await uploadClip(item.file, (pct) => {
          updateFile(item.id, { progress: pct })
        })
        updateFile(item.id, {
          status: 'processing' as UploadStatus,
          clipId: clip.id,
          progress: 100,
        })
        scheduleRefresh()
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Upload failed'
        updateFile(item.id, {
          status: 'failed' as UploadStatus,
          error: message,
        })
      } finally {
        activeCount.current -= 1
        // Kick off any queued file now that a slot opened
        drainQueue()
      }
    },
    [scheduleRefresh, drainQueue]
  )

  // Keep the stable ref in sync with the latest startUpload
  useEffect(() => {
    startUploadRef.current = startUpload
  })

  function enqueueFiles(fileList: FileList) {
    const newItems: UploadFileState[] = []
    let hasRejected = false

    for (const file of Array.from(fileList)) {
      if (!isAccepted(file)) {
        hasRejected = true
        continue
      }
      newItems.push({
        id: generateId(),
        file,
        name: file.name,
        status: 'queued',
        progress: 0,
      })
    }

    if (dropVariantTimerRef.current) clearTimeout(dropVariantTimerRef.current)
    if (hasRejected) {
      setDropVariant('rejected')
      dropVariantTimerRef.current = setTimeout(
        () => setDropVariant('idle'),
        2000
      )
    } else {
      setDropVariant('idle')
    }

    if (newItems.length === 0) return

    setFiles((prev) => [...prev, ...newItems])

    // Immediately start uploads for items that fit within the concurrency cap.
    // Increment activeCount synchronously before the async call so subsequent
    // iterations see the updated count and don't over-schedule.
    for (const item of newItems) {
      if (activeCount.current < MAX_CONCURRENT) {
        activeCount.current += 1
        void startUpload(item)
      } else {
        break
      }
    }
  }

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault()
    setDropVariant('active')
  }

  function handleDragLeave(e: React.DragEvent) {
    // Only reset if leaving the dropzone entirely (not a child element)
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDropVariant('idle')
    }
  }

  function handleRetry(id: string) {
    const item = filesRef.current.find((f) => f.id === id)
    if (!item) return
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              status: 'queued' as UploadStatus,
              progress: 0,
              error: undefined,
            }
          : f
      )
    )
    if (activeCount.current < MAX_CONCURRENT) {
      activeCount.current += 1
      void startUpload({
        ...item,
        status: 'queued',
        progress: 0,
        error: undefined,
      })
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Dropzone
        variant={dropVariant}
        onFiles={enqueueFiles}
        accept="video/mp4,video/quicktime,.mp4,.mov"
        rejectedLabel="File type not supported"
        rejectedDescription="Please upload .mp4 or .mov files"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      />

      {files.length > 0 && (
        <ul className="flex flex-col gap-2">
          {files.map((item) => (
            <li key={item.id}>
              <UploadItem
                name={item.name}
                status={item.status}
                progress={item.progress}
                error={item.error}
                onRetry={
                  item.status === 'failed'
                    ? () => handleRetry(item.id)
                    : undefined
                }
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
