import { redirect } from 'next/navigation'
import { getClip } from '../queries'
import { Trimmer } from './Trimmer'

interface TrimmerPageProps {
  clipId: string
}

export async function TrimmerPage({ clipId }: TrimmerPageProps) {
  const clip = await getClip(clipId)

  if (clip.status !== 'ready') {
    redirect('/library')
  }

  return <Trimmer clip={clip} />
}
