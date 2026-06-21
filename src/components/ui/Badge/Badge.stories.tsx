import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Badge } from './Badge'

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'processing', 'failed', 'outline'],
    },
  },
}
export default meta

type Story = StoryObj<typeof Badge>

export const Default: Story = { args: { children: 'Ready' } }

export const Processing: Story = {
  args: { variant: 'processing', children: 'Processing' },
}

export const Failed: Story = {
  args: { variant: 'failed', children: 'Failed' },
}

export const Outline: Story = {
  args: { variant: 'outline', children: '01:23' },
}

export const Interactive: Story = {
  args: { variant: 'default', children: 'Badge label' },
}
