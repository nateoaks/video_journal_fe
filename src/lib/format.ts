/**
 * Formats a duration in seconds to mm:ss display string.
 * Returns '--:--' for null/undefined inputs.
 */
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null) return '--:--'
  const totalSeconds = Math.max(0, Math.floor(seconds))
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

/**
 * Formats a byte count to a human-readable string.
 * Returns '—' for null/undefined, '0 B' for zero,
 * and scales to KB/MB/GB with one decimal for values >= 1 KB.
 */
export function formatBytes(bytes: number | null | undefined): string {
  if (bytes == null) return '—'
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  )
  if (i === 0) return `${bytes} B`
  const value = bytes / Math.pow(1024, i)
  return `${value.toFixed(1)} ${units[i]}`
}

/**
 * Formats an ISO date string to a human-readable date label.
 * Returns 'Unknown date' for null/undefined inputs.
 */
export function formatRecordedDate(iso: string | null | undefined): string {
  if (!iso) return 'Unknown date'
  const date = new Date(iso)
  if (isNaN(date.getTime())) return 'Unknown date'
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
