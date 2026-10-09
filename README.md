# ra-outbound

The cold-outbound system for **Reasonable Automations (RA)**. RA builds custom
software automations for small businesses with heavy operations work. The system
finds those businesses, builds each prospect a working demo of the automation RA
would build for them, and drafts a short personal email that links to it. A human
reads every email and sends it; nothing is sent automatically.

## The idea

Most cold emails describe a product. This one shows it. Before RA emails a
prospect, it gives them a live demo of their own operations workflow running
automatically, with their company name, units and trucks, and their kind of
work. The email's job is to get one click.

The pitch starts with something RA has already built: **utility-billing
automation for property managers**. For one 20-person, 800-unit PM firm, RA's
scrapers pull statements from utility portals, parse them and import them into
the firm's PM software. That took manual billing work from about 200 hours a
month to roughly zero. The outbound system looks for more firms with that same
kind of manual, high-volume problem.

## Who it targets

`icp.md` defines the ideal customer profile and is the source of truth:

- **Companies:** US small businesses with roughly 15–75 employees, not
  VC-backed, with heavy operations work. Property management first, then field
  service (HVAC, plumbing, electrical).
- **Who gets the email:** the operations lead (COO, Director of Ops, Office
  Manager). They feel the manual-work pain day to day and can sell the fix
  internally. The owner or CEO signs the deal but isn't emailed cold.

## How it works

```
 discover ──► enrich ──► demo ──► draft ──► review ──► send
 (find firms)  (get email)  (live app)  (email)   (human)   (Gmail)
```

1. **Discovery.** Web search across chosen US metros finds candidate firms. A
   classifier checks each one against the ICP rubric
   (`outreach_hub/discovery/icp-rubric.md`). Firms below the confidence bar, or
   with the wrong operating model, go into a rejected store so they aren't
   picked up again.
2. **Enrichment.** Anymailfinder looks up the ops lead's email. Hard guards
   (name and domain required, a per-run credit counter) keep spending under
   control.
3. **Demo.** The prospect gets a demo URL. It is either a fixed deployed demo
   that matches their workflow or a copy of a template personalized for them and
   deployed to Vercel.
4. **Email draft.** Claude writes a short email from the prospect's details and
   RA's product notes (`outreach_hub/config/products.md`), linking to the demo.
5. **Review & send.** In the Outreach Hub UI, drafts are grouped into
   campaigns. A person reads and edits them, then sends through the Gmail API.

Every prospect moves through a tracked pipeline status (`demo_building` →
`email_drafting` → `ready_to_send`, or a `*_failed` state), and every step is logged as
an event.

## What's in the repo

| Path | What it is |
|---|---|
| `icp.md` | The ideal customer profile: what RA sells, the starting pitch, who to email, and disqualifiers. |
| `outreach_hub/` | **The main app.** Next.js 14 + SQLite (Drizzle). Prospect intake, the pipeline orchestrator, campaign review and Gmail sending. |
| `outreach_hub/lib/pipeline/` | Pipeline stages: intake, research, pain mapping, demo build/deploy, email draft, and the orchestrator that runs them (2 prospects at a time). |
| `outreach_hub/discovery/` | A standalone discovery CLI: web-search source, ICP classifier, Anymailfinder enrichment and the rejected-firm store. |
| `demo_templates/property_management/` | A demo platform for PM firms. Its main workflow is utility statements pulled from provider portals and imported into the PM system. |
| `demo_templates/service_dispatch/` | A dispatch demo with HVAC, plumbing and electrical variants. Requests from voicemail, web forms and email are triaged by urgency and matched to technicians. |
| `demos_fixed/` | Two finished demos, each deployed once to a fixed URL: **utility billing** and **maintenance / concierge ops**. |
| `openclaw_pipeline/` | The original design: a 4-agent headless Claude Code pipeline on EC2 (Researcher → Pain Mapper → Demo Builder → Email Drafter), triggered from Telegram through OpenClaw. Also holds `pain_library.md`, the workflows RA can solve. |
| `.claude/skills/` | Claude Code skills: `discover-pm-firms` (sources firms by metro into a staging file) and `ra-prospect-research` (writes a detailed research brief on one firm). |
| `PLAN.md`, `PLAN-RESTRUCTURE.md` | Design notes for the fixed demos, and for the restructure that added the discovery CLI and skipped the research and pain-mapping stages. |

### Demos

Demos are built to be personalized through config alone. Each template has a
single `config/demo.config.ts` that controls the company name, vertical,
terminology, numbers and sample data. Nothing else changes per prospect, so a
new demo is a config edit plus a deploy. They are deliberately polished
operations apps, not slideshows. When the viewer clicks **Run**, they watch
their own morning's work happen automatically.

### Current state

The live flow is **discovery → enrichment → demo → draft → review**. The deeper
research and pain-mapping stages still exist in `lib/pipeline/`, but the
orchestrator skips them for now and uses the fixed demos instead of deploying
one per prospect. The original `openclaw_pipeline/` design is kept for
reference.

### Principles

- **Never auto-send.** Every email goes to a person for review.
- **Never make things up.** Claims have to come from research or from RA's real
  product notes.
- **Skip cleanly.** A prospect that doesn't fit is rejected with a reason, not
  forced through.
- **Grow volume only as trust grows.** Start at 5–10 prospects a day.

## Setup

Requires Node 20+.

```bash
cd outreach_hub
npm install
cp .env.example .env.local      # fill in Anthropic, Anymailfinder, Google OAuth keys
npx tsx scripts/gmail-oauth-setup.ts   # one-time: get GOOGLE_REFRESH_TOKEN
mkdir -p data && npm run db:push       # create the SQLite DB
npm run dev                            # http://localhost:3100

# Discovery CLI (use --dry-run first: no DB writes, mock enrichment)
npx tsx discovery/cli.ts --dry-run --limit 10 --metros "Portland, OR"
```

To run a demo template on its own: `cd demo_templates/<name> && npm install && npm run dev`.
