# Frontend

@AGENTS.md

## Project Architecture

```
src/
├── app/            — Next.js App Router pages (thin — layout + feature composition only)
├── components/
│   ├── ui/         — Primitive, stateless UI components (cva + cn, no business logic)
│   └── composite/  — Components composed from ui/; still no business logic
├── features/       — Self-contained feature modules (types, queries, actions, components)
├── hooks/          — Shared client-side UI hooks only (no data fetching)
├── lib/            — Utilities and helpers (cn, loggedFetch)
├── services/       — Shared API fetch helpers
└── types/          — Global TypeScript types
```

Each feature under `src/features/` owns its `types.ts`, `queries.ts` (server-only data fetching), `actions.ts` ("use server" mutations), and `components/`. Pages in `src/app/` are thin shells that render one feature server component — no business logic in page files.

## Reference Docs

@docs/architecture.md
@docs/ui-components.md
@docs/example-tasks.md
