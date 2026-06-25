'use client'

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error
  unstable_retry: () => void
}) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <p className="text-destructive mb-4 text-sm">
        {error.message || 'Something went wrong.'}
      </p>
      <button onClick={unstable_retry} className="text-sm underline">
        Try again
      </button>
    </main>
  )
}
