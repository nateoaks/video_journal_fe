import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CompilationOutput } from './CompilationOutput'
import type { Compilation } from '@/types/compilation'

function makeCompilation(overrides: Partial<Compilation> = {}): Compilation {
  return {
    id: 'comp_1',
    status: 'complete',
    progress: 100,
    duration_s: 125,
    clips: [
      { clip_id: 'clip_a', position: 0, trim_in_s: 0, trim_out_s: 10 },
      { clip_id: 'clip_b', position: 1, trim_in_s: 0, trim_out_s: 5 },
    ],
    output_key: 'outputs/comp_1.mp4',
    ...overrides,
  }
}

describe('CompilationOutput', () => {
  describe('complete state', () => {
    it('renders a video element', () => {
      render(
        <CompilationOutput
          compilation={makeCompilation()}
          soundtrackTitle={null}
        />
      )
      const video = document.querySelector('video')
      expect(video).not.toBeNull()
    })

    it('sets video src to the compilation video path', () => {
      render(
        <CompilationOutput
          compilation={makeCompilation({ id: 'comp_abc' })}
          soundtrackTitle={null}
        />
      )
      const video = document.querySelector('video')
      expect(video?.getAttribute('src')).toBe(
        '/api/v1/compilations/comp_abc/video'
      )
    })

    it('displays the formatted duration', () => {
      render(
        <CompilationOutput
          compilation={makeCompilation({ duration_s: 125 })}
          soundtrackTitle={null}
        />
      )
      // 125s = 2:05
      expect(screen.getByText('2:05')).toBeInTheDocument()
    })

    it('displays the clip count', () => {
      render(
        <CompilationOutput
          compilation={makeCompilation()}
          soundtrackTitle={null}
        />
      )
      expect(screen.getByText('2 clips')).toBeInTheDocument()
    })

    it('uses singular "clip" for a single clip', () => {
      render(
        <CompilationOutput
          compilation={makeCompilation({
            clips: [
              { clip_id: 'clip_a', position: 0, trim_in_s: 0, trim_out_s: 10 },
            ],
          })}
          soundtrackTitle={null}
        />
      )
      expect(screen.getByText('1 clip')).toBeInTheDocument()
    })

    it('displays the soundtrack title when provided', () => {
      render(
        <CompilationOutput
          compilation={makeCompilation()}
          soundtrackTitle="Summer Vibes"
        />
      )
      expect(screen.getByText('Summer Vibes')).toBeInTheDocument()
    })

    it('omits the soundtrack title when null', () => {
      render(
        <CompilationOutput
          compilation={makeCompilation()}
          soundtrackTitle={null}
        />
      )
      // No soundtrack title element should be present
      expect(screen.queryByText(/vibes/i)).not.toBeInTheDocument()
    })

    it('renders a download link with the correct href', () => {
      render(
        <CompilationOutput
          compilation={makeCompilation({ id: 'comp_dl' })}
          soundtrackTitle={null}
        />
      )
      const link = screen.getByRole('link', { name: /download/i })
      expect(link).toHaveAttribute('href', '/api/v1/compilations/comp_dl/video')
    })

    it('download link has the download attribute set', () => {
      render(
        <CompilationOutput
          compilation={makeCompilation()}
          soundtrackTitle={null}
        />
      )
      const link = screen.getByRole('link', { name: /download/i })
      const downloadAttr = link.getAttribute('download')
      expect(downloadAttr).toMatch(/^video-journal-\d{4}-\d{2}-\d{2}\.mp4$/)
    })

    it('displays 0:00 when duration_s is null', () => {
      render(
        <CompilationOutput
          compilation={makeCompilation({ duration_s: null })}
          soundtrackTitle={null}
        />
      )
      expect(screen.getByText('0:00')).toBeInTheDocument()
    })

    it('renders "Soundtrack only" when mix_clip_audio is false', () => {
      render(
        <CompilationOutput
          compilation={makeCompilation({ mix_clip_audio: false })}
          soundtrackTitle={null}
        />
      )
      expect(screen.getByText('Soundtrack only')).toBeInTheDocument()
    })

    it('renders "Soundtrack only" when mix_clip_audio is undefined (backward compat)', () => {
      render(
        <CompilationOutput
          compilation={makeCompilation()}
          soundtrackTitle={null}
        />
      )
      expect(screen.getByText('Soundtrack only')).toBeInTheDocument()
    })

    it('renders clip audio mixed label with correct percentage when mix_clip_audio is true', () => {
      render(
        <CompilationOutput
          compilation={makeCompilation({
            mix_clip_audio: true,
            clip_audio_volume: 0.4,
          })}
          soundtrackTitle={null}
        />
      )
      expect(screen.getByText('Clip audio mixed in · 40%')).toBeInTheDocument()
    })

    it('rounds clip_audio_volume percentage', () => {
      render(
        <CompilationOutput
          compilation={makeCompilation({
            mix_clip_audio: true,
            clip_audio_volume: 0.333,
          })}
          soundtrackTitle={null}
        />
      )
      expect(screen.getByText('Clip audio mixed in · 33%')).toBeInTheDocument()
    })
  })

  describe('failed state', () => {
    it('does not render a video element', () => {
      render(
        <CompilationOutput
          compilation={makeCompilation({
            status: 'failed',
            error_message: 'Codec not supported',
          })}
          soundtrackTitle={null}
        />
      )
      const video = document.querySelector('video')
      expect(video).toBeNull()
    })

    it('displays the error message', () => {
      render(
        <CompilationOutput
          compilation={makeCompilation({
            status: 'failed',
            error_message: 'Codec not supported',
          })}
          soundtrackTitle={null}
        />
      )
      expect(screen.getByText('Codec not supported')).toBeInTheDocument()
    })

    it('shows a failure heading', () => {
      render(
        <CompilationOutput
          compilation={makeCompilation({
            status: 'failed',
            error_message: 'Something went wrong',
          })}
          soundtrackTitle={null}
        />
      )
      expect(screen.getByText(/compilation failed/i)).toBeInTheDocument()
    })

    it('does not render a download link', () => {
      render(
        <CompilationOutput
          compilation={makeCompilation({ status: 'failed' })}
          soundtrackTitle={null}
        />
      )
      expect(
        screen.queryByRole('link', { name: /download/i })
      ).not.toBeInTheDocument()
    })
  })

  describe('non-terminal states', () => {
    it('renders nothing for running status', () => {
      const { container } = render(
        <CompilationOutput
          compilation={makeCompilation({ status: 'running', duration_s: null })}
          soundtrackTitle={null}
        />
      )
      expect(container.firstChild).toBeNull()
    })

    it('renders nothing for queued status', () => {
      const { container } = render(
        <CompilationOutput
          compilation={makeCompilation({ status: 'queued', duration_s: null })}
          soundtrackTitle={null}
        />
      )
      expect(container.firstChild).toBeNull()
    })
  })
})
