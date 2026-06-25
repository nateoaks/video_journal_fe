import { Suspense } from 'react'
import { listClips } from '../queries'
import { shouldPoll } from '@/lib/polling'
import { sortClips } from '../lib'
import { EmptyState } from '@/components/composite'
import { LibraryPoller } from './LibraryPoller'
import { LibraryGrid } from './LibraryGrid'
import { StorageUsage } from '@/features/storage'

function VideoIcon() {
  return (
    <svg
      className="h-12 w-12"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  )
}

export async function LibraryPage() {
  const clips = await listClips()
  const active = shouldPoll(clips)

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Library</h1>
      <Suspense
        fallback={
          <div className="bg-muted mb-6 h-24 animate-pulse rounded-lg" />
        }
      >
        <StorageUsage />
      </Suspense>
      <LibraryPoller active={active} />
      {clips.length === 0 ? (
        <EmptyState
          icon={<VideoIcon />}
          title="No clips yet"
          description="Upload your first video to get started."
        />
      ) : (
        <LibraryGrid clips={sortClips(clips)} />
      )}
    </main>
  )
}
