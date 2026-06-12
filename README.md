# Video_journal_fe

Frontend application built with Next.js 16 (App Router), React 19, Tailwind CSS v4, and Clerk for authentication.

## Prerequisites

- [Bun](https://bun.sh) ≥ 1.3.5
- Node.js ≥ 24.16.0

## Getting Started

### 1. Install dependencies

```bash
bun install
```

### 2. Configure environment

Copy the example env file and fill in your values:

```bash
cp .env.local.example .env.local
```

The backend API defaults to `http://localhost:3001` for local development.

### 3. Start the dev server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command                 | Description                                             |
| ----------------------- | ------------------------------------------------------- |
| `bun dev`               | Start Next.js dev server (binds to `0.0.0.0:3000`)      |
| `bun run build`         | Production build                                        |
| `bun run start`         | Start production server                                 |
| `bun run lint`          | Run ESLint                                              |
| `bun run format`        | Format with Prettier                                    |
| `bun test`              | Run unit tests (Vitest)                                 |
| `bun run test:ui`       | Vitest UI                                               |
| `bun run test:coverage` | Unit test coverage report                               |
| `bun run test:e2e`      | Run Playwright end-to-end tests                         |
| `bun run storybook`     | Start Storybook on port 6006                            |
| `bun run check`         | Full pre-ship check: format + lint + test + e2e + audit |
| `bun run dev:clean`     | Wipe `.next` cache and restart dev server               |

## Architecture

See [docs/architecture.md](docs/architecture.md) for the full layered architecture guide, and [docs/example-tasks.md](docs/example-tasks.md) for a complete feature walkthrough.

```
src/
├── app/          — Next.js App Router pages (thin shells, ≤30 lines)
├── components/
│   ├── ui/       — Primitive, stateless UI components (cva + cn)
│   └── composite/— Components composed from ui/; no business logic
├── features/     — Self-contained feature modules (types, queries, actions, components)
├── hooks/        — Shared client-side UI hooks
├── lib/          — Utilities (cn, loggedFetch)
├── services/     — Shared API fetch helpers
└── types/        — Global TypeScript types
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS v4, shadcn/ui, Base UI
- **Auth**: Clerk
- **Validation**: Zod
- **Testing**: Vitest, Playwright, Storybook
- **Package manager**: Bun
