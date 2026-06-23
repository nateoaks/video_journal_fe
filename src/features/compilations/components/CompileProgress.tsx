import { ProgressBar } from '@/components/ui'
import type { CompilationStatus } from '@/types/compilation'
import { cn } from '@/lib/utils'

interface CompileProgressProps {
  status: CompilationStatus | null
  progress: number
  error: string | null
  className?: string
}

function statusLabel(status: CompilationStatus | null): string {
  switch (status) {
    case 'queued':
      return 'Queued…'
    case 'running':
      return 'Compiling…'
    case 'complete':
      return 'Complete'
    case 'failed':
      return 'Failed'
    default:
      return 'Starting…'
  }
}

function progressVariant(
  status: CompilationStatus | null
): 'default' | 'error' | 'complete' {
  if (status === 'failed') return 'error'
  if (status === 'complete') return 'complete'
  return 'default'
}

export function CompileProgress({
  status,
  progress,
  error,
  className,
}: CompileProgressProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium">{statusLabel(status)}</span>
        <span className="text-muted-foreground text-xs">{progress}%</span>
      </div>
      <ProgressBar value={progress} variant={progressVariant(status)} />
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  )
}
