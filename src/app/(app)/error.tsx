'use client'

import { ErrorState } from '@/components/composite'

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

export default function Error({
  unstable_retry,
}: {
  _error?: Error
  unstable_retry: () => void
}) {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <ErrorState
        icon={<AlertIcon />}
        title="Something went wrong"
        description="An unexpected error occurred. Please try again."
        action={
          <button
            onClick={unstable_retry}
            className="text-sm underline underline-offset-4"
          >
            Try again
          </button>
        }
      />
    </main>
  )
}
