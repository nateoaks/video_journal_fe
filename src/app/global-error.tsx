'use client'

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error
  unstable_retry: () => void
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
          <p className="text-destructive text-sm">
            {error.message || 'Something went wrong.'}
          </p>
          <button onClick={unstable_retry} className="text-sm underline">
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
