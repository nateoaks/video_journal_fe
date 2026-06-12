# Example App: Tasks Feature

A complete walkthrough of building a **Tasks** feature from scratch. Every file is shown in full. This demonstrates exactly how all layers fit together in a real feature.

The final result: an authenticated `/tasks` page where users can view, create, and complete tasks fetched from a backend API.

---

## What we're building

```
GET  /tasks           → list user's tasks
POST /tasks           → create a task
POST /tasks/:id/complete → mark a task complete
```

Pages:

- `/tasks` — shows task list + create form

---

## Step 1 — Types

Start here. Define the data shapes before writing any logic.

```ts
// src/features/tasks/types.ts

export type TaskStatus = 'pending' | 'completed'

export interface Task {
  id: string
  title: string
  status: TaskStatus
  createdAt: string
}

export interface CreateTaskInput {
  title: string
}
```

---

## Step 2 — Queries (server-side data fetching)

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
    // Next.js cache: revalidate every 30s, or on-demand via revalidatePath
    next: { revalidate: 30 },
  })

  if (!res.ok) throw new Error(`Failed to fetch tasks: ${res.status}`)

  const data = (await res.json()) as { items: Task[] }
  return data.items
}
```

---

## Step 3 — Actions (mutations)

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
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

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

export async function completeTask(taskId: string): Promise<void> {
  const { userId, getToken } = await auth()
  if (!userId) redirect('/sign-in')

  const token = await getToken()
  if (!token) redirect('/sign-in')

  const res = await fetch(`${process.env.API_URL}/tasks/${taskId}/complete`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) throw new Error(`Failed to complete task: ${res.status}`)

  revalidatePath('/tasks')
}
```

> Zod is used to validate user input before it touches the API. Install it: `bun add zod`

---

## Step 4 — UI primitive: TaskItem

This component renders a single task row. It lives in `components/ui/` because it's a pure presentational primitive that could be reused anywhere.

```tsx
// src/components/ui/TaskItem/TaskItem.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const taskItemVariants = cva(
  'flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors',
  {
    variants: {
      status: {
        pending: 'border-border bg-card',
        completed: 'border-border bg-muted opacity-60',
      },
    },
    defaultVariants: { status: 'pending' },
  }
)

export interface TaskItemProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof taskItemVariants> {
  title: string
  createdAt: string
  onComplete?: () => void
  isCompleting?: boolean
}

export function TaskItem({
  title,
  createdAt,
  status,
  onComplete,
  isCompleting,
  className,
  ...props
}: TaskItemProps) {
  return (
    <div className={cn(taskItemVariants({ status }), className)} {...props}>
      <button
        onClick={onComplete}
        disabled={status === 'completed' || isCompleting}
        aria-label={status === 'completed' ? 'Task completed' : 'Mark complete'}
        className="border-muted-foreground hover:border-primary flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors disabled:pointer-events-none"
      >
        {status === 'completed' && (
          <svg
            className="text-primary size-3"
            fill="currentColor"
            viewBox="0 0 12 12"
          >
            <path d="M10.28 2.28L4.5 8.06 1.72 5.28 0 7l4.5 4.5 7.5-7.5-1.72-1.72z" />
          </svg>
        )}
      </button>
      <div className="flex flex-1 flex-col gap-0.5">
        <span
          className={cn(
            'text-sm font-medium',
            status === 'completed' && 'text-muted-foreground line-through'
          )}
        >
          {title}
        </span>
        <span className="text-muted-foreground text-xs">
          {new Date(createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  )
}
```

```ts
// src/components/ui/TaskItem/index.ts
export { TaskItem } from './TaskItem'
export type { TaskItemProps } from './TaskItem'
```

Add to `src/components/ui/index.ts`:

```ts
export { TaskItem } from './TaskItem'
export type { TaskItemProps } from './TaskItem'
```

---

## Step 5 — Story for TaskItem

```tsx
// src/components/ui/TaskItem/TaskItem.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { TaskItem } from './TaskItem'

const meta: Meta<typeof TaskItem> = {
  title: 'UI/TaskItem',
  component: TaskItem,
  tags: ['autodocs'],
  argTypes: {
    status: { control: 'select', options: ['pending', 'completed'] },
    isCompleting: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof TaskItem>

const baseArgs = {
  title: 'Review pull request',
  createdAt: '2024-06-01T10:00:00Z',
}

export const Default: Story = { args: { ...baseArgs } }

export const Completed: Story = {
  args: { ...baseArgs, status: 'completed' },
}

export const Completing: Story = {
  args: { ...baseArgs, isCompleting: true },
}

export const LongTitle: Story = {
  args: {
    ...baseArgs,
    title:
      'This is a very long task title that tests how the component handles overflow in narrow containers',
  },
}
```

---

## Step 6 — Feature components

### TaskList (client component — handles "complete" interaction)

```tsx
// src/features/tasks/components/TaskList.tsx
'use client'

import { useTransition } from 'react'
import { TaskItem } from '@/components/ui'
import { completeTask } from '../actions'
import type { Task } from '../types'

interface TaskListProps {
  tasks: Task[]
}

export function TaskList({ tasks }: TaskListProps) {
  const [isPending, startTransition] = useTransition()

  if (tasks.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">
        No tasks yet. Add one above.
      </p>
    )
  }

  function handleComplete(taskId: string) {
    startTransition(async () => {
      await completeTask(taskId)
    })
  }

  return (
    <ul className="flex flex-col gap-2">
      {tasks.map((task) => (
        <li key={task.id}>
          <TaskItem
            title={task.title}
            createdAt={task.createdAt}
            status={task.status}
            onComplete={() => handleComplete(task.id)}
            isCompleting={isPending}
          />
        </li>
      ))}
    </ul>
  )
}
```

### CreateTaskForm (client component — handles form submission)

```tsx
// src/features/tasks/components/CreateTaskForm.tsx
'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui'
import { createTask } from '../actions'

const initialState = {}

export function CreateTaskForm() {
  const [state, formAction, isPending] = useActionState(
    createTask,
    initialState
  )

  return (
    <form action={formAction} className="mb-6 flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          name="title"
          placeholder="What needs to be done?"
          required
          maxLength={200}
          className="border-input bg-background placeholder:text-muted-foreground focus:ring-ring flex-1 rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
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

> `useActionState` is the React 19 API for wiring a server action to a form with progressive enhancement. It replaces the older `useFormState`.

### TasksPage (server component — data owner)

```tsx
// src/features/tasks/components/TasksPage.tsx
import { listTasks } from '../queries'
import { TaskList } from './TaskList'
import { CreateTaskForm } from './CreateTaskForm'

export async function TasksPage() {
  const tasks = await listTasks()

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Tasks</h1>
        <p className="text-muted-foreground text-sm">
          {tasks.filter((t) => t.status === 'pending').length} pending
        </p>
      </div>
      <CreateTaskForm />
      <TaskList tasks={tasks} />
    </main>
  )
}
```

---

## Step 7 — Public API

```ts
// src/features/tasks/index.ts
export { TasksPage } from './components/TasksPage'
export { createTask, completeTask } from './actions'
export { listTasks } from './queries'
export type { Task, CreateTaskInput, TaskStatus } from './types'
```

---

## Step 8 — Page route

```tsx
// src/app/(chrome)/tasks/page.tsx
import { TasksPage } from '@/features/tasks'

export default function Page() {
  return <TasksPage />
}
```

That's 3 lines. The page knows nothing about data fetching or business logic.

---

## Step 9 — Auth guard

The `(chrome)` layout already provides the header. Protect the `/tasks` route with its own layout:

```tsx
// src/app/(chrome)/tasks/layout.tsx
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function TasksLayout({
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

## Step 10 — Loading state

Add a skeleton that streams in while the server component fetches data:

```tsx
// src/app/(chrome)/tasks/loading.tsx
export default function Loading() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-2">
        <div className="bg-muted h-7 w-24 animate-pulse rounded" />
        <div className="bg-muted h-4 w-16 animate-pulse rounded" />
      </div>
      <div className="mb-6 flex gap-2">
        <div className="bg-muted h-9 flex-1 animate-pulse rounded-md" />
        <div className="bg-muted h-9 w-24 animate-pulse rounded-md" />
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

## Step 11 — Unit test for the action

```ts
// src/features/tasks/actions.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn().mockResolvedValue({
    userId: 'user_123',
    getToken: vi.fn().mockResolvedValue('test-token'),
  }),
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

const { createTask } = await import('./actions')

describe('createTask', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns error for empty title', async () => {
    const formData = new FormData()
    formData.set('title', '')

    const result = await createTask(undefined, formData)

    expect(result.error).toBeDefined()
  })

  it('calls the API with validated input', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 'task_1' }), { status: 201 })
      )

    const formData = new FormData()
    formData.set('title', 'Write tests')

    const result = await createTask(undefined, formData)

    expect(result.error).toBeUndefined()
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/tasks'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ title: 'Write tests' }),
      })
    )
  })
})
```

---

## Step 12 — E2E test

```ts
// e2e/tasks.e2e.ts
import { test, expect } from '@playwright/test'

test.describe('Tasks', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in via Clerk test credentials or a test helper
    await page.goto('/tasks')
  })

  test('shows the tasks page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Tasks' })).toBeVisible()
  })

  test('creates a new task', async ({ page }) => {
    const title = `Test task ${Date.now()}`
    await page.getByPlaceholder('What needs to be done?').fill(title)
    await page.getByRole('button', { name: 'Add task' }).click()
    await expect(page.getByText(title)).toBeVisible()
  })
})
```

---

## Final file tree

```
src/
├── components/ui/
│   └── TaskItem/
│       ├── TaskItem.tsx
│       ├── TaskItem.stories.tsx
│       └── index.ts
│
├── features/tasks/
│   ├── types.ts
│   ├── queries.ts
│   ├── actions.ts
│   ├── index.ts
│   └── components/
│       ├── TasksPage.tsx        ← server component
│       ├── TaskList.tsx         ← client component
│       └── CreateTaskForm.tsx   ← client component
│
└── app/(chrome)/tasks/
    ├── layout.tsx               ← auth guard
    ├── loading.tsx              ← skeleton
    └── page.tsx                 ← 3-line shell

e2e/tasks.e2e.ts
src/features/tasks/actions.test.ts
```

---

## The pattern in one diagram

```
app/tasks/page.tsx
  └── TasksPage (server, async)
        ├── listTasks() ← queries.ts
        ├── CreateTaskForm (client)
        │     └── createTask() ← actions.ts
        └── TaskList (client)
              ├── TaskItem (ui primitive)
              └── completeTask() ← actions.ts
```

Data flows down as props. Mutations flow up through server actions. The server component is the single owner of all fetched data.
