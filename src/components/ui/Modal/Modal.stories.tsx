import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Modal } from './Modal'

const meta: Meta<typeof Modal> = {
  title: 'UI/Modal',
  component: Modal,
  tags: ['autodocs'],
  argTypes: {
    open: { control: 'boolean' },
    title: { control: 'text' },
    description: { control: 'text' },
  },
}
export default meta

type Story = StoryObj<typeof Modal>

export const Default: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <button onClick={() => setOpen(true)} className="text-sm underline">
          Open modal
        </button>
        <Modal {...args} open={open} onOpenChange={setOpen} />
      </>
    )
  },
  args: {
    title: 'Confirm action',
    description: 'Are you sure you want to do this?',
    children: <p className="text-sm">This action cannot be undone.</p>,
    footer: (
      <>
        <button className="text-sm">Cancel</button>
        <button className="text-sm font-medium">Confirm</button>
      </>
    ),
  },
}

export const Open: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    title: 'Open Modal',
    description: 'This modal is forced open for the story.',
    children: <p className="text-sm">Modal body content goes here.</p>,
  },
}
