import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SelectedSoundtrackProvider, useSelectedSoundtrack } from './context'

function TestConsumer() {
  const { selectedId, setSelectedId } = useSelectedSoundtrack()
  return (
    <div>
      <span data-testid="selected-id">{selectedId ?? 'none'}</span>
      <button onClick={() => setSelectedId('st_1')}>Select st_1</button>
      <button onClick={() => setSelectedId(null)}>Deselect</button>
    </div>
  )
}

describe('SelectedSoundtrackProvider', () => {
  it('provides initial selectedId as null', () => {
    render(
      <SelectedSoundtrackProvider>
        <TestConsumer />
      </SelectedSoundtrackProvider>
    )
    expect(screen.getByTestId('selected-id').textContent).toBe('none')
  })

  it('updates selectedId when setSelectedId is called', () => {
    render(
      <SelectedSoundtrackProvider>
        <TestConsumer />
      </SelectedSoundtrackProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Select st_1' }))
    expect(screen.getByTestId('selected-id').textContent).toBe('st_1')
  })

  it('resets selectedId to null when setSelectedId(null) is called', () => {
    render(
      <SelectedSoundtrackProvider>
        <TestConsumer />
      </SelectedSoundtrackProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Select st_1' }))
    fireEvent.click(screen.getByRole('button', { name: 'Deselect' }))
    expect(screen.getByTestId('selected-id').textContent).toBe('none')
  })
})

describe('useSelectedSoundtrack outside provider', () => {
  it('throws when used outside SelectedSoundtrackProvider', () => {
    function BadConsumer() {
      useSelectedSoundtrack()
      return null
    }

    expect(() => render(<BadConsumer />)).toThrow(
      'useSelectedSoundtrack must be used within a SelectedSoundtrackProvider'
    )
  })
})
