import { listReadyClips } from '../queries'
import { EmptyState } from '@/components/composite'
import { getCompilation } from '@/services/compilations'
import { getSoundtrack } from '@/services/soundtracks'
import type { Compilation } from '@/types/compilation'
import { CompileBar, isTerminal } from '@/features/compilations'
import { TimelineBoard } from './TimelineBoard'

interface TimelinePageProps {
  searchParams: Promise<{ compilationId?: string }>
}

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

export async function TimelinePage({ searchParams }: TimelinePageProps) {
  const { compilationId } = await searchParams
  const clips = await listReadyClips()

  let compilation: Compilation | undefined
  let soundtrackTitle: string | null = null

  if (compilationId) {
    try {
      compilation = await getCompilation(compilationId)

      // Fetch the soundtrack title only in a terminal state:
      // earlier states don't have final metadata ready, and we avoid extra
      // roundtrips while the compilation is actively running.
      if (isTerminal(compilation.status) && compilation.soundtrack_id) {
        try {
          const soundtrack = await getSoundtrack(compilation.soundtrack_id)
          soundtrackTitle = soundtrack.title
        } catch {
          // Soundtrack may have been deleted — not fatal
        }
      }
    } catch {
      // Expired or invalid compilationId — silently ignore
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Timeline</h1>
      {clips.length === 0 ? (
        <EmptyState
          icon={<VideoIcon />}
          title="No ready clips"
          description="Clips will appear here once they finish processing."
        />
      ) : (
        <>
          <TimelineBoard initialClips={clips} />
          <div className="mt-8">
            <CompileBar
              clips={clips}
              compilation={compilation}
              soundtrackTitle={soundtrackTitle}
            />
          </div>
        </>
      )}
    </main>
  )
}
