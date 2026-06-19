// POLL_INTERVAL_MS and shouldPoll are the single source of truth for polling config — no hardcoded intervals elsewhere.
export const POLL_INTERVAL_MS = 4000

export function shouldPoll(clips: { status: string }[]): boolean {
  return clips.some((c) => c.status === 'processing')
}
