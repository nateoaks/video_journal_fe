import { formatBytes } from '@/lib/format'
import { StorageMeter } from '@/components/ui'
import { getStorageUsageSafe } from '../queries'

interface StorageUsageProps {
  className?: string
}

export async function StorageUsage({ className }: StorageUsageProps = {}) {
  const usage = await getStorageUsageSafe()
  if (!usage) return null

  const total = formatBytes(usage.totalBytes)
  const segments = [
    {
      label: 'Originals',
      formatted: formatBytes(usage.originalsBytes),
      bytes: usage.originalsBytes,
      totalBytes: usage.totalBytes,
    },
    {
      label: 'Normalized',
      formatted: formatBytes(usage.normalizedBytes),
      bytes: usage.normalizedBytes,
      totalBytes: usage.totalBytes,
    },
    {
      label: 'Filmstrips',
      formatted: formatBytes(usage.filmstripsBytes),
      bytes: usage.filmstripsBytes,
      totalBytes: usage.totalBytes,
    },
    {
      label: 'Soundtracks',
      formatted: formatBytes(usage.soundtracksBytes),
      bytes: usage.soundtracksBytes,
      totalBytes: usage.totalBytes,
    },
    {
      label: 'Outputs',
      formatted: formatBytes(usage.outputsBytes),
      bytes: usage.outputsBytes,
      totalBytes: usage.totalBytes,
    },
  ]

  return (
    <StorageMeter total={total} segments={segments} className={className} />
  )
}
