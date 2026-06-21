export default function Loading() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-2">
        <div className="bg-muted h-7 w-20 animate-pulse rounded" />
        <div className="bg-muted h-4 w-48 animate-pulse rounded" />
      </div>
      <div className="border-border bg-muted h-52 animate-pulse rounded-xl border-2 border-dashed" />
    </main>
  )
}
