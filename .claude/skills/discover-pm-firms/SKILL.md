---
name: discover-pm-firms
description: Use this skill to discover candidate property management firms for RA cold outbound across one or more US metros. Triggers on "discover PM firms in [metro]", "run a discovery batch", "find property managers in [city]", or any request to source new prospect firms. Searches the web, classifies each firm against the ICP rubric, and writes a staging JSON file the discovery CLI ingests. Does NOT touch ra.db, does NOT send email, does NOT call Anymailfinder.
---

# Discover PM Firms — Discovery Skill

## Purpose

This skill is the LLM-powered front half of the RA discovery pipeline. You
(Claude, running in Claude Code) do the web research and ICP classification
here — on the user's Claude Code plan, not on Anthropic API credits. You then
write a **staging JSON file**. A separate Node CLI
(`outreach_hub/discovery/cli.ts --from-staged <path>`) ingests that file,
verifies emails via Anymailfinder, and inserts prospects.

You do the discovery + classification. The CLI does enrichment + insert.
Keep that boundary — never insert into a database, never call an email API
from this skill.

## Inputs (from the skill argument)

The argument is free text naming one or more US metros, optionally a target
count. Examples:

- `Portland, OR` → one metro, default target
- `Portland, OR; Seattle, WA; Sacramento, CA` → three metros
- `Denver, CO target 12` → one metro, target 12 firms

Parse it loosely. If no metros are given, ask the user which metros to cover
before doing anything. **Default target = 20 firms total** across the named
metros (split roughly evenly) when no count is specified.

## Workflow

### 1. Read the rubric — verbatim

Read `outreach_hub/discovery/icp-rubric.md`. This is the source of truth for
classification. Do not relax any threshold in it. If the file still contains
its `REVIEW BANNER — UNSIGNED HUMAN-OWNED INPUT` block, proceed but tell the
user at the end that the rubric is unsigned and the batch should be treated
as scaffolded.

### 2. Search the web for each metro

For each metro, use WebSearch (and WebFetch on promising hits) to find small
and mid-sized US property management firms that **operate residences** —
lease, maintain, bill, and coordinate vendors on behalf of owners. Good
queries:

- `property management companies in <metro>`
- `residential property managers <metro>`
- `<metro> property management firm careers` (job posts reveal ops pain)
- local business directories / NARPM listings for the metro

For each promising firm, gather:

- **company** — legal/brand name
- **website** — domain only, no `https://`, no trailing slash
- **location** — `City, ST` (use the metro)
- **champion** — if a Director of Operations / COO / Operations Manager /
  Head of Operations / Office Manager is visible on the site or LinkedIn,
  capture `fullName` and `title`. Include `linkedinUrl` only if a real one
  is visible; otherwise `null`. If no champion is identifiable, set
  `champion` to `null` — the CLI will reject name-less firms (never enrich
  on domain alone).

Skip brokerages, real-estate investment funds, VC-backed proptech, and
out-of-US firms. Skip any firm whose only evidence is a single Apollo or
Crunchbase snippet — needs a real site or directory hit.

### 3. Classify each firm against the rubric

For every firm, produce a classification object exactly as the rubric's
"Output schema" section specifies:

- `is_icp` (boolean)
- `operating_model` — one of `operates-residences`, `invests-in-RE`,
  `brokerage`, `concierge-only`, `unclear`
- `firm_size_estimate` (integer headcount)
- `confidence` (0–1)
- `reasoning` (one sentence citing the actual signals you used)
- `domain` (string)

Be honest. The CLI re-applies the pass gate (`confidence >= 0.8` AND
`operating_model == "operates-residences"`); firms that fail are written to a
rejected store, not the pipeline. Include borderline and failing firms in the
staging file too — the CLI needs to see them to record the rejection.

### 4. Write the staging file

Write a JSON file to:

```
outreach_hub/discovery/staged/staged-<YYYY-MM-DD>-<HHMM>.json
```

(Create the `outreach_hub/discovery/staged/` directory if it does not exist.)

**Exact schema** — the CLI parses this, so match it precisely:

```json
{
  "generated_at": "2026-05-20T14:30:00.000Z",
  "metros": ["Portland, OR", "Seattle, WA"],
  "rubric_path": "outreach_hub/discovery/icp-rubric.md",
  "rubric_unsigned": true,
  "candidates": [
    {
      "company": "Cascade Residential Management",
      "website": "cascaderesidential.com",
      "location": "Portland, OR",
      "champion": {
        "fullName": "Jane Okafor",
        "title": "Director of Operations",
        "linkedinUrl": null
      },
      "classification": {
        "is_icp": true,
        "operating_model": "operates-residences",
        "firm_size_estimate": 34,
        "confidence": 0.88,
        "reasoning": "Site states 'managing 600+ residential units'; LinkedIn band 11-50; bootstrapped, family-owned since 2004.",
        "domain": "cascaderesidential.com"
      }
    }
  ]
}
```

Notes:
- `champion` may be `null` for a firm where no champion was identifiable.
- `linkedinUrl` may be `null`.
- Include every firm you researched — passing and failing — so the rejected
  store stays complete.

### 5. Report back

After writing the file, tell the user:

- the staging file path
- how many candidates total, how many pass the rubric gate
  (`confidence >= 0.8` AND `operating_model == "operates-residences"`)
- whether the rubric was unsigned
- the exact next command:

  ```
  cd outreach_hub && node_modules/.bin/tsx discovery/cli.ts --from-staged <path>
  ```

  (add `--dry-run` to that command to preview enrichment + inserts without
  writing to ra.db or spending Anymailfinder credits.)

## Hard rules

- Never invent firms or domains. Every candidate must come from a real web
  result you actually saw.
- Never write to `ra.db` or any database. This skill only writes the staging
  JSON.
- Never call Anymailfinder or any email API. Enrichment is the CLI's job.
- Never send email.
- Do not modify `icp-rubric.md` — it is human-owned input.
