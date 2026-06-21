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
