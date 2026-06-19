export default function Loading() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="bg-muted mb-6 h-7 w-24 animate-pulse rounded" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-muted h-14 animate-pulse rounded-lg" />
        ))}
      </div>
    </main>
  )
}
