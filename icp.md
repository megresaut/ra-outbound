# Reasonable Automations — Ideal Customer Profile

> Source of truth for the OpenClaw outbound agent. The agent reads this file before every prospect search, research, and email draft. Edit this file when reality changes; the agent's behavior changes with it.

---

## 1. What we sell (one sentence)

Reasonable Automations builds custom software automations for ops-heavy small businesses — replacing manual data entry, spreadsheet-driven workflows, and brittle copy-paste integrations with reliable headless software that runs unattended.

## 2. The wedge (the proven entry point)

**Utility billing automation for property managers.** Built for one PM customer (≈20 employees, 800 units under management): web scrapers pull statements from utility provider portals, parse them, and import into the customer's existing property management platform. Cut the team's manual utility-billing time from ~200 hours/month to effectively zero.

That deal expanded into a broader automation platform for the same customer. The wedge — automating one specific high-volume manual workflow — is reproducible. The expansion is the long game.

## 3. Buyer (who we email vs. who signs)

### Champion (cold-email target)

| Field | Value |
|---|---|
| Title | COO, Director of Operations, Operations Manager, Office Manager, Head of Operations |
| Profile | In the trenches with the team. Personally feels the manual-work pain. Has strong influence with the CEO/owner. |
| Why them | They are the only person who can articulate the workflow pain in detail. They are the internal seller. |

### Economic buyer (NOT the cold-email target)

| Field | Value |
|---|---|
| Title | CEO, Owner, Founder, Principal, Managing Partner |
| Profile | External-facing / visionary. Trusts the COO on operational decisions. Will not respond to operational pain language. |
| Reach via | The champion, after the demo. Never CC them on cold email. |

## 4. Firmographics

- **Headcount:** 15–75 employees (sweet spot). Acceptable: 10–150.
- **Geography:** United States only.
- **Stage / ownership:** Bootstrapped, family-owned, or PE-owned. **NOT VC-backed** (they will build it themselves).
- **Tech profile:** Low- to mid-tech. Mix of vertical SaaS, Excel, shared inboxes, and PDFs. Typically 0–1 internal developers.

## 5. Target verticals (seed list — agent rotates across these)

The product is industry-agnostic, but cold outbound needs vertical specificity to land. Each of these has known manual-ops density and proven appetite for the kind of work we do.

1. **Property management** (proven; replicate the existing customer profile)
2. **Insurance brokerages** — manual policy admin, certificate-of-insurance tracking, renewal processing
3. **HVAC / plumbing / electrical service companies** — dispatch, invoicing, parts ordering, warranty registration
4. **Medical billing / small clinics** — claims, statements, EOB processing, patient-balance follow-ups
5. **Construction subcontractors** — job costing, lien waivers, change orders, AIA billing
6. **Freight forwarding / small 3PL** — manifest entry, customs documentation, status updates across carrier portals
7. **Small accounting firms / bookkeeping services** — client onboarding, document collection, multi-portal reconciliation
8. **Wholesale distribution** — order entry, vendor portal scraping, inventory sync across systems

The agent should rotate, not blast all eight at once. Two verticals per week is a reasonable cadence for early outbound.

## 6. Workflow signals (what tells the agent a prospect has the pain)

A prospect is "in" if the agent can verify at least **one** of these from public sources (website, LinkedIn, job boards, reviews):

- Public job posts mentioning "data entry," "Excel reconciliation," "manual import," "AP/AR processing," "bookkeeping coordinator," "operations coordinator"
- About / services page describes high-volume transaction work performed by a small team
- LinkedIn profiles of ops staff describe manual processes, multi-system reconciliation, or "wearing many hats"
- Reviews / testimonials / press mention scaling pain, hiring to handle volume, or growing pains
- Vertical SaaS in their stack is known for poor integrations (Buildium for PM, AMS360 for insurance, ServiceTitan for HVAC, etc.)

If the agent cannot verify at least one signal, **skip the prospect**. Do not draft an email on speculation.

## 7. Disqualifiers (auto-reject)

- <10 employees
- \>200 employees
- VC-backed (any round of institutional venture capital)
- Pure-play tech / SaaS / software companies
- Companies hiring software engineers, data engineers, or automation engineers (they will build it)
- Companies whose website prominently markets "AI-powered" or "automation" as their own offering
- Companies in regulated industries where compliance prevents third-party data integrations without long sales cycles (e.g., large healthcare systems, banks, government contractors)

## 8. Proof points (the numbers we use in emails)

Use these verbatim. Do not inflate.

- Customer: 20-person property manager, ~800 units under management
- Before automation: ~200 hours/month spread across the ops team on manual utility billing
- After automation: runs unattended; ops team time on utilities effectively zero
- Outcome: that team's capacity is freed to take on more units / clients without hiring

If a prospect asks for more detail, escalate to Megha for a customer-specific case study conversation.

## 9. Value proposition (per persona)

**For the COO / ops lead (champion):**
> "You don't keep hiring just to handle the volume. The same workflow that takes your team 10 hours a week runs in the background instead."

**For the CEO / owner (the line the COO can quote internally):**
> "Your ops team's capacity becomes a growth lever, not a ceiling. Same headcount, more units / clients / volume."

## 10. Email rules (hard constraints for the agent)

### DO

- Open with **one specific, verifiable observation** about the prospect: a job post, a service area, a known software they use, a recent expansion or new office, a specific vertical-software stack
- Tie that observation to a specific workflow we have automated for a similar company
- Quote the proof numbers (800 units, ~200 hours/month → 0)
- End with one ask: a 30-minute call. No alternative CTAs.
- Keep under 110 words
- Sign as **Megha** with no title (personal email vibe)

### DON'T

- Fabricate any fact about the prospect. If unverifiable, omit. The agent must include source URLs in its prospect record for every fact it uses.
- Use "I noticed you..." / "Hope this finds you well" / "Quick question" / any phrase that flags this as templated outbound
- Include tracking pixels, UTM parameters, or unsubscribe footers — emails are sent manually from a personal inbox
- Reference industry trends, AI, "digital transformation," or any abstract phrase
- Promise specific dollar amounts or ROI percentages without basis
- CC anyone, including the CEO
- Use the word "automation" more than twice (it has been beaten to death in their inbox)

## 11. Output format the agent must produce per prospect

For every prospect that passes the filter, produce a record with:

- Company name, website, LinkedIn URL
- Vertical (from the seed list)
- Headcount (Apollo)
- Champion: name, title, LinkedIn URL, email
- Verified workflow signal(s) — with source URL for each
- One-paragraph "why this prospect" justification (≤80 words)
- Email draft (≤110 words, body only — no subject line yet, we'll author those by hand initially)
- Confidence: high / medium / low (skip low-confidence prospects)

Records go into a daily review queue Megha reads each morning before sending.

---

## Open questions / TODO

- [ ] Decide subject-line strategy (write by hand for first 20, then templatize)
- [ ] Define the daily volume cap (initial: 5–10/day)
- [ ] Decide whether to also produce a personalized demo page per prospect (deferred until copy-paste pipeline is working)
- [ ] Add second-touch / follow-up template once we have data on what gets opened

