# OpenClaw Outbound Pipeline

> Cold outbound system for Reasonable Automations. Apollo CSV in → personalized demo + drafted email out → review queue Megha reads each morning.

## Architecture

```
┌── INPUTS (Megha) ─────────────────────────────────────────────┐
│   icp.md                  who counts as a prospect            │
│   pain_library.md         what workflows we can solve         │
│   inbox/*.csv             daily Apollo exports                │
│   demo_templates/         the demo platforms (PM, dispatch)   │
└───────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌── PIPELINE (Claude Code, headless on EC2) ────────────────────┐
│                                                               │
│   Agent 1: Researcher   → prospects/{slug}/research.json      │
│   Agent 2: Pain Mapper  → prospects/{slug}/pain.json          │
│   Agent 3: Demo Builder → prospects/{slug}/demo_url.txt       │
│   Agent 4: Email Drafter→ review_queue/YYYY-MM-DD.md          │
│                                                               │
└───────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌── OUTPUTS (Megha reads) ──────────────────────────────────────┐
│   review_queue/YYYY-MM-DD.md   morning read                   │
│   prospects/{slug}/             full audit trail per prospect │
└───────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌── INTERFACE (OpenClaw on EC2) ────────────────────────────────┐
│   Telegram → "run today's batch" → triggers pipeline          │
│   Telegram ← "Done. 7 in queue." ← reports back              │
└───────────────────────────────────────────────────────────────┘
```

## Directory layout

The pipeline assumes everything lives under `~/openclaw/` on your EC2:

```
~/openclaw/
├── icp.md                      # ICP source of truth (you maintain)
├── pain_library.md             # pattern source of truth (you maintain)
├── pipeline/                   # the agent prompts + orchestrator
│   ├── agents/
│   │   ├── 01_researcher.md
│   │   ├── 02_pain_mapper.md
│   │   ├── 03_demo_builder.md
│   │   └── 04_email_drafter.md
│   ├── run_batch.sh            # the orchestrator
│   └── lib/
│       ├── slug.sh             # company name → slug
│       └── csv_parse.sh        # apollo CSV → per-row JSON
├── demo_templates/             # already exists (PM, service_dispatch)
├── inbox/                      # drop apollo CSVs here
│   └── apollo-2026-04-28.csv
├── prospects/                  # one folder per prospect, full audit trail
│   └── acme-hvac-services/
│       ├── apollo_row.json     # original CSV row
│       ├── research.json       # Agent 1 output
│       ├── pain.json           # Agent 2 output
│       ├── demo_url.txt        # Agent 3 output
│       └── email.md            # Agent 4 output
└── review_queue/
    └── 2026-04-28.md           # consolidated daily output
```

## Slug convention

Every prospect gets a stable slug derived from company name:

- Lowercase
- Spaces → hyphens
- Strip non-alphanumeric except hyphens
- Strip suffixes: "inc", "llc", "corp", "co", "the"
- "Acme HVAC Services, Inc." → `acme-hvac-services`

Slugs are the primary key. Every artifact for a prospect lives at `prospects/{slug}/`.

## Idempotency

Every agent is idempotent: re-running the pipeline on the same prospect produces the same outputs (modulo timestamps and any newly-published web content). This means:

- A failed run can be re-run by simply re-invoking the orchestrator
- A bad email can be regenerated without re-doing research or rebuilding the demo
- You can re-run just one stage by deleting that artifact (e.g., `rm prospects/acme/email.md && bash pipeline/run_batch.sh --only-email acme`)

## What lives where (mental model)

- **icp.md** — knowledge about *who*. Agent 1 reads this.
- **pain_library.md** — knowledge about *what we can solve*. Agent 2 reads this.
- **demo_templates/** — knowledge about *how we show our work*. Agent 3 reads this.
- **prospects/** — per-prospect state. Built up across agent runs.
- **review_queue/** — your morning input. Drafts, never auto-sent.

The agent prompts live in `pipeline/agents/` and are markdown files that get fed to Claude Code in headless mode (`claude -p < agents/01_researcher.md`).

## Hard rules (encoded in every agent)

1. **Never fabricate.** If a fact isn't grounded in research or the pain library, don't include it.
2. **Never auto-send.** Every email lands in the review queue, never in an inbox.
3. **Never modify icp.md, pain_library.md, or demo_templates/.** Only Megha edits these.
4. **Skip cleanly.** If a prospect doesn't match ICP or doesn't have a clear pain match, write a `skip_reason` to the review queue and move on. Don't try harder.

## Daily volume

Initial cap: 5–10 prospects/day. The pipeline can handle more, but volume should grow only after Megha has reviewed enough output to trust quality.

## OpenClaw integration

OpenClaw is the chat frontend, not the runner. It listens on Telegram (or whatever channel) and calls `pipeline/run_batch.sh` when triggered. See `pipeline/openclaw/` (built last) for the gateway hook configuration.
