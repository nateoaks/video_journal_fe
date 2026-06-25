import { describe, it, expect } from 'vitest'
import { formatDuration, formatRecordedDate, formatBytes } from './format'

describe('formatDuration', () => {
  it('formats 0 seconds as 00:00', () => {
    expect(formatDuration(0)).toBe('00:00')
  })

  it('formats 5 seconds as 00:05', () => {
    expect(formatDuration(5)).toBe('00:05')
  })

  it('formats 65 seconds as 01:05', () => {
    expect(formatDuration(65)).toBe('01:05')
  })

  it('formats 3600 seconds as 60:00', () => {
    expect(formatDuration(3600)).toBe('60:00')
  })

  it('returns --:-- for null', () => {
    expect(formatDuration(null)).toBe('--:--')
  })

  it('returns --:-- for undefined', () => {
    expect(formatDuration(undefined)).toBe('--:--')
  })
})

describe('formatBytes', () => {
  it('returns "—" for null', () => {
    expect(formatBytes(null)).toBe('—')
  })

  it('returns "—" for undefined', () => {
    expect(formatBytes(undefined)).toBe('—')
  })

  it('returns "0 B" for zero', () => {
    expect(formatBytes(0)).toBe('0 B')
  })

  it('formats bytes under 1 KB as plain bytes', () => {
    expect(formatBytes(512)).toBe('512 B')
  })

  it('formats values in KB range with one decimal', () => {
    expect(formatBytes(1536)).toBe('1.5 KB')
  })

  it('formats values in MB range with one decimal', () => {
    expect(formatBytes(1024 * 1024 * 2.5)).toBe('2.5 MB')
  })

  it('formats values in GB range with one decimal', () => {
    expect(formatBytes(1024 * 1024 * 1024 * 3)).toBe('3.0 GB')
  })
})

describe('formatRecordedDate', () => {
  it('formats a known ISO string to a human-readable date', () => {
    // Use UTC date to avoid timezone variance across envs
    const result = formatRecordedDate('2024-03-15T10:30:00.000Z')
    // Should contain the year and day at minimum
    expect(result).toMatch(/2024/)
    expect(result).toMatch(/15/)
  })

  it('returns "Unknown date" for null', () => {
    expect(formatRecordedDate(null)).toBe('Unknown date')
  })

  it('returns "Unknown date" for undefined', () => {
    expect(formatRecordedDate(undefined)).toBe('Unknown date')
  })

  it('returns "Unknown date" for an invalid date string', () => {
    expect(formatRecordedDate('not-a-date')).toBe('Unknown date')
  })
})
