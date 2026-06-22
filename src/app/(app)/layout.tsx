import { Toaster } from 'sonner'
import { AppNav } from '@/components/composite/AppNav'
import { SelectedSoundtrackProvider } from '@/features/soundtracks'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SelectedSoundtrackProvider>
      <AppNav />
      {children}
      <Toaster />
    </SelectedSoundtrackProvider>
  )
}
