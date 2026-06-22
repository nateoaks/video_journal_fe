import Link from 'next/link'
import { EmptyState } from '@/components/composite'
import { Button } from '@/components/ui'

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col px-6 py-6">
      <EmptyState
        title="Clip not found"
        description="This clip may have been deleted or the link is no longer valid."
        action={
          <Link href="/library">
            <Button variant="outline" size="sm">
              Back to library
            </Button>
          </Link>
        }
      />
    </main>
  )
}
