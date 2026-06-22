import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SoundtrackItem } from './SoundtrackItem'

const baseProps = {
  title: 'Morning Vibes',
  duration_s: 225,
  status: 'ready' as const,
  selected: false,
  audioSrc: '/api/v1/soundtracks/st_1/audio',
}

describe('SoundtrackItem', () => {
  it('renders the title', () => {
    render(<SoundtrackItem {...baseProps} />)
    expect(screen.getByText('Morning Vibes')).toBeInTheDocument()
  })

  it('renders formatted duration', () => {
    render(<SoundtrackItem {...baseProps} duration_s={225} />)
    expect(screen.getByText('03:45')).toBeInTheDocument()
  })

  it('renders "--:--" when duration_s is null', () => {
    render(<SoundtrackItem {...baseProps} duration_s={null} />)
    expect(screen.getByText('--:--')).toBeInTheDocument()
  })

  it('renders the audio element with the correct src when status is ready', () => {
    render(<SoundtrackItem {...baseProps} />)
    // audio elements don't have a standard ARIA role — use querySelector
    const audioEl = document.querySelector('audio')
    expect(audioEl).not.toBeNull()
    expect(audioEl?.getAttribute('src')).toBe('/api/v1/soundtracks/st_1/audio')
  })

  it('does not render the audio element when status is processing', () => {
    render(<SoundtrackItem {...baseProps} status="processing" />)
    const audioEl = document.querySelector('audio')
    expect(audioEl).toBeNull()
  })

  it('calls onSelect when select button is clicked', () => {
    const onSelect = vi.fn()
    render(<SoundtrackItem {...baseProps} onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('radio', { name: /select/i }))
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('calls onDelete when delete button is clicked', () => {
    const onDelete = vi.fn()
    render(<SoundtrackItem {...baseProps} onDelete={onDelete} />)
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(onDelete).toHaveBeenCalledTimes(1)
  })

  it('aria-checked reflects selected=true', () => {
    render(<SoundtrackItem {...baseProps} selected={true} />)
    const radio = screen.getByRole('radio', { name: /selected/i })
    expect(radio).toHaveAttribute('aria-checked', 'true')
  })

  it('aria-checked reflects selected=false', () => {
    render(<SoundtrackItem {...baseProps} selected={false} />)
    const radio = screen.getByRole('radio', { name: /select/i })
    expect(radio).toHaveAttribute('aria-checked', 'false')
  })

  it('select button is disabled when status is not ready', () => {
    render(<SoundtrackItem {...baseProps} status="processing" />)
    const radio = screen.getByRole('radio')
    expect(radio).toBeDisabled()
  })

  it('delete button is disabled when isDeleting is true', () => {
    render(<SoundtrackItem {...baseProps} isDeleting={true} />)
    const deleteBtn = screen.getByRole('button', { name: /delete/i })
    expect(deleteBtn).toBeDisabled()
  })

  it('shows Processing badge when status is processing', () => {
    render(<SoundtrackItem {...baseProps} status="processing" />)
    expect(screen.getByText('Processing')).toBeInTheDocument()
  })

  it('shows Failed badge when status is failed', () => {
    render(<SoundtrackItem {...baseProps} status="failed" />)
    expect(screen.getByText('Failed')).toBeInTheDocument()
  })

  it('does not show a badge when status is ready', () => {
    render(<SoundtrackItem {...baseProps} status="ready" />)
    expect(screen.queryByText('Processing')).not.toBeInTheDocument()
    expect(screen.queryByText('Failed')).not.toBeInTheDocument()
  })
})
