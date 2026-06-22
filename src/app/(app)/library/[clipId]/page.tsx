import { TrimmerPage } from '@/features/trimmer'

export default async function Page({
  params,
}: {
  params: Promise<{ clipId: string }>
}) {
  const { clipId } = await params
  return <TrimmerPage clipId={clipId} />
}
