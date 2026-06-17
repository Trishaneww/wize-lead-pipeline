@AGENTS.md

# Wize Studios — Lead Generation & Outreach Platform

Internal tool for a web design agency. Finds local businesses with weak websites,
audits each site, uses Claude to qualify the lead and draft a personalized outreach
email leading with a specific, true problem found on that business's site, and
presents everything in a dashboard. The operator reviews, edits, and approves each
draft, then pushes it to Gmail as a **draft** to send manually.

## Hard safety constraints (non-negotiable)

- **Never auto-send.** The system stops at Gmail `drafts.create`. No `messages.send`
  path exists anywhere in the codebase.
- Every generated outreach body must include clear sender identification and an
  opt-out / unsubscribe line (CASL).
- Source leads only via the Google Places API — never scrape Google Maps.
- Encrypt the Gmail refresh token at rest in Postgres (use `TOKEN_ENCRYPTION_KEY`).
- The operator reviews and edits every draft before any send.

## Cost & security guardrails (tracked deliverables)

Goal: no runaway Anthropic spend, and no way for an outsider to trigger paid API
calls on our behalf. Claude must NEVER be reachable from a public/client route —
it is only ever called from server-side Inngest jobs over a bounded work-set.

**Backstop (account-level, owner-owned, not code):** a monthly spend limit is set on
the Anthropic workspace, and a dedicated, independently-revocable API key is used for
this project. This is the ceiling that holds regardless of app behavior.

**Phase 1 — cost guardrails in the pipeline:**
- Inngest concurrency + throttle/rate-limit on the qualify and draft functions so a
  bug can't fan out into thousands of model calls.
- Per-run and per-day lead caps on ingestion.
- Dedupe by `source_ref` (and idempotency) so the same lead is never re-processed and
  re-charged.
- Keep the Anthropic SDK's bounded `maxRetries`; never retry on non-retryable errors.

**Phase 2–3 — security of the deployed surface:**
- Auth.js + `allowed_emails` gate on the dashboard and every server action — no public access.
- Verify Inngest signatures (`INNGEST_SIGNING_KEY`) on `/api/inngest` so only Inngest
  can invoke jobs.
- `ANTHROPIC_API_KEY` (and all secrets) stay server-only — in the `server` block of
  `env.ts`, encrypted Vercel env, never shipped to the browser, never committed.
- Rate-limit auth/login and any public route (Vercel/Upstash) against abuse.

## Tech stack (locked)

TypeScript end to end · Next.js App Router (monolith) · Tailwind CSS + shadcn/ui ·
lucide-react icons · Postgres on Neon · Drizzle + drizzle-kit · Inngest (durable
jobs) · `@anthropic-ai/sdk` (Haiku 4.5 `claude-haiku-4-5-20251001` for qualify,
Sonnet 4.6 `claude-sonnet-4-6` for draft, Batch API for bulk) · Zod for validation ·
`@t3-oss/env-nextjs` for env · Auth.js (NextAuth) Google provider · cheerio for
HTML parsing (Playwright only if a site is too JS-heavy) · pino logging · Vitest.

- No Python. No microservices. No `Result`/`neverthrow`.
- No Edge runtime for any code touching the Anthropic SDK, googleapis, pino, or the
  Postgres driver — pin those routes/handlers to `export const runtime = "nodejs"`.

## Pipeline

`ingest → audit → qualify → draft → review (dashboard) → (human) send via Gmail`

The first four stages are Inngest functions. Review and send are the dashboard plus
a Gmail `drafts.create` call. The human is always the final send action.

---

## Coding conventions

**Imports** — grouped with labeled comments, a blank line between groups, in this
exact order. Keep the `// Next.js` label verbatim even though it covers React imports.

```ts
"use client"; // only when the component needs client interactivity

// Next.js
import { useState } from "react";
import Link from "next/link";

// CSS
// (module CSS imports — rare here since we use Tailwind, but the slot stays)

// HTML Components
import { Table, TableBody, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PanelRightOpen } from "lucide-react";

// Components
import { StatusBadge } from "./StatusBadge";

// Libs
import { LEAD_STATUS_META } from "@/constants/leads";
import { formatRelativeDate } from "@/lib/formatters";

// Hooks
import { useLeadsTable } from "@/hooks/useLeadsTable";

// Types
import type { Lead } from "@/types/leads";
```

**Naming**
- Components: PascalCase, named for what they render (`LeadsTable`, `LeadDetail`, `StatusBadge`).
- Functions: descriptive camelCase verbs (`qualifyLead`, `runSiteAudit`, `generateOutreachDraft`).
- Hooks: `use<Feature>` (`useLeadsTable`, `useLeadsFilters`, `useLeadDraft`).
- Constants: UPPER_SNAKE_CASE in `@/constants`.
- Types: PascalCase, imported with `import type`.

**File ordering** — the exported parent component or function is at the top of the
file; helper functions and sub-components go below it, so the file reads top to bottom.

**Component philosophy** — components stay presentational and let the JSX structure
carry the readability. The moment a component accumulates multiple `useState`s and
handlers, lift that logic into a colocated `use<Feature>` hook.

**shadcn-first** — always reach for a shadcn primitive (`Button`, `Input`, `Card`,
`Table`, `Label`, `Select`, `Textarea`, `Popover`, `Sheet`, `Sidebar`, …) before
hand-rolling UI.

**Reuse & comments** — no duplicate components or functions; prefer an existing
reusable piece. Comments only on genuinely complex logic, never narrating the obvious.

**Project structure** — layered: top-level `components/` (with `components/ui/` for
shadcn), `lib/`, `constants/`, `hooks/`, `types/`, `db/`. Feature components may be
colocated. shadcn files keep their generated kebab-case names in `components/ui/`;
our own component files are PascalCase.

---

## Data & error conventions

- **Database**: snake_case columns, plural tables, uuid pks via `gen_random_uuid()`,
  `timestamptz` `created_at`/`updated_at` on every table, no soft deletes (lifecycle
  via status enum), Postgres enums via Drizzle `pgEnum`. Schema in `db/schema/`,
  client in `db/index.ts`. Migrations via `drizzle-kit generate` → review the SQL →
  commit; `push` only for throwaway local work.
- **Errors**: throw inside Inngest steps and let Inngest retry. Model expected
  outcomes (no website, disqualified) as data on the row, not as errors. Wrap each
  integration in a typed client that throws named errors (e.g. `GmailAuthError`,
  `PlacesQuotaError`). Zod-validate every external and LLM boundary. When a failure
  stops a lead, write a human-readable `failure_reason` to the row and set
  `status = 'failed'`. Nothing swallowed silently.
- **Do not** introduce a `Result`/`neverthrow` pattern — it fights the clean,
  structure-led style.
- **Logging**: pino, structured. Add Sentry (`@sentry/nextjs`) for error monitoring/alerting in Phase 3/4 when the app is deployed — it complements pino (logs) rather than replacing it; wrap the Inngest functions and pipe pino error-level logs into Sentry.
- **Testing**: Vitest. Unit-test the deterministic logic (audit checks/scoring, Zod
  schemas, prompt assembly, qualification rules) with the Claude and Google calls
  mocked from fixtures. No UI or e2e tests at MVP.

## Color / branding

Brand tokens live in `app/globals.css` as CSS variables. Mostly-white dashboard with
royal-blue (`--color-primary`, `#2F66E8`) buttons and accents. Use the tokens, never
hardcode hex in components.
