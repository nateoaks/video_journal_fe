import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ErrorState } from './ErrorState'

function AlertIcon() {
  return (
    <svg
      className="h-12 w-12"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
      />
    </svg>
  )
}

const meta: Meta<typeof ErrorState> = {
  title: 'Composite/ErrorState',
  component: ErrorState,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof ErrorState>

export const Default: Story = {
  args: {
    title: 'Something went wrong',
    description: 'An unexpected error occurred. Please try again.',
  },
}

export const WithIcon: Story = {
  args: {
    icon: <AlertIcon />,
    title: 'Something went wrong',
    description: 'An unexpected error occurred. Please try again.',
  },
}

export const WithAction: Story = {
  args: {
    icon: <AlertIcon />,
    title: 'Something went wrong',
    description: 'An unexpected error occurred.',
    action: (
      <button className="text-sm underline underline-offset-4">
        Try again
      </button>
    ),
  },
}

export const TitleOnly: Story = {
  args: {
    title: 'Failed to load',
  },
}
