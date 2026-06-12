# UI Components

## Component Anatomy

Every `ui/` component follows this structure:

```tsx
// Button.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-brand-500 text-white hover:bg-brand-600',
        secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200',
        ghost: 'hover:bg-neutral-100',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
)

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
}

export function Button({
  variant,
  size,
  isLoading,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? <Spinner size="sm" /> : children}
    </button>
  )
}
```

---

## TypeScript Rules

- All component props must be explicitly typed with an exported interface
- Prefer `React.ComponentPropsWithoutRef<"div">` extension over re-declaring common HTML props
- Use `VariantProps<typeof variantsFn>` from `cva` for variant prop types
- Avoid `any`; use `unknown` and narrow types instead
- Add `"use client"` only when the component needs browser APIs or event handlers

---

## Styling Rules

- Use Tailwind utility classes for all styling
- Use `cva` (class-variance-authority) for components with variants
- Use `cn()` (from `@/lib/utils`) for conditional class merging — never string concatenation
- CSS variables for design tokens are defined in `globals.css` and consumed via Tailwind config
- No inline `style={{}}` props except for dynamic values that can't be expressed as classes (e.g., a progress bar width percentage)
- No CSS modules, no styled-components

---

## shadcn/ui Usage

- shadcn components live in `components/ui/` and are treated as primitives
- Customize shadcn components by editing their file directly — do not wrap them in another component just to change styles
- If you need a variation not supported by the component's existing props, extend `variants` using `cva` inside the same file
- Never copy-paste shadcn component code into feature components; always import from `components/ui/`
- When adding a new shadcn component: `npx shadcn@latest add [component]`, then immediately write its story

---

## Storybook Rules

Every `ui/` and `composite/` component **must** have a `.stories.tsx` file.

**Required stories:**

1. `Default` — most common usage
2. One story per meaningful variant (`Primary`, `Secondary`, `Destructive`, etc.)
3. `AllSizes` — if the component has size variants
4. `Interactive` — using `args` so the controls panel works
5. `Loading` / `Disabled` — when applicable

**Story template:**

```tsx
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select' },
    size: { control: 'select' },
    isLoading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof Button>

export const Default: Story = { args: { children: 'Click me' } }
export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Secondary' },
}
export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Delete' },
}
export const Loading: Story = {
  args: { isLoading: true, children: 'Saving...' },
}
export const Disabled: Story = {
  args: { disabled: true, children: 'Unavailable' },
}
```

**Story title conventions:**

- `"UI/ComponentName"` for `ui/` components
- `"Composite/ComponentName"` for `composite/` components
- `"Features/FeatureName/ComponentName"` for feature-specific components

---

## Step-by-Step: Adding a New UI Component

**Pre-flight check — before writing any new primitive code:**

1. Read `src/components/ui/index.ts`. Does an installed component already cover this via its variants/sizes? `Button` already ships `variant: 'destructive' | 'ghost' | 'outline' | 'secondary' | 'link'` and `size: 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg'`, so most icon-button and pill-button use cases are already covered.
2. Does shadcn ship this primitive? Check ui.shadcn.com or run `npx shadcn@latest view [name]`. If yes, install via `npx shadcn@latest add [name]` and write a story for it — done.
3. Only build a fully custom primitive if both checks fail. Justify the "custom" decision in the PR description.

**If step 3 applies — building a custom primitive:**

1. Create folder: `src/components/ui/ComponentName/`
2. Create `ComponentName.tsx` — implement with `cva` variants, forward HTML props
3. Create `index.ts` — `export { ComponentName } from './ComponentName'`
4. Create `ComponentName.stories.tsx` — cover Default + all variants + states
5. Add export to `src/components/ui/index.ts`
6. Verify in Storybook before using in any feature

---

## What Claude Should Do

**Asked to build a UI component:**

- Check if it already exists in `ui/` or as a shadcn component first
- If building new: follow the "Adding a New UI Component" steps above
- Implement with full variant support using `cva`
- Write the story file alongside the component
- Keep it completely free of business logic

**Asked to add a feature:**

- Identify which `ui/` and `composite/` components it needs — build missing ones first
- Create the feature module in `features/`
- Wire data in hooks, not in component bodies
- Page file should just render the feature component

**Asked to fix a styling issue:**

- Trace the value back to a design token
- Fix the token or Tailwind config, not the individual component's hardcoded value

**Asked to add analytics / tracking:**

- Add tracking calls inside hooks or server actions
- Never add `track()` calls directly in JSX component bodies

---

## Common Mistakes

| Wrong                                                         | Right                                         |
| ------------------------------------------------------------- | --------------------------------------------- |
| `fetch()` inside a component body                             | Move to a hook or server component            |
| `style={{ color: '#3b82f6' }}`                                | Use a Tailwind class mapped to a design token |
| Wrapping shadcn Button in another Button                      | Edit the shadcn file directly                 |
| Writing feature logic in a page file                          | Create a feature module                       |
| Skipping the story file                                       | Always write the story                        |
| Importing a feature's internal component from another feature | Move shared components to `composite/`        |
| ``className={`btn ${isActive ? 'active' : ''}`}``             | Use `cn()` and `cva`                          |

---

## Component Checklist

Run before marking any component work done:

- [ ] Exported TypeScript interface for props
- [ ] Forwards HTML props where applicable
- [ ] No business logic, API calls, or analytics in the component
- [ ] Variants defined with `cva`, not conditionals
- [ ] Classes merged with `cn()`
- [ ] Story file exists with Default + all variants covered
- [ ] Added to barrel export (`index.ts`)
- [ ] Verified in Storybook locally
