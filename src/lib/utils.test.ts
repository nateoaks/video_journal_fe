import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('deduplicates conflicting Tailwind classes (tailwind-merge)', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
    expect(cn('text-sm', 'text-lg')).toBe('text-lg')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'excluded', 'included')).toBe('base included')
  })

  it('handles undefined and null', () => {
    expect(cn('base', undefined, null, 'end')).toBe('base end')
  })
})
