import { formatDuration, formatRecordedDate } from '@/lib/format'
import type { Clip } from '@/types/clip'

interface ClipMetadataProps {
  clip: Clip
}

export function ClipMetadata({ clip }: ClipMetadataProps) {
  const duration =
    clip.trim_in_s != null &&
    clip.trim_out_s != null &&
    clip.trim_out_s > clip.trim_in_s
      ? clip.trim_out_s - clip.trim_in_s
      : clip.duration_s
  const filename = clip.original_key.split('/').pop() ?? clip.original_key

  return (
    <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-4">
      <div className="flex flex-col gap-0.5">
        <dt className="text-muted-foreground text-xs tracking-wide uppercase">
          Recorded
        </dt>
        <dd className="font-medium">{formatRecordedDate(clip.recorded_at)}</dd>
      </div>
      <div className="flex flex-col gap-0.5">
        <dt className="text-muted-foreground text-xs tracking-wide uppercase">
          Duration
        </dt>
        <dd className="font-medium">{formatDuration(duration)}</dd>
      </div>
      {clip.width != null && clip.height != null && (
        <div className="flex flex-col gap-0.5">
          <dt className="text-muted-foreground text-xs tracking-wide uppercase">
            Resolution
          </dt>
          <dd className="font-medium">
            {clip.width}×{clip.height}
          </dd>
        </div>
      )}
      {clip.codec_name != null && (
        <div className="flex flex-col gap-0.5">
          <dt className="text-muted-foreground text-xs tracking-wide uppercase">
            Codec
          </dt>
          <dd className="font-mono font-medium">{clip.codec_name}</dd>
        </div>
      )}
      <div className="col-span-2 flex flex-col gap-0.5 sm:col-span-4">
        <dt className="text-muted-foreground text-xs tracking-wide uppercase">
          File
        </dt>
        <dd className="font-mono text-xs break-all">{filename}</dd>
      </div>
    </dl>
  )
}
