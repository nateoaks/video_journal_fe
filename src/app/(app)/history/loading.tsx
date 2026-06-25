export default function Loading() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="bg-muted mb-6 h-8 w-28 animate-pulse rounded" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-muted h-20 animate-pulse rounded-lg" />
        ))}
      </div>
    </main>
  )
}
