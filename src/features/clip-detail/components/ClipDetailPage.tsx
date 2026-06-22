import { getClipDetail } from '../queries'
import { ClipDetailNav } from './ClipDetailNav'
import { ClipMetadata } from './ClipMetadata'
import { ClipDetailActions } from './ClipDetailActions'
import { UnsavedTrimGuard } from './UnsavedTrimGuard'
import { ProcessingState } from './ProcessingState'
import { FailedState } from './FailedState'

interface ClipDetailPageProps {
  clipId: string
}

export async function ClipDetailPage({ clipId }: ClipDetailPageProps) {
  const { clip, prevId, nextId } = await getClipDetail(clipId)

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-6">
      <ClipDetailNav prevId={prevId} nextId={nextId} />

      <div className="flex items-start justify-between gap-4">
        <ClipMetadata clip={clip} />
        <ClipDetailActions clipId={clip.id} />
      </div>

      {clip.status === 'ready' && <UnsavedTrimGuard clip={clip} />}
      {clip.status === 'processing' && <ProcessingState />}
      {clip.status === 'failed' && (
        <FailedState errorMessage={clip.error_message} />
      )}
    </main>
  )
}
