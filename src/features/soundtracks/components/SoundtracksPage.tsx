import { listSoundtracks } from '../queries'
import { EmptyState } from '@/components/composite'
import { SoundtrackUploader } from './SoundtrackUploader'
import { SoundtrackPoller } from './SoundtrackPoller'
import { SoundtrackList } from './SoundtrackList'

function MusicIcon() {
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
        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
      />
    </svg>
  )
}

export async function SoundtracksPage() {
  const soundtracks = await listSoundtracks()
  const active = soundtracks.some((s) => s.status === 'processing')

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Soundtracks</h1>
      <div className="mb-8">
        <SoundtrackUploader />
      </div>
      <SoundtrackPoller active={active} />
      {soundtracks.length === 0 ? (
        <EmptyState
          icon={<MusicIcon />}
          title="No soundtracks yet"
          description="Upload your first audio file to get started."
        />
      ) : (
        <SoundtrackList soundtracks={soundtracks} />
      )}
    </main>
  )
}
