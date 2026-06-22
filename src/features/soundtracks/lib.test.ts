import { describe, it, expect } from 'vitest'
import { formatDuration } from '@/lib/format'
import { isAcceptedAudio, sortSoundtracks } from './lib'
import type { Soundtrack } from './types'

function makeSoundtrack(overrides: Partial<Soundtrack>): Soundtrack {
  return {
    id: 'st-1',
    title: 'Test Track',
    duration_s: 120,
    status: 'ready',
    error_message: null,
    ...overrides,
  }
}

describe('isAcceptedAudio', () => {
  it('accepts audio/mpeg (mp3) by MIME type', () => {
    const file = new File([''], 'track.mp3', { type: 'audio/mpeg' })
    expect(isAcceptedAudio(file)).toBe(true)
  })

  it('accepts audio/mp4 (m4a) by MIME type', () => {
    const file = new File([''], 'track.m4a', { type: 'audio/mp4' })
    expect(isAcceptedAudio(file)).toBe(true)
  })

  it('accepts audio/aac by MIME type', () => {
    const file = new File([''], 'track.aac', { type: 'audio/aac' })
    expect(isAcceptedAudio(file)).toBe(true)
  })

  it('accepts audio/x-m4a by MIME type', () => {
    const file = new File([''], 'track.m4a', { type: 'audio/x-m4a' })
    expect(isAcceptedAudio(file)).toBe(true)
  })

  it('accepts audio/wav by MIME type', () => {
    const file = new File([''], 'track.wav', { type: 'audio/wav' })
    expect(isAcceptedAudio(file)).toBe(true)
  })

  it('accepts audio/x-wav by MIME type', () => {
    const file = new File([''], 'track.wav', { type: 'audio/x-wav' })
    expect(isAcceptedAudio(file)).toBe(true)
  })

  it('accepts audio/flac by MIME type', () => {
    const file = new File([''], 'track.flac', { type: 'audio/flac' })
    expect(isAcceptedAudio(file)).toBe(true)
  })

  it('accepts audio/x-flac by MIME type', () => {
    const file = new File([''], 'track.flac', { type: 'audio/x-flac' })
    expect(isAcceptedAudio(file)).toBe(true)
  })

  it('accepts .mp3 by extension fallback when MIME is empty', () => {
    const file = new File([''], 'track.mp3', { type: '' })
    expect(isAcceptedAudio(file)).toBe(true)
  })

  it('accepts .m4a by extension fallback', () => {
    const file = new File([''], 'track.m4a', { type: '' })
    expect(isAcceptedAudio(file)).toBe(true)
  })

  it('accepts .wav by extension fallback', () => {
    const file = new File([''], 'track.wav', { type: '' })
    expect(isAcceptedAudio(file)).toBe(true)
  })

  it('accepts .flac by extension fallback', () => {
    const file = new File([''], 'track.flac', { type: '' })
    expect(isAcceptedAudio(file)).toBe(true)
  })

  it('rejects video/mp4', () => {
    const file = new File([''], 'video.mp4', { type: 'video/mp4' })
    expect(isAcceptedAudio(file)).toBe(false)
  })

  it('rejects image/png', () => {
    const file = new File([''], 'image.png', { type: 'image/png' })
    expect(isAcceptedAudio(file)).toBe(false)
  })

  it('rejects .txt extension', () => {
    const file = new File([''], 'document.txt', { type: '' })
    expect(isAcceptedAudio(file)).toBe(false)
  })
})

describe('formatDuration', () => {
  it('returns "--:--" for null', () => {
    expect(formatDuration(null)).toBe('--:--')
  })

  it('formats seconds correctly (03:45 for 225s)', () => {
    expect(formatDuration(225)).toBe('03:45')
  })

  it('pads both minutes and seconds with leading zero', () => {
    expect(formatDuration(65)).toBe('01:05')
  })

  it('handles zero seconds', () => {
    expect(formatDuration(0)).toBe('00:00')
  })

  it('handles exactly 60 seconds', () => {
    expect(formatDuration(60)).toBe('01:00')
  })

  it('handles large values', () => {
    expect(formatDuration(3661)).toBe('61:01')
  })

  it('truncates fractional seconds', () => {
    expect(formatDuration(90.9)).toBe('01:30')
  })
})

describe('sortSoundtracks', () => {
  it('sorts ready before processing before failed', () => {
    const soundtracks = [
      makeSoundtrack({ id: 'failed', status: 'failed' }),
      makeSoundtrack({ id: 'processing', status: 'processing' }),
      makeSoundtrack({ id: 'ready', status: 'ready' }),
    ]
    const sorted = sortSoundtracks(soundtracks)
    expect(sorted.map((s) => s.id)).toEqual(['ready', 'processing', 'failed'])
  })

  it('sorts by title within the same status group', () => {
    const soundtracks = [
      makeSoundtrack({ id: 'b', status: 'ready', title: 'B Track' }),
      makeSoundtrack({ id: 'a', status: 'ready', title: 'A Track' }),
    ]
    const sorted = sortSoundtracks(soundtracks)
    expect(sorted.map((s) => s.id)).toEqual(['a', 'b'])
  })

  it('does not mutate the original array', () => {
    const soundtracks = [
      makeSoundtrack({ id: 'b', status: 'failed' }),
      makeSoundtrack({ id: 'a', status: 'ready' }),
    ]
    const original = [...soundtracks]
    sortSoundtracks(soundtracks)
    expect(soundtracks[0].id).toBe(original[0].id)
  })

  it('handles empty array', () => {
    expect(sortSoundtracks([])).toEqual([])
  })
})
