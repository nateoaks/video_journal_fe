import { type NextRequest } from 'next/server'

const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:8000'

// Route Handler takes priority over the next.config.ts rewrite, letting us
// set streaming headers explicitly rather than relying on the backend to send them.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const upstream = await fetch(
    `${backendUrl}/api/v1/compilations/${encodeURIComponent(id)}/events`,
    { headers: { Accept: 'text/event-stream' } }
  )

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      // Tells nginx/proxies not to buffer this response
      'X-Accel-Buffering': 'no',
    },
  })
}
