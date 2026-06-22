'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dropzone, UploadItem } from '@/components/ui'
import { uploadSoundtrack } from '@/services'
import { ApiError } from '@/types/api'
import { isAcceptedAudio } from '../lib'
import type { SoundtrackUploadState, SoundtrackUploadStatus } from '../types'

// Limit concurrent uploads to avoid overwhelming the backend
const MAX_CONCURRENT = 3

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function SoundtrackUploader() {
  const [files, setFiles] = useState<SoundtrackUploadState[]>([])
  const [dropVariant, setDropVariant] = useState<
    'idle' | 'active' | 'rejected'
  >('idle')
  const router = useRouter()
  const activeCount = useRef(0)
  const filesRef = useRef<SoundtrackUploadState[]>([])
  const dropVariantTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startUploadRef = useRef<(item: SoundtrackUploadState) => Promise<void>>(
    async () => {}
  )
  const routerRef = useRef(router)

  useEffect(() => {
    filesRef.current = files
  })

  useEffect(() => {
    routerRef.current = router
  })

  useEffect(() => {
    return () => {
      if (dropVariantTimerRef.current) clearTimeout(dropVariantTimerRef.current)
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    }
  }, [])

  function updateFile(id: string, patch: Partial<SoundtrackUploadState>) {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)))
  }

  const scheduleRefresh = useCallback(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    refreshTimerRef.current = setTimeout(() => {
      routerRef.current.refresh()
      // Once the server list has refreshed, clear completed items — the
      // soundtrack now appears in the list below, so the uploader row is redundant.
      setFiles((prev) => prev.filter((f) => f.status !== 'done'))
    }, 300)
  }, [])

  const drainQueue = useCallback(() => {
    if (activeCount.current >= MAX_CONCURRENT) return
    const queued = filesRef.current.find((f) => f.status === 'pending')
    if (queued) {
      void startUploadRef.current(queued)
    }
  }, [])

  const startUpload = useCallback(
    async (item: SoundtrackUploadState) => {
      updateFile(item.id, {
        status: 'uploading' as SoundtrackUploadStatus,
        progress: 0,
      })

      try {
        await uploadSoundtrack(item.file, (pct) => {
          updateFile(item.id, { progress: pct })
        })
        updateFile(item.id, {
          status: 'done' as SoundtrackUploadStatus,
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
          status: 'error' as SoundtrackUploadStatus,
          error: message,
        })
      } finally {
        activeCount.current -= 1
        drainQueue()
      }
    },
    [scheduleRefresh, drainQueue]
  )

  useEffect(() => {
    startUploadRef.current = startUpload
  })

  // Drain the queue whenever files state changes and there are pending items
  // with open concurrency slots. This handles stale-ref edge cases when items
  // are added to state (e.g. retries, overflow from enqueueFiles) faster than
  // filesRef.current is updated.
  useEffect(() => {
    const hasPending = files.some((f) => f.status === 'pending')
    const hasOpenSlot = activeCount.current < MAX_CONCURRENT
    if (hasPending && hasOpenSlot) {
      drainQueue()
    }
  }, [files, drainQueue])

  function enqueueFiles(fileList: FileList) {
    const newItems: SoundtrackUploadState[] = []
    let hasRejected = false

    for (const file of Array.from(fileList)) {
      if (!isAcceptedAudio(file)) {
        hasRejected = true
        continue
      }
      newItems.push({
        id: generateId(),
        file,
        status: 'pending',
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
          ? ({
              ...f,
              status: 'pending' as SoundtrackUploadStatus,
              progress: 0,
              error: undefined,
            } satisfies SoundtrackUploadState)
          : f
      )
    )
    if (activeCount.current < MAX_CONCURRENT) {
      activeCount.current += 1
      void startUpload({
        ...item,
        status: 'pending',
        progress: 0,
        error: undefined,
      })
    }
    // If all slots are full, the useEffect watching `files` state will call
    // drainQueue once a slot opens and the pending item is visible.
  }

  // Map internal upload status to UploadItem status prop
  function toUploadItemStatus(
    status: SoundtrackUploadStatus
  ): 'queued' | 'uploading' | 'processing' | 'failed' {
    switch (status) {
      case 'pending':
        return 'queued'
      case 'uploading':
        return 'uploading'
      case 'done':
        return 'processing'
      case 'error':
        return 'failed'
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Dropzone
        variant={dropVariant}
        onFiles={enqueueFiles}
        accept="audio/mpeg,audio/mp4,audio/aac,audio/x-m4a,audio/wav,audio/x-wav,audio/flac,audio/x-flac,.mp3,.m4a,.aac,.wav,.flac"
        rejectedLabel="File type not supported"
        rejectedDescription="Please upload .mp3, .m4a, .aac, .wav, or .flac files"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      />

      {files.length > 0 && (
        <ul className="flex flex-col gap-2">
          {files.map((item) => (
            <li key={item.id}>
              <UploadItem
                name={item.file.name}
                status={toUploadItemStatus(item.status)}
                progress={item.progress}
                error={item.error}
                onRetry={
                  item.status === 'error'
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
