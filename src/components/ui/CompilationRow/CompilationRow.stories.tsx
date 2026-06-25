import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CompilationRow } from './CompilationRow'
import { Button } from '../Button'

const meta: Meta<typeof CompilationRow> = {
  title: 'UI/CompilationRow',
  component: CompilationRow,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['queued', 'pending', 'running', 'complete', 'failed'],
    },
  },
}
export default meta

type Story = StoryObj<typeof CompilationRow>

const baseArgs = {
  createdAt: '2024-06-01T10:30:00Z',
  soundtrackLabel: 'Upbeat Summer Track',
  mixMode: 'Soundtrack only',
  actions: (
    <Button size="sm" variant="outline">
      Delete
    </Button>
  ),
}

export const Default: Story = {
  args: {
    ...baseArgs,
    status: 'complete',
    duration: '2:34',
  },
}

export const Failed: Story = {
  args: {
    ...baseArgs,
    status: 'failed',
    error: (
      <p className="text-destructive text-xs break-words">
        Encoding failed: unable to read source clip at position 3.
      </p>
    ),
  },
}

export const Running: Story = {
  args: {
    ...baseArgs,
    status: 'running',
  },
}

export const LongError: Story = {
  args: {
    ...baseArgs,
    status: 'failed',
    error: (
      <p className="text-destructive text-xs break-words">
        An internal error occurred during compilation. The encoding pipeline
        returned a non-zero exit code (137) — this typically means the process
        was killed due to memory pressure. Please try again with fewer clips or
        shorter durations.
      </p>
    ),
  },
}
