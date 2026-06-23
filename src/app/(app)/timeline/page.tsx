import { TimelinePage } from '@/features/timeline'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ compilationId?: string }>
}) {
  return <TimelinePage searchParams={searchParams} />
}
