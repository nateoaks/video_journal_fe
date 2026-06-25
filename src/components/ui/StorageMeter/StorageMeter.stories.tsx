import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { StorageMeter } from './StorageMeter'

const meta: Meta<typeof StorageMeter> = {
  title: 'UI/StorageMeter',
  component: StorageMeter,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof StorageMeter>

const fullSegments = [
  {
    label: 'Originals',
    formatted: '1.2 GB',
    bytes: 1_200_000_000,
    totalBytes: 5_000_000_000,
  },
  {
    label: 'Normalized',
    formatted: '800.0 MB',
    bytes: 800_000_000,
    totalBytes: 5_000_000_000,
  },
  {
    label: 'Filmstrips',
    formatted: '45.0 MB',
    bytes: 45_000_000,
    totalBytes: 5_000_000_000,
  },
  {
    label: 'Soundtracks',
    formatted: '120.0 MB',
    bytes: 120_000_000,
    totalBytes: 5_000_000_000,
  },
  {
    label: 'Outputs',
    formatted: '2.8 GB',
    bytes: 2_800_000_000,
    totalBytes: 5_000_000_000,
  },
]

export const Default: Story = {
  args: {
    total: '4.9 GB',
    segments: fullSegments,
  },
}

export const ZeroState: Story = {
  args: {
    total: '0 B',
    segments: [
      { label: 'Originals', formatted: '0 B', bytes: 0, totalBytes: 0 },
      { label: 'Normalized', formatted: '0 B', bytes: 0, totalBytes: 0 },
      { label: 'Filmstrips', formatted: '0 B', bytes: 0, totalBytes: 0 },
      { label: 'Soundtracks', formatted: '0 B', bytes: 0, totalBytes: 0 },
      { label: 'Outputs', formatted: '0 B', bytes: 0, totalBytes: 0 },
    ],
  },
}
