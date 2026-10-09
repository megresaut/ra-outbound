# Restructure plan — Discovery CLI + Bypass research/pain + Fixed demos

Companion to `PLAN.md` (the demo-build plan, already executed). This plan
covers the three phases of the structural restructure.

---

## Pre-work outcomes

**Env integrity check (substitute):** The repo is not a git repository
(`git status` → "not a git repository"). The git-based env-leak guard
cannot be evaluated. Substitute: I will not read, open, edit, or print
the contents of `outreach_hub/.env` or `outreach_hub/.env.local`. The
user has explicitly authorized appending one line to `.env.local`
(`ANYMAILFINDER_API_KEY=...`); that append used `printf >>` and did not
read the existing contents.

**Preservation list — SHA256 hashes captured at pre-work:**

- `outreach_hub/app/campaigns/[id]/CampaignView.tsx` →
  `cb44cfdd49e3fc330c8b9fa4d8997c3b0932948ef70aa1f68268e1d255a85e0c`
- `outreach_hub/app/api/campaigns/[id]/send/route.ts` →
  `ce5ec6e67392bcab41006b4a530e8f0513560c31f903a7b74ff67067435df05e`
- `outreach_hub/lib/gmail.ts` →
  `c89e20ac4d1e9149c61016df76409f6d27a30ba49ff9709d2d04d560eae86af8`
- `outreach_hub/db/schema.ts` →
  `4732fde430ef0aa056df99b09b87260e203f0da2a19c80d5da9fbc36008e408a`

Re-hashed at the end of every phase. Phase passes only if hashes still
match.

**Human-owned inputs (originally specified as "if absent, stop"):**

- `outreach_hub/discovery/icp-rubric.md` — absent. User instructed
  "make whatever decisions you need and finish." Created a scaffold with
  a prominent **REVIEW BANNER — UNSIGNED HUMAN-OWNED INPUT**. The
  discovery CLI uses it as-is; the banner remains intact. **Flag in final
  report.**
- `outreach_hub/config/products.md` — absent. Same scaffolding pattern,
  same banner. Email-draft uses it as-is; the banner remains intact.
  **Final report's first line will be the EMAILS NOT SEND-READY flag.**

**Fixed-demo permanent URLs (treated as constants this task):**

- `utility-billing` → `https://ra-demo-utility-billing.vercel.app`
- `maintenance-management` → `https://ra-demo-maintenance-ops.vercel.app`
- Branding via `?company=<name>&logo=<url>` query params (URL-encoded).
- Default company name fallback: `Pinecrest Estate Group`.

---

## Files I will touch

### Phase 1 (additive — new files only, except the env append already done)

- `outreach_hub/discovery/icp-rubric.md` *(scaffolded, banner intact)*
- `outreach_hub/config/products.md` *(scaffolded, banner intact)*
- `outreach_hub/discovery/types.ts` *(new — shared types)*
- `outreach_hub/discovery/icp-classifier.ts` *(new — Claude+rubric classifier)*
- `outreach_hub/discovery/enrichment.ts` *(new — Anymailfinder provider + interface)*
- `outreach_hub/discovery/sources/web-search.ts` *(new — real DiscoverySource)*
- `outreach_hub/discovery/sources/directory.ts` *(new — stub w/ TODO)*
- `outreach_hub/discovery/rejected-store.ts` *(new — SQLite at `discovery/rejected.db`)*
- `outreach_hub/discovery/cli.ts` *(new — entrypoint, flags `--limit`, `--dry-run`)*

### Phase 2 (minimal edits to existing files)

- `outreach_hub/lib/pipeline/orchestrator.ts` — skip research-deep call,
  skip fitScore + buildable-pain gates, advance `research_pending`
  directly to `demo_building`. Preserve every pipeline_status string and
  current_stage write.
- `outreach_hub/lib/pipeline/email-draft.ts` — make signals/pains
  empty-tolerant; drive workflow selection from `template` (not
  libraryPatternId); load `outreach_hub/config/products.md` (read-only)
  and prepend its `cold_open_angle` to the Claude system prompt.

Optional absence-tolerance touch-ups (only if grep shows runtime calls):

- *(none expected — `lib/repositories/prospects.ts` already returns
  `pains: []` and `research: undefined` when rows are missing, and
  `ProspectView.tsx` already guards `{p.research && ...}` and renders
  `p.pains.map(...)` over an empty array.)*

### Phase 3 (minimal edits)

- `outreach_hub/lib/pipeline/demo.ts` — add `chooseDemoTemplate(prospect)`
  and replace `buildAndDeployDemo` body with a deterministic selector that
  writes the fixed URL with URL-encoded `?company=` and optional `?logo=`.
  Keep the existing per-prospect Claude/copy code in the file but unused
  for the new flow (will be dead code that compiles). **No `npx vercel`
  call in the new path.**
- `outreach_hub/app/api/demo/[slug]/deploy/route.ts` — **untouched**.
  May become unused for the new flow; that is intentional per task spec.

---

## Preservation list — WILL NOT TOUCH

- `outreach_hub/app/campaigns/[id]/CampaignView.tsx` (status pills,
  EmailEditor, checkbox selection, "Send selected")
- `outreach_hub/app/api/campaigns/[id]/send/route.ts` (POST send endpoint)
- `outreach_hub/lib/gmail.ts` (Gmail OAuth + send)
- `outreach_hub/db/schema.ts` (DB schema)
- `outreach_hub/app/prospects/[slug]/page.tsx` and `ProspectView.tsx`
  (prospect detail page)
- `outreach_hub/app/prospects/[slug]/DemoControlPanel.tsx` and `actions.ts`
- `outreach_hub/app/campaigns/page.tsx` (campaign list)
- `outreach_hub/app/api/campaigns/[id]/status/route.ts` and
  `outreach_hub/app/api/campaigns/[id]/retry/route.ts`
- `outreach_hub/lib/repositories/prospects.ts` (already absence-tolerant)
- `outreach_hub/lib/repositories/campaigns.ts` (already absence-tolerant)
- `outreach_hub/lib/repositories/events.ts`
- `outreach_hub/db/seed.ts`
- `outreach_hub/lib/pipeline/research.ts`, `research-deep.ts`,
  `pain-map.ts` — **invocation removed in Phase 2**, files themselves
  left in place per task spec.
- `outreach_hub/lib/pipeline/email-template.ts` — body template not
  touched (Phase 2 only changes draft logic, not the rendered template).
- `outreach_hub/lib/pipeline/intake.ts` — Phase 1 will *reuse* `slugify`,
  `uniqueSlug`, `deriveWebsite`, `classifyIndustry` by import; will not
  reimplement, will not modify.
- `outreach_hub/app/api/campaigns/intake/route.ts` — *referenced* for
  shape parity (Phase 1 builds the same `prospects` insert shape and
  also calls `createCampaign` + `runPipelineForCampaign`) but the route
  file itself is **not modified**.
- `outreach_hub/app/api/demo/[slug]/deploy/route.ts` — untouched.

---

## Pipeline status — preservation

Before any edit (current set, from grep across orchestrator + UI):

`research_pending`, `researching`, `research_failed`, `pain_mapping`,
`pain_failed`, `demo_building`, `demo_failed`, `deploying`,
`email_drafting`, `email_failed`, `ready_to_send`, `sending`,
`send_failed`, `sent`, `novel_pain_review`, `low_fit_review`.

Target after Phase 2:

- Same set, byte-identical strings, all string literals preserved in the
  UI (`STATUS_LABEL`, `ACTIVE_STATES`, `FAILED_STATES`, `REVIEW_STATES`).
- Only difference: orchestrator stops *writing* `researching`,
  `research_failed`, `pain_mapping`, `pain_failed`, `novel_pain_review`,
  `low_fit_review` during a normal run (research/pain stages never run,
  fit/buildable gates removed). The strings still exist in the codebase
  for retry-from-failed cases and for UI rendering of historical rows.

---

## Out of scope (not doing this task)

- No deploy. No `npx vercel`. No edits to existing deploy code.
- No schema migrations.
- No fix to draft-versioning or stuck-row bugs.
- No architecture cleanup beyond what each phase requires.
- No edits to the review UI, send endpoint, Gmail integration, or schema.
- No edits to the existing per-prospect demos in `demos/` or the templates
  in `demo_templates/`.
