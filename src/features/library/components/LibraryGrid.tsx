import Link from 'next/link'
import { ClipCard } from '@/components/ui'
import { formatDuration, formatRecordedDate } from '@/lib/format'
import { clipFilmstripPath, effectiveDuration } from '../lib'
import type { Clip } from '../types'

interface LibraryGridProps {
  clips: Clip[]
}

export function LibraryGrid({ clips }: LibraryGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {clips.map((clip) => {
        const duration = formatDuration(effectiveDuration(clip))
        const recordedDate = formatRecordedDate(clip.recorded_at)
        const isTrimmed =
          clip.trim_in_s != null && clip.trim_out_s != null

        const card = (
          <ClipCard
            thumbnailSrc={
              clip.filmstrip_key ? clipFilmstripPath(clip.id) : null
            }
            duration={duration}
            recordedDate={recordedDate}
            status={clip.status}
            isTrimmed={isTrimmed}
          />
        )

        if (clip.status === 'ready') {
          return (
            <Link
              key={clip.id}
              href={`/library/${clip.id}`}
              className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
            >
              {card}
            </Link>
          )
        }

        return (
          <div key={clip.id} aria-label={`Clip ${clip.status}`}>
            {card}
          </div>
        )
      })}
    </div>
  )
}
