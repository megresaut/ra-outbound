# ICP Classification Rubric — Discovery Agent

> ⚠️ **REVIEW BANNER — UNSIGNED HUMAN-OWNED INPUT** ⚠️
>
> This file was scaffolded by the automation because the discovery phase
> required a rubric but none existed yet. The agent will read this file
> verbatim before every classification call and treat it as the source of
> truth.
>
> **Megha must review, edit, and remove this banner before discovery output
> is trusted.** Until this banner is removed, downstream prospects produced
> by the discovery CLI should be treated as scaffolded / not human-signed.

---

## Purpose

Used by the discovery agent to decide whether a candidate property
management firm should be inserted into the outbound pipeline. Strict JSON
classification: `is_icp`, `operating_model`, `firm_size_estimate`,
`confidence`, `reasoning`.

Pass gate (combined, both required):

- `confidence >= 0.8`, AND
- `operating_model == "operates-residences"`

`unclear` never passes. Non-passes are written to the rejected store
with reason.

---

## 1. Vertical — property management of residences

A candidate passes the vertical test only if the firm's primary business
is **operating residences** that other people own or live in: leasing,
maintaining, billing, vendor coordination, and concierge work on a
recurring basis for a portfolio of homes or units.

Use `operating_model` to capture which kind of company this is:

| value | meaning |
|---|---|
| `operates-residences` | Manages homes/units other people own or rent. PM firms, multifamily managers, HOA managers, estate/concierge ops. **Only this passes.** |
| `invests-in-RE` | Real-estate fund, holding company, or developer that owns assets but does not run day-to-day ops. Does not pass. |
| `brokerage` | Real estate sales / leasing only. Does not pass. |
| `concierge-only` | Lifestyle/concierge with no recurring residence-ops bookings. Does not pass. |
| `unclear` | Insufficient evidence to classify. **Never passes.** |

## 2. Firmographics

- **Headcount:** 15–75 (sweet spot). Acceptable widening: 10–150.
  Outside that range → drop confidence to < 0.8.
- **Geography:** United States only. Anything outside the US fails.
- **Ownership:** Bootstrapped, family-owned, or PE-owned without operating
  control. **VC-backed disqualifies** (they will build it themselves).
- **Tech profile:** Mix of vertical SaaS (Buildium, AppFolio, ResMan,
  Yardi, etc.), Excel, shared inboxes, PDFs. 0–1 internal developers.
  Heavily engineered / multi-developer shops drop confidence.

## 3. Evidence weight

`confidence` reflects the strength of the evidence used to fill the other
fields. Anchor it on observable signals:

- **0.90–1.00** — Verified headcount from LinkedIn band + named operating
  model on the firm's own site + at least one explicit residence-ops signal
  (utility billing role, statement assembly, vendor coordination, on-call
  rotation, etc.).
- **0.80–0.89** — Two of the three above. Anything weaker pulls below 0.80.
- **< 0.80** — Inferred / single-source / ambiguous. Does not pass.

## 4. Champion identification (when present)

If a plausible champion is identifiable from the firm's site or LinkedIn —
Director of Operations, COO, Operations Manager, Head of Operations,
Office Manager — capture **full name** plus title. The discovery CLI will
only proceed to email enrichment when a scraped name is present alongside
a domain. **Never enrich on domain alone.**

## 5. Hard disqualifiers

- VC-backed at any stage.
- Headcount outside 10–150.
- Non-US operating geography.
- Operating model not `operates-residences`.
- No identifiable champion name AND no operations-leadership title visible.
- Evidence drawn from a single weak source (e.g., a single Apollo or
  Crunchbase snippet) with no corroboration.

---

## Output schema (strict JSON)

```json
{
  "is_icp": true,
  "operating_model": "operates-residences",
  "firm_size_estimate": 42,
  "confidence": 0.88,
  "reasoning": "One sentence citing the signals that drove the score.",
  "champion": {
    "fullName": "string or null",
    "title": "string or null",
    "linkedinUrl": "string or null"
  },
  "domain": "example.com"
}
```

`reasoning` should reference the actual signals used — not be generic.
