import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Card } from './Card'

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'muted'] },
    padding: { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
  },
}
export default meta

type Story = StoryObj<typeof Card>

export const Default: Story = {
  args: { children: 'Card content' },
}

export const Muted: Story = {
  args: { variant: 'muted', children: 'Muted card content' },
}

export const AllPadding: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Card padding="none">Padding: none</Card>
      <Card padding="sm">Padding: sm</Card>
      <Card padding="md">Padding: md</Card>
      <Card padding="lg">Padding: lg</Card>
    </div>
  ),
}

export const Interactive: Story = {
  args: {
    children: 'Interactive card',
    variant: 'default',
    padding: 'md',
  },
}
