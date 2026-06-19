import { listClips } from '../queries'
import { shouldPoll } from '@/lib/polling'
import { LibraryPoller } from './LibraryPoller'
import { Card } from '@/components/ui'

export async function LibraryPage() {
  const clips = await listClips()
  const active = shouldPoll(clips)

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Library</h1>
      <LibraryPoller active={active} />
      {clips.length === 0 ? (
        <p className="text-muted-foreground text-sm">No clips yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {clips.map((clip) => (
            <li key={clip.id}>
              <Card className="px-4 py-3" padding="none">
                <p className="text-sm font-medium">{clip.original_key}</p>
                <p className="text-muted-foreground text-xs">{clip.status}</p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
