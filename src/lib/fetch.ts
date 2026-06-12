function sanitizeHeaders(
  headers: HeadersInit | undefined
): Record<string, string> {
  const entries =
    headers instanceof Headers
      ? [...headers.entries()]
      : Object.entries(headers ?? {})

  return Object.fromEntries(
    entries.map(([k, v]) => {
      const lower = k.toLowerCase()
      if (lower === 'authorization' || lower === 'cookie') {
        return [k, v.slice(0, 10) + '…']
      }
      return [k, v]
    })
  )
}

export async function loggedFetch(
  url: string,
  init?: RequestInit
): Promise<Response> {
  const method = init?.method ?? 'GET'
  const tag = `[API] ${method} ${url}`
  console.log(tag, {
    headers: sanitizeHeaders(init?.headers),
    body: init?.body,
  })
  const res = await fetch(url, init)
  const clone = res.clone()
  const body = await clone.text().catch(() => '(unreadable)')
  console.log(`${tag} → ${res.status}`, {
    headers: sanitizeHeaders(res.headers),
    body,
  })
  return res
}
