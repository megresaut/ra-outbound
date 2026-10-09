# Fixed Demos — Build & Deploy Plan

Scope: build two stand-alone Next.js demos and deploy each once to a stable
production URL. No changes to the pipeline, orchestrator, intake, email-draft,
review UI, schema, or existing per-prospect demo generation.

## Directory locations

- `demos_fixed/utility_billing/` — Utility / Owner-Billing demo
- `demos_fixed/maintenance_ops/` — Maintenance / Concierge Operations demo

Rationale for `demos_fixed/`:

- `demos/` is the per-prospect output directory the existing pipeline writes
  into (see `outreach_hub/lib/pipeline/demo.ts:9` — `DEMOS_DIR = path.join(REPO_ROOT, "demos")`).
  Adding fixed demos in there would mix permanent demos with per-prospect ones
  and risk the existing pipeline misreading the tree.
- `demo_templates/` is for the bespoke templates the pipeline copies and
  personalizes per prospect — these new demos are not templates, they are
  finished products deployed once.
- A new sibling `demos_fixed/` cleanly separates "fixed, deployed-once demos"
  from both above, and matches the spirit of how the repo organizes deployable
  artifacts.

## Framework / version

Matches `demo_templates/property_management/` exactly:

- Next.js `^16.2.4` (App Router)
- React `^18.3.1`
- TypeScript `^5.4.5`
- Tailwind CSS `^3.4.3` + `tailwindcss-animate`
- `lucide-react`, `clsx`, `tailwind-merge`, `class-variance-authority`
- Fonts: Fraunces (display), Inter Tight (sans), JetBrains Mono (mono) via
  `next/font/google`
- Same `tailwind.config.ts` color tokens (bg/border/text/accent/status) and
  same `globals.css` aesthetic (light operational software, grain overlay,
  refined scrollbar, status-dot pulse)

## Customization level — LIGHTLY BRANDED

Each demo reads optional URL parameters and renders them in the top
navigation:

- `?company=<name>` — shown in the brand mark and document title (client-side)
- `?logo=<url>` — shown as the brand mark image

Fallbacks when absent:

- `company` defaults to a neutral placeholder firm name (e.g. "Pinecrest
  Estate Group") — chosen so the demo looks finished even without params.
- `logo` defaults to a monogram derived from the company name (same
  fallback the existing template uses in `top-nav.tsx`).

No per-prospect data layer, no database, no config injection beyond the two
URL params. All residence, statement, work-order, and vendor data is fixed
fictional content baked into the build.

## Exact Vercel deploy command

Reused byte-identical from existing code. Quoting both call sites:

`outreach_hub/lib/pipeline/demo.ts:303-307`

```ts
const child = spawn(
  "npx",
  ["--yes", "vercel", "--prod", "--yes", "--name", projectName],
  { cwd, env: { ...process.env } },
);
```

`outreach_hub/app/api/demo/[slug]/deploy/route.ts:16-20`

```ts
const child = spawn(
  "npx",
  ["--yes", "vercel", "--prod", "--yes", "--name", projectName],
  { cwd, env: { ...process.env } },
);
```

Shell equivalent run from each demo's directory:

```
npx --yes vercel --prod --yes --name <projectName>
```

Project names (stable, human-readable, permanent — pipeline will reference
these URLs in a future task):

- `ra-demo-utility-billing`
- `ra-demo-maintenance-ops`

Auth assumption: the host's Vercel CLI is already authenticated (no tokens
or SDKs added). If the deploy fails for auth reasons, the failure is
reported and the built apps are left in place for manual retry — no
workarounds, no changes to the deploy code.

## Screens

### Utility / Owner-Billing demo

1. `/` (Dashboard) — current month's owner billing snapshot across the
   portfolio (totals due, statements sent, exceptions flagged) with a brief
   activity feed.
2. `/statements/[id]` (single Owner Statement) — one month's cost
   pass-through for one residence with line items, management fee, total
   due from owner. Realistic line items: utilities (PG&E, ConEd, etc.),
   landscape, pool service, security, household staff payroll
   reimbursement, repairs, management fee.
3. `/residences` — list of 5–6 fictional luxury residences with owner,
   square footage, and last statement status.
4. `/reconciliation` — visual: "this used to be a spreadsheet, now it's
   automatic." Side-by-side: messy spreadsheet snapshot vs. clean
   automated reconciliation with provider sources, match confidence, and
   exception queue.

### Maintenance / Concierge Operations demo

1. `/` (Work-orders board) — kanban: New / Scheduled / In progress / Done,
   cards spanning multiple residences with trade, vendor, priority.
2. `/vendors` — vendor list with trade, status (active / standby /
   review), last visit, satisfaction.
3. `/residences/[id]` — per-property maintenance timeline with completed
   and upcoming work, recurring service schedule, and notes.

## Gates (self-verify)

- Both apps run `next build` locally with zero errors.
- Both render every screen without runtime errors.
- The Vercel command spawned for each deploy is byte-identical to the
  invocation above (will be quoted in the final report).
- No file outside `demos_fixed/utility_billing/`,
  `demos_fixed/maintenance_ops/`, and `PLAN.md` is created or modified.
- `.env.local` untouched.

## Out of scope (explicitly not done in this task)

- No pipeline wiring. The two URLs will be referenced from
  `chooseDemoTemplate` / email-draft in a separate, scoped future task.
- No per-prospect data layer / config injection / DB seeding.
- No changes to existing demo templates or per-prospect demos.
