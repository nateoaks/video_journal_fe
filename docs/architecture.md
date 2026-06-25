# Project Architecture

## Philosophy

This app follows a strict **layered architecture**: design tokens (CSS vars) → primitive UI components → composite components → feature modules → pages.

```
globals.css CSS vars
      ↓
  ui/ components          (primitive, stateless, no logic)
      ↓
  composite/ components   (composed from ui/, still no logic)
      ↓
  features/               (data fetching, mutations, business logic)
      ↓
  app/ pages              (thin routing shell, ≤30 lines)
```

**Golden rule**: UI components are dumb. They render and emit events. That's it.

**Data fetching rule**: Fetch data in server components; mutate data via server actions. Never use SWR, React Query, or `useEffect`+`fetch` for data fetching — that work belongs in server components and server actions.

Every layer may only import from layers above it. A feature may never import from another feature's internals.

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx                      ← Root layout (fonts, ClerkProvider, body)
│   ├── (chrome)/                       ← Authenticated shell with top nav
│   │   ├── layout.tsx                  ← Header with UserButton
│   │   └── home/
│   │       ├── layout.tsx              ← Auth guard (redirects to /sign-in if logged out)
│   │       └── page.tsx
│   └── (auth)/                         ← Sign-in / sign-up (no chrome)
│       ├── sign-in/[[...sign-in]]/page.tsx
│       └── sign-up/[[...sign-up]]/page.tsx
│
├── components/
│   ├── ui/                             ← Primitive, stateless UI components
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.stories.tsx
│   │   │   └── index.ts
│   │   ├── Badge/
│   │   ├── Input/
│   │   ├── Switch/                     ← Toggle control
│   │   ├── Slider/                     ← Range input control
│   │   ├── ... (one folder per component)
│   │   └── index.ts                    ← Barrel export for all ui/ components
│   │
│   └── composite/                      ← Built from ui/ components; still no business logic
│       ├── EmptyState/
│       ├── PageHeader/
│       ├── ... (one folder per composite)
│       └── index.ts
│
├── features/                           ← Self-contained feature modules
│   └── [feature-name]/
│       ├── types.ts
│       ├── queries.ts
│       ├── actions.ts
│       ├── index.ts
│       └── components/
│           ├── FeaturePage.tsx         ← Server component: fetches data, composes layout
│           └── FeatureForm.tsx         ← Client component: handles interaction
│
├── hooks/                              ← Shared client-side UI hooks only (no data fetching)
├── lib/
│   ├── utils.ts                        ← cn() helper
│   └── fetch.ts                        ← loggedFetch() debug helper
├── services/                           ← Shared API fetch helpers (see Cross-Feature Sharing)
├── types/                              ← Global TypeScript types
└── test/
    └── setup.ts
```

---

## Layer 1 — UI Primitives (`src/components/ui/`)

Purely presentational. They receive data and callbacks as props; they never fetch, mutate, or make routing decisions.

Every primitive uses the same four-part structure:

```tsx
// src/components/ui/Badge/Badge.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// 1. Variants — all visual states declared here, never in conditionals
const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground',
        outline: 'text-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

// 2. Props interface — export it so callers can type their own props
export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

// 3. Component — forward HTML props, merge classes with cn()
export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

// 4. Export variants for consumers that need to apply them elsewhere
export { badgeVariants }
```

```ts
// src/components/ui/Badge/index.ts
export { Badge, badgeVariants } from './Badge'
export type { BadgeProps } from './Badge'
```

```ts
// src/components/ui/index.ts  ← add one line after creating each component
export { Badge, badgeVariants } from './Badge'
export type { BadgeProps } from './Badge'
```

**What does NOT belong here**: API calls, `useRouter`, auth checks, analytics, any side effects beyond visual state.

---

## Layer 2 — Composite Components (`src/components/composite/`)

Wire together multiple `ui/` components into a reusable pattern. May have internal UI state (open/closed, active tab) but still no business logic or data fetching.

```tsx
// src/components/composite/EmptyState/EmptyState.tsx
import { cn } from '@/lib/utils'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-4 py-12 text-center',
        className
      )}
    >
      {icon && <div className="text-muted-foreground">{icon}</div>}
      <div className="flex flex-col gap-1">
        <p className="font-semibold">{title}</p>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}
```

---

## Layer 3 — Feature Modules (`src/features/[name]/`)

### Directory structure (required for every feature)

```
src/features/my-feature/
├── types.ts          ← TypeScript interfaces — no imports from other features/
├── queries.ts        ← Server-side data fetching (called only from server components)
├── actions.ts        ← Server actions ("use server") for all mutations
├── index.ts          ← Public API — only export what other layers need
└── components/
    ├── MyFeaturePage.tsx    ← Server component: fetches data, composes layout
    └── MyFeatureForm.tsx    ← Client component ("use client"): handles interaction
```

### types.ts

Plain interfaces only. No imports from other features.

```ts
// src/features/tasks/types.ts
export interface Task {
  id: string
  title: string
  status: 'pending' | 'completed'
  createdAt: string
}

export type CreateTaskInput = Pick<Task, 'title'>
```

### queries.ts

Pure async functions. Called only from server components. Never imported by client components.

```ts
// src/features/tasks/queries.ts
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import type { Task } from './types'

export async function listTasks(): Promise<Task[]> {
  const { userId, getToken } = await auth()
  if (!userId) redirect('/sign-in')

  const token = await getToken()
  if (!token) redirect('/sign-in')

  const res = await fetch(`${process.env.API_URL}/tasks`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 30 },
  })

  if (!res.ok) throw new Error(`Failed to fetch tasks: ${res.status}`)

  const data = (await res.json()) as { items: Task[] }
  return data.items
}
```

Rules:

- Always authenticate before fetching — `auth()` returns the signed-in user or redirects
- Use `process.env.API_URL` (server-only), not `NEXT_PUBLIC_API_URL`
- Throw on non-ok responses — let the Next.js error boundary handle it
- Never `try/catch` to swallow errors here

### actions.ts

Server actions handle all mutations. The only place POST/PUT/DELETE calls happen.

```ts
// src/features/tasks/actions.ts
'use server'

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const CreateTaskSchema = z.object({
  title: z.string().min(1).max(200),
})

export async function createTask(
  _prevState: unknown,
  formData: FormData
): Promise<{ error?: string }> {
  const { userId, getToken } = await auth()
  if (!userId) redirect('/sign-in')

  const token = await getToken()
  if (!token) redirect('/sign-in')

  const parsed = CreateTaskSchema.safeParse({ title: formData.get('title') })
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const res = await fetch(`${process.env.API_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(parsed.data),
  })

  if (!res.ok) throw new Error(`Failed to create task: ${res.status}`)

  revalidatePath('/tasks')
  return {}
}
```

Rules:

- `'use server'` at the top of the file
- Always authenticate before mutating
- Validate user input with Zod before using it (security requirement)
- Call `revalidatePath` or `revalidateTag` after mutations to refresh server data

### Server component (data owner)

```tsx
// src/features/tasks/components/TasksPage.tsx
import { listTasks } from '../queries'
import { TaskList } from './TaskList'
import { CreateTaskForm } from './CreateTaskForm'

export async function TasksPage() {
  const tasks = await listTasks()

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Tasks</h1>
      <CreateTaskForm />
      <TaskList tasks={tasks} />
    </main>
  )
}
```

Use `Promise.all` when fetching multiple independent sources:

```tsx
const [tasks, users] = await Promise.all([listTasks(), listUsers()])
```

### Client component (interaction owner)

```tsx
// src/features/tasks/components/CreateTaskForm.tsx
'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui'
import { createTask } from '../actions'

export function CreateTaskForm() {
  const [state, formAction, isPending] = useActionState(createTask, {})

  return (
    <form action={formAction} className="mb-6 flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          name="title"
          placeholder="Add a task…"
          required
          className="border-input bg-background flex-1 rounded-md border px-3 py-2 text-sm"
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Adding…' : 'Add task'}
        </Button>
      </div>
      {state?.error && (
        <p className="text-destructive text-sm">{state.error}</p>
      )}
    </form>
  )
}
```

Rules:

- `'use client'` at the very top
- Use `useActionState` (React 19) to wire server actions to forms — not `useEffect`+`fetch`
- No direct API calls — mutations go through `actions.ts` only
- UI state only: form values, loading flags, open/closed

### index.ts — the public API

Only export what pages and other features need. Internal helpers stay private.

```ts
// src/features/tasks/index.ts
export { TasksPage } from './components/TasksPage'
export { createTask } from './actions'
export { listTasks } from './queries'
export type { Task, CreateTaskInput } from './types'
```

---

## Layer 4 — Pages (`src/app/`)

Pages are thin. They import one feature component and render it. No business logic.

```tsx
// src/app/(chrome)/tasks/page.tsx
import { TasksPage } from '@/features/tasks'

export default function Page() {
  return <TasksPage />
}
```

For dynamic routes — `params` is async in Next.js 15+:

```tsx
// src/app/(chrome)/tasks/[taskId]/page.tsx
import { TaskDetailPage } from '@/features/tasks'

export default async function Page({
  params,
}: {
  params: Promise<{ taskId: string }>
}) {
  const { taskId } = await params
  return <TaskDetailPage taskId={taskId} />
}
```

Rules:

- Always a server component (no `'use client'`)
- Under 30 lines
- No fetching, no business logic

---

## Route Groups and Layouts

Use route groups `(groupName)` to share layouts without affecting the URL:

```
src/app/
├── layout.tsx                          ← Root layout (fonts, ClerkProvider, body)
├── (chrome)/                           ← Authenticated shell with top nav
│   ├── layout.tsx                      ← Header with UserButton
│   ├── page.tsx                        ← Redirects to /home
│   └── home/
│       ├── layout.tsx                  ← Auth guard
│       └── page.tsx
└── (auth)/                             ← Sign-in / sign-up (no chrome)
    ├── sign-in/[[...sign-in]]/page.tsx
    └── sign-up/[[...sign-up]]/page.tsx
```

Auth guard layout pattern:

```tsx
// src/app/(chrome)/home/layout.tsx
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  return <>{children}</>
}
```

---

## Suspense and Loading States

Use `loading.tsx` (Next.js convention) or `Suspense` with skeleton fallbacks for any server component that fetches data:

```tsx
// src/app/(chrome)/tasks/loading.tsx
export default function Loading() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-2">
        <div className="bg-muted h-7 w-24 animate-pulse rounded" />
        <div className="bg-muted h-4 w-16 animate-pulse rounded" />
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-muted h-14 animate-pulse rounded-lg" />
        ))}
      </div>
    </main>
  )
}
```

---

## Cross-Feature Sharing

Features never import each other's internals. If two features need the same query result, they each call their own query. If the same fetch logic appears three or more times, move it to `src/services/` as a shared helper.

```ts
// src/services/api.ts
export function apiUrl(path: string) {
  return `${process.env.API_URL}${path}`
}

export async function apiFetch(
  path: string,
  token: string,
  init?: RequestInit
) {
  const res = await fetch(apiUrl(path), {
    ...init,
    headers: { ...init?.headers, Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`)
  return res.json()
}
```

If two features need the same component, move it to `src/components/composite/`.

---

## What Never to Do

| Don't                                                | Do instead                                           |
| ---------------------------------------------------- | ---------------------------------------------------- |
| `fetch()` inside a client component                  | Put it in `queries.ts`, call from a server component |
| `useEffect` + `fetch` for mutations                  | Use a server action + `useActionState`               |
| Import `features/chat/internal` from `features/home` | Move the shared piece to `composite/`                |
| Business logic in a page file                        | Create a feature module                              |
| Direct API calls in a component                      | `queries.ts` or `actions.ts` only                    |
| `style={{ color: '#3b82f6' }}`                       | Use a Tailwind class (`text-primary`)                |
| `className={\`btn \${active ? 'active' : ''}\`}`     | Use `cn()` and `cva`                                 |
| Skipping the story file                              | Always write the story alongside the component       |
