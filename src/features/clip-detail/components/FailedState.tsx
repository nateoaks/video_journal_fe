import { EmptyState } from '@/components/composite'

interface FailedStateProps {
  errorMessage: string | null
}

export function FailedState({ errorMessage }: FailedStateProps) {
  return (
    <EmptyState
      icon={
        <svg
          className="text-destructive h-12 w-12"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      }
      title="Processing failed"
      description={
        errorMessage ??
        'This clip could not be processed. You may want to delete it and try uploading again.'
      }
    />
  )
}
