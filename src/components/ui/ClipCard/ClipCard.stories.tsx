import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ClipCard } from './ClipCard'

const meta: Meta<typeof ClipCard> = {
  title: 'UI/ClipCard',
  component: ClipCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['ready', 'processing', 'failed'],
    },
    isTrimmed: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof ClipCard>

const baseArgs = {
  duration: '01:23',
  recordedDate: 'Mar 15, 2024',
  status: 'ready' as const,
}

export const Default: Story = {
  args: { ...baseArgs },
}

export const WithThumbnail: Story = {
  args: {
    ...baseArgs,
    thumbnailSrc: 'https://placehold.co/640x360/1a1a1a/white?text=Clip',
  },
}

export const Processing: Story = {
  args: {
    ...baseArgs,
    status: 'processing',
    duration: '--:--',
    recordedDate: 'Unknown date',
  },
}

export const Failed: Story = {
  args: {
    ...baseArgs,
    status: 'failed',
    duration: '--:--',
  },
}

export const Trimmed: Story = {
  args: {
    ...baseArgs,
    isTrimmed: true,
    duration: '00:45',
  },
}

export const Interactive: Story = {
  args: { ...baseArgs },
}
