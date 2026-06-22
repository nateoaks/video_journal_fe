export default function Loading() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-6">
      {/* Nav skeleton */}
      <div className="flex items-center gap-2">
        <div className="bg-muted h-8 w-16 animate-pulse rounded-md" />
        <div className="ml-auto flex gap-1">
          <div className="bg-muted h-8 w-14 animate-pulse rounded-md" />
          <div className="bg-muted h-8 w-14 animate-pulse rounded-md" />
        </div>
      </div>

      {/* Metadata + actions skeleton */}
      <div className="flex items-start justify-between gap-4">
        <div className="grid flex-1 grid-cols-4 gap-x-8 gap-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="bg-muted h-3 w-16 animate-pulse rounded" />
              <div className="bg-muted h-4 w-24 animate-pulse rounded" />
            </div>
          ))}
        </div>
        <div className="bg-muted h-8 w-24 animate-pulse rounded-md" />
      </div>

      {/* Video skeleton */}
      <div className="bg-muted aspect-video w-full animate-pulse rounded-lg" />

      {/* Scrubber skeleton */}
      <div className="bg-muted h-16 w-full animate-pulse rounded" />

      {/* Time display skeleton */}
      <div className="flex gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1">
            <div className="bg-muted h-3 w-8 animate-pulse rounded" />
            <div className="bg-muted h-5 w-16 animate-pulse rounded" />
          </div>
        ))}
      </div>

      {/* Button skeleton */}
      <div className="flex gap-3">
        <div className="bg-muted h-9 w-20 animate-pulse rounded-md" />
        <div className="bg-muted h-9 w-24 animate-pulse rounded-md" />
      </div>
    </main>
  )
}
