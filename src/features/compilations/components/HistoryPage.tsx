import { listCompilations } from '../queries'
import { isTerminal } from '../lib'
import { listSoundtracks } from '@/services'
import { EmptyState } from '@/components/composite'
import { HistoryList } from './HistoryList'

function FilmIcon() {
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
        d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
      />
    </svg>
  )
}

export async function HistoryPage() {
  const [compilations, soundtracks] = await Promise.all([
    listCompilations(),
    listSoundtracks(),
  ])
  const active = compilations.some((c) => !isTerminal(c.status))
  const sorted = [...compilations].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  const soundtrackMap = Object.fromEntries(
    soundtracks.map((s) => [s.id, s.title])
  )

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold">History</h1>
      {compilations.length === 0 ? (
        <EmptyState
          icon={<FilmIcon />}
          title="No compilations yet"
          description="Start a compilation from the Timeline to see it here."
        />
      ) : (
        <HistoryList
          compilations={sorted}
          soundtrackMap={soundtrackMap}
          active={active}
        />
      )}
    </main>
  )
}
