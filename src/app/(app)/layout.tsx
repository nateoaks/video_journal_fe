import { Toaster } from 'sonner'
import { AppNav } from '@/components/composite/AppNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppNav />
      {children}
      <Toaster />
    </>
  )
}
