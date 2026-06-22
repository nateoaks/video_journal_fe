import type { Soundtrack } from './types'

export const ACCEPTED_AUDIO_MIME = new Set([
  'audio/mpeg',
  'audio/mp4',
  'audio/aac',
  'audio/x-m4a',
  'audio/wav',
  'audio/x-wav',
  'audio/flac',
  'audio/x-flac',
])

export const ACCEPTED_AUDIO_EXTENSIONS = new Set([
  'mp3',
  'm4a',
  'aac',
  'wav',
  'flac',
])

export function isAcceptedAudio(file: File): boolean {
  if (ACCEPTED_AUDIO_MIME.has(file.type)) return true
  const ext = file.name.split('.').pop()?.toLowerCase()
  return ext !== undefined && ACCEPTED_AUDIO_EXTENSIONS.has(ext)
}

const STATUS_ORDER: Record<Soundtrack['status'], number> = {
  ready: 0,
  processing: 1,
  failed: 2,
}

export function sortSoundtracks(soundtracks: Soundtrack[]): Soundtrack[] {
  return [...soundtracks].sort((a, b) => {
    const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
    if (statusDiff !== 0) return statusDiff
    return a.title.localeCompare(b.title)
  })
}

export { formatDuration } from '@/lib/format'
