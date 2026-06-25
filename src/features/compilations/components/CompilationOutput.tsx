'use client'

import { buttonVariants } from '@/components/ui'
import { compilationVideoPath } from '@/services'
import type { Compilation } from '@/types/compilation'
import { formatDuration, downloadFilename } from '../lib'

export interface CompilationOutputProps {
  compilation: Compilation
  soundtrackTitle: string | null
}

export function CompilationOutput({
  compilation,
  soundtrackTitle,
}: CompilationOutputProps) {
  if (compilation.status === 'failed') {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-destructive text-sm font-medium">
          Compilation failed
        </p>
        {compilation.error && (
          <p className="text-muted-foreground text-sm">{compilation.error}</p>
        )}
      </div>
    )
  }

  if (compilation.status !== 'complete') {
    return null
  }

  const videoSrc = compilationVideoPath(compilation.id)
  const filename = downloadFilename()
  const clipCount = compilation.clips.length
  const duration = formatDuration(compilation.duration_s)

  return (
    <div className="flex flex-col gap-4">
      <video
        src={videoSrc}
        controls
        preload="metadata"
        playsInline
        className="border-border w-full rounded-lg border bg-black"
        aria-label="Compiled video output"
      />

      <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span>{duration}</span>
        <span>
          {clipCount} {clipCount === 1 ? 'clip' : 'clips'}
        </span>
        {soundtrackTitle && <span>{soundtrackTitle}</span>}
        {(compilation.mix_clip_audio ?? false) ? (
          <span>
            Clip audio mixed in ·{' '}
            {Math.round((compilation.clip_audio_volume ?? 0) * 100)}%
          </span>
        ) : (
          <span>Soundtrack only</span>
        )}
      </div>

      <a
        href={videoSrc}
        download={filename}
        className={buttonVariants({ variant: 'secondary' })}
      >
        Download
      </a>
    </div>
  )
}
