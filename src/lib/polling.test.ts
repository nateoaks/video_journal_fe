import { describe, it, expect } from 'vitest'
import { shouldPoll } from './polling'

describe('shouldPoll', () => {
  it('returns false for empty array', () => {
    expect(shouldPoll([])).toBe(false)
  })

  it('returns false when all clips are ready', () => {
    expect(shouldPoll([{ status: 'ready' }])).toBe(false)
  })

  it('returns false when all clips are in error state', () => {
    expect(shouldPoll([{ status: 'error' }])).toBe(false)
  })

  it('returns true when a clip is processing', () => {
    expect(shouldPoll([{ status: 'processing' }])).toBe(true)
  })

  it('returns true when a clip is uploading', () => {
    expect(shouldPoll([{ status: 'uploading' }])).toBe(true)
  })

  it('returns true when any clip is processing even if others are ready', () => {
    expect(shouldPoll([{ status: 'ready' }, { status: 'processing' }])).toBe(
      true
    )
  })

  it('returns true when any clip is uploading even if others are ready', () => {
    expect(shouldPoll([{ status: 'ready' }, { status: 'uploading' }])).toBe(
      true
    )
  })
})
