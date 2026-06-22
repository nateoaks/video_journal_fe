import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SoundtrackItem } from './SoundtrackItem'

const meta: Meta<typeof SoundtrackItem> = {
  title: 'UI/SoundtrackItem',
  component: SoundtrackItem,
  tags: ['autodocs'],
  argTypes: {
    status: { control: 'select', options: ['ready', 'processing', 'failed'] },
    selected: { control: 'boolean' },
    isDeleting: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof SoundtrackItem>

const baseArgs = {
  title: 'Upbeat Morning Jingle',
  duration_s: 225,
  audioSrc: '',
}

export const Default: Story = {
  args: {
    ...baseArgs,
    status: 'ready',
    selected: false,
  },
}

export const Selected: Story = {
  args: {
    ...baseArgs,
    status: 'ready',
    selected: true,
  },
}

export const Processing: Story = {
  args: {
    ...baseArgs,
    status: 'processing',
    selected: false,
    duration_s: null,
  },
}

export const Failed: Story = {
  args: {
    ...baseArgs,
    status: 'failed',
    selected: false,
    duration_s: null,
  },
}

export const LongTitle: Story = {
  args: {
    ...baseArgs,
    title:
      'This is a very long soundtrack title that tests how the component handles overflow in narrow containers',
    status: 'ready',
    selected: false,
  },
}
