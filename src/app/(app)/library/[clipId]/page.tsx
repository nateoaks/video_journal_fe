import { ClipDetailPage } from '@/features/clip-detail'

export default async function Page({
  params,
}: {
  params: Promise<{ clipId: string }>
}) {
  const { clipId } = await params
  return <ClipDetailPage clipId={clipId} />
}
