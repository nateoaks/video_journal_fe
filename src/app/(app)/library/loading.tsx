export default function Loading() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="bg-muted mb-6 h-7 w-24 animate-pulse rounded" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            {/* Thumbnail skeleton */}
            <div className="bg-muted aspect-video w-full animate-pulse rounded-lg" />
            {/* Footer skeleton */}
            <div className="bg-muted h-3 w-3/4 animate-pulse rounded" />
          </div>
        ))}
      </div>
    </main>
  )
}
