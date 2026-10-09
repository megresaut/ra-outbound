# Reasonable Automations — Pain Library

> Source of truth for Agent 2 (Pain Mapper). This file codifies workflows RA has solved or can credibly solve, abstracted into patterns that transfer across industries. Edit when reality changes; the agent's behavior changes with it.
>
> **Hard rule for Agent 2:** never invent a pain point that isn't grounded in this file. If a prospect's research doesn't match anything here, output `{"matches": []}` and let Megha decide whether to add a new pattern or skip the prospect.

---

## Schema

Each pain pattern has:

- **id** — short slug used in agent outputs
- **name** — human-readable name
- **abstract_pattern** — the underlying workflow shape, industry-agnostic
- **what_we_solve** — concrete description of how RA automates it
- **proof_points** — actual numbers/outcomes RA can cite (only from real customers)
- **manifests_in** — verticals where this pattern shows up, with vertical-specific phrasing
- **signal_keywords** — words/phrases in research that suggest this pattern is the prospect's pain
- **demo_template** — which demo template Agent 3 should use (or `none` if no template covers it)
- **demo_vertical** — for templates with multiple verticals, which one
- **email_hook** — the specific observation phrasing that grounds an email's opening line

---

## Pattern: multi-portal data extraction

```yaml
id: multi_portal_extraction
name: Multi-portal data extraction
abstract_pattern: |
  Team logs into N external portals on a recurring cadence (weekly, monthly),
  downloads documents (PDFs, CSVs) from each, parses them into structured data,
  matches the data to internal records, and posts/imports into the system of record.
  Time scales linearly with portal count and document volume.

what_we_solve: |
  Headless scrapers + credential vault per provider. Documents pulled on schedule.
  PDFs parsed with structured extraction. Records matched and posted automatically
  to the system of record. Exceptions (parse failures, unmatched records) flagged
  for human review — typically <5% of volume.

proof_points:
  - customer: "20-person property manager, ~800 units"
    before: "~200 hours/month manual utility billing"
    after: "effectively zero — runs unattended overnight"
    cycle: "monthly"

manifests_in:
  property_management:
    workflow: "Utility billing — pulling statements from utility provider portals each month"
    portals_examples: ["Austin Energy", "ConEd", "PG&E", "local water utilities"]
    receiving_system: ["Buildium", "AppFolio", "Yardi", "RealPage"]
  insurance_brokerage:
    workflow: "Pulling COIs, endorsements, and policy documents from carrier portals"
    portals_examples: ["Travelers", "Hartford", "Chubb", "Liberty Mutual"]
    receiving_system: ["AMS360", "Applied Epic", "EZLynx", "HawkSoft"]
  freight_3pl:
    workflow: "Pulling shipment status, BOLs, customs docs from carrier and broker portals"
    portals_examples: ["FedEx", "UPS", "ocean carrier portals", "CBP ACE"]
    receiving_system: ["CargoWise", "Magaya", "ShipStation"]
  wholesale_distribution:
    workflow: "Pulling vendor catalogs, price updates, order status from supplier portals"
    portals_examples: ["McKesson", "supplier B2B portals", "EDI partners"]
    receiving_system: ["NetSuite", "SAP", "QuickBooks Enterprise"]
  small_accounting_firms:
    workflow: "Pulling client bank statements, payroll exports, and prior-year tax docs from N institutions per client during onboarding and monthly close"
    portals_examples: ["client bank portals", "Gusto", "ADP", "Stripe", "Square", "Shopify"]
    receiving_system: ["QuickBooks Online", "Xero", "Karbon"]
    note: "Pitch is automating *their client onboarding/close*, not their internal ops. Different surface, same pattern."

signal_keywords:
  - "data entry"
  - "manual import"
  - "portal"
  - "monthly close"
  - "reconciliation"
  - "downloading statements"
  - "AP processing"
  - "AR coordinator"
  - "operations coordinator"
  - "billing specialist"
  - "client onboarding"
  - "document collection"
  - "engagement coordinator"

demo_template: property_management
demo_vertical: null

email_hook: |
  "{specific portal count + workflow}" — e.g.
  "Saw your team handles billing across {N} utility providers in {city}"
  or
  "Noticed you're pulling COIs from {N}+ carriers manually each renewal cycle"
  or for accounting:
  "Saw your engagement coordinator role — onboarding a client usually means
   chasing docs across 6+ portals before any work starts"
```

---

## Pattern: multi-source ticket dispatch

```yaml
id: multi_source_dispatch
name: Multi-source ticket intake and dispatch
abstract_pattern: |
  Service requests arrive through 3+ disconnected channels (phone, web form,
  email, partner platform). Someone manually triages each, classifies urgency,
  identifies skill required, finds an available worker with matching skills,
  books on calendar, and notifies both customer and worker. Compresses to
  hours/day for any team handling >50 tickets/week.

what_we_solve: |
  Unified intake adapter (Twilio for voicemail/SMS transcription, web form
  capture, email parsing, platform APIs). LLM-assisted classifier reads each
  request and tags urgency + skill required. Matching engine considers worker
  certifications, current calendar, and route optimization. Calendar invites
  go to both worker and customer. SMS confirmations sent automatically.

proof_points: []  # No production customer for this yet — flag in emails as "we built this for an HVAC reference customer"

manifests_in:
  hvac:
    workflow: "Triaging service calls from voicemail, web forms, and ServiceTitan"
    skill_examples: ["EPA 608", "NATE certified", "heat pump install"]
    typical_urgent: ["no heat (winter)", "no AC (heat advisory)", "gas smell"]
  plumbing:
    workflow: "Triaging service calls from voicemail, web forms, and ServiceTitan"
    skill_examples: ["master plumber", "gas line", "backflow", "sewer"]
    typical_urgent: ["burst pipe", "sewage backup", "no water"]
  electrical:
    workflow: "Triaging service calls from voicemail, web forms, and ServiceTitan"
    skill_examples: ["master", "panel upgrade", "EV charger", "generator"]
    typical_urgent: ["sparking outlet", "no power", "burning smell from panel"]

signal_keywords:
  - "dispatcher"
  - "dispatch coordinator"
  - "service coordinator"
  - "office manager"
  - "answering service"
  - "after-hours line"
  - "scheduling"
  - "ServiceTitan"
  - "Housecall Pro"
  - "Jobber"
  - "FieldEdge"
  - "phone tree"
  - "voicemail"

demo_template: service_dispatch
demo_vertical: depends_on_trade   # hvac | plumbing | electrical, set by Agent 3

email_hook: |
  "Saw your office handles dispatch across {phone + web + ServiceTitan}"
  or
  "Noticed you're hiring an office manager — most likely to handle dispatch
   triage and scheduling"
```

---

## Pattern: certificate / document expiration tracking

```yaml
id: expiration_tracking
name: Certificate and document expiration tracking
abstract_pattern: |
  Team manages a portfolio of N records, each tied to one or more documents
  with expiration dates. Currently tracked in spreadsheets or a fragmented
  feature in vertical SaaS. Renewals require chasing the document holder
  (tenant, vendor, customer, contractor) for updated docs, parsing the new
  doc to confirm coverage, and updating the record. Misses create liability.

what_we_solve: |
  Centralized record store. Documents auto-extracted and dates parsed.
  Auto-reminder sequence (email + SMS) starting 60/30/14/7 days before
  expiration. Inbound replies parsed for new attachments, attached docs
  extracted and verified, record updated. Escalation when a record passes
  expiration without renewal.

proof_points: []  # Adjacent to RA AVM insurance module — flag carefully

manifests_in:
  property_management:
    workflow: "Tracking tenant renters insurance, COIs from contractors, master policy renewals"
    record_type: "policies, COIs"
  insurance_brokerage:
    workflow: "Tracking COIs and policy renewals across the book of business"
    record_type: "policies, COIs, endorsements"
  construction_subcontractors:
    workflow: "Tracking subcontractor COIs, license renewals, lien waivers per project"
    record_type: "COIs, licenses, lien waivers"
  hvac:  # cross-industry: HVAC contractors holding GC COIs
    workflow: "Tracking commercial customer COI requirements"
    record_type: "COIs"

signal_keywords:
  - "certificate"
  - "COI"
  - "renewal"
  - "expiration"
  - "compliance coordinator"
  - "renewal coordinator"
  - "endorsement"

demo_template: none   # No template yet — Agent 3 should flag and email-only this pattern
demo_vertical: null

email_hook: |
  "Saw the listing for a renewal coordinator — that role usually means manual
   COI tracking across {N} carriers/vendors"
```

---

## Pattern: AP/AR document processing

```yaml
id: ap_ar_processing
name: AP/AR document processing
abstract_pattern: |
  Inbound vendor bills or outbound customer invoices flow through an inbox
  and get manually entered into the accounting system. Volume scales with
  business size. Each document requires extraction (vendor, amount, date,
  line items), GL coding, and posting. Reconciliation against bank
  statements happens monthly.

what_we_solve: |
  Inbox monitor. PDF/image OCR + structured extraction. GL coding via
  vendor history rules. Auto-posting to the accounting system (QuickBooks,
  Sage Intacct, NetSuite). Bank reconciliation pre-matched and surfaced
  for review.

proof_points:
  - customer: "Same property manager, in-progress build"
    before: "Manual bill entry, ~30 hours/month bookkeeping coordinator time"
    after: "Auto-posted to QBO; reconciliation pre-matched"
    cycle: "monthly"
    note: "Currently in development on accounting branch — flag as 'building this now' if a prospect asks for proof"

manifests_in:
  property_management:
    workflow: "Vendor bill entry into Buildium/AppFolio + QuickBooks reconciliation"
  small_accounting_firms:
    workflow: "Client document collection and multi-entity reconciliation"
  construction_subcontractors:
    workflow: "Vendor bill entry + AIA billing per project"
  wholesale_distribution:
    workflow: "Vendor bill entry against POs"
  hvac:
    workflow: "Parts vendor bill entry + customer invoice generation"

signal_keywords:
  - "accounts payable"
  - "AP coordinator"
  - "bookkeeping coordinator"
  - "QuickBooks"
  - "Sage"
  - "NetSuite"
  - "vendor bills"
  - "bill entry"
  - "reconciliation"
  - "month-end close"

demo_template: none   # No template yet — covered conceptually in PM dashboard but not as a demoable runner
demo_vertical: null

email_hook: |
  "Saw your bookkeeping coordinator role — at your volume that's most likely
   bill entry from {N} vendors monthly"
```

---

## Pattern: medical claims and EOB processing

> ⚠️ **High-risk vertical.** Compliance gating (HIPAA/BAA), longer sales cycles, and PHI handling. Default audience is **third-party medical billing companies** (50–200 employees, already operating under BAAs with multiple practices), NOT clinics directly. Agent 4 should add a brief credibility note when emailing this vertical and flag the prospect for Megha's manual review before any send.

```yaml
id: medical_claims_processing
name: Medical claims and EOB processing
abstract_pattern: |
  Each patient encounter generates a claim that flows through a multi-step
  lifecycle: insurance eligibility check → claim submission → EOB receipt
  → payment posting → patient balance follow-up. Each step touches multiple
  payer portals (BCBS, Aetna, UHC, Medicare, Medicaid) with different
  formats, rules, and rejection codes. Volume scales linearly with
  patient count. A 5-FTE billing team can spend 60% of their week on
  EOB downloads and rejection re-submissions alone.

what_we_solve: |
  Per-payer adapters that pull EOBs and remittances on schedule from each
  payer portal. Structured extraction normalizes ERAs and paper EOBs into
  a unified format. Auto-posting against the practice management system.
  Rejection codes routed to the appropriate worklist with suggested next
  action based on rejection type. All within a HIPAA-compliant pipeline
  on customer infrastructure.

proof_points: []   # No production customer. Agent 4: do not invent numbers. Use "we built similar multi-portal automations for a property management customer (~800 records, ~200 hours/month → 0)" as transferable evidence, framed honestly as adjacent.

manifests_in:
  medical_billing_companies:
    workflow: "Pulling EOBs/ERAs across 5–15 payer portals, posting to PM system, working rejections"
    portals_examples: ["BCBS portal", "Availity", "Optum", "Change Healthcare", "Medicare DDE/PC-ACE"]
    receiving_system: ["Kareo", "AdvancedMD", "athenaCollector", "DrChrono", "eClinicalWorks"]
  small_clinics:
    workflow: "Same as above but in-house — usually 1–2 person billing team"
    note: "Lower headcount, same pain. Sales cycle longer because clinic decision-makers are physicians, not ops people."

signal_keywords:
  - "medical biller"
  - "claims specialist"
  - "AR specialist"
  - "denial management"
  - "revenue cycle"
  - "EOB"
  - "ERA"
  - "payer portal"
  - "Availity"
  - "remittance"
  - "Kareo"
  - "AdvancedMD"
  - "athenahealth"

risk: high
risk_reasons:
  - "PHI handling requires BAA and compliance review before any technical conversation"
  - "Sales cycle is 3–6 months minimum; not a fit for fast-pipeline outbound"
  - "RA does not currently have a HIPAA compliance posture; this is an aspirational vertical"

demo_template: none   # No template, and would not deploy one without compliance review even if it existed
demo_vertical: null

email_hook: |
  "Saw the listing for an AR/denial specialist — at your patient volume that's
   most likely manual EOB downloads across {N} payer portals each week"

agent_4_override: |
  When this pattern matches:
  - Do NOT cite specific numbers in the email — use only the transferable PM proof framed as "adjacent industry, same pattern shape"
  - Add a single sentence acknowledging compliance: "We work under BAA for HIPAA-covered automations."
  - Flag the prospect record with `requires_megha_review: true` regardless of confidence
  - Skip the demo URL even if Agent 3 produced one
```

---

## Pattern: AIA billing and lien waiver tracking

```yaml
id: aia_billing_lien_waivers
name: AIA billing cycle and lien waiver tracking
abstract_pattern: |
  On commercial construction projects, the prime contractor or subcontractor
  submits monthly pay applications using AIA G702/G703 forms. Each submission
  must include conditional lien waivers from the submitter and unconditional
  waivers from the prior period — plus, for primes, a chain of waivers from
  every sub-tier sub. Missing or stale waivers reject the pay app, delaying
  payment by 30–60 days. The work is currently spreadsheets, PDF forms, and
  email chasing.

what_we_solve: |
  Per-project waiver tracker keyed to pay-app cycles. Auto-generated waiver
  request emails to subs with the right form (conditional vs unconditional)
  pre-filled with project, period, and amount. Inbound waiver receipts
  parsed and matched to the project/period. Pay app builder generates the
  G702/G703 with the full waiver package attached. Calendar of pay-app
  deadlines auto-prompts on the 25th-of-month cycle.

proof_points: []   # Adjacent — RA has built document workflow automations but not this specific one in production

manifests_in:
  construction_subcontractors:
    workflow: "Submitting monthly pay apps, chasing sub-tier waivers, tracking retainage release"
    receiving_system: ["Procore", "Sage 100 Contractor", "Foundation", "QuickBooks Enterprise + spreadsheets"]
    typical_volume: "10–40 active projects, monthly cycles per project"
  general_contractors:
    workflow: "Receiving pay apps from subs, verifying waiver chains, releasing payment"
    note: "Larger GCs already use Procore Pay or Textura. Sweet spot is mid-market GCs (50–200 staff) who haven't invested in those yet."

signal_keywords:
  - "AIA billing"
  - "G702"
  - "G703"
  - "lien waiver"
  - "pay app"
  - "pay application"
  - "retainage"
  - "billing coordinator"
  - "project accountant"
  - "Procore"
  - "Sage 100 Contractor"

demo_template: none   # No template yet; Agent 3 skips, Agent 4 drafts demo-less email

email_hook: |
  "Saw the project accountant role — at {N} active projects, AIA cycle and
   waiver chasing is usually the bulk of the month-end crunch"
```

---

## Pattern: accounting firm client onboarding and close

> Specific to accounting firms. Note: the **multi_portal_extraction** pattern already covers part of this surface (doc collection during onboarding). This pattern captures the broader workflow including the recurring monthly close cycle.

```yaml
id: accounting_client_close
name: Multi-client document collection and recurring close
abstract_pattern: |
  Each client has a recurring document-gathering ritual: monthly bank statements
  pulled from N institutions, payroll exports from Gusto/ADP, payment processor
  exports from Stripe/Square/Shopify, credit card transactions categorized.
  Junior staff spend 30–50% of their hours just collecting and reconciling
  before any actual accounting work happens. Capacity scales with clients
  served, not with revenue.

what_we_solve: |
  Per-client portal connections (read-only). Auto-pulled monthly with format
  normalization. Bank reconciliations pre-matched against accounting system
  history. Categorization rules learned from prior months' decisions.
  Junior staff start the month with reconciliations 80% complete instead
  of 0%, freed for the analysis work clients actually pay for.

proof_points: []   # Adjacent — the PM vendor bill processing work is the closest, framed as transferable.

manifests_in:
  small_accounting_firms:
    workflow: "Doc collection across N clients monthly + reconciliation"
    typical_volume: "20–100 active clients, monthly close per client"
    receiving_system: ["QuickBooks Online", "Xero", "Karbon", "Canopy"]

signal_keywords:
  - "engagement coordinator"
  - "client onboarding specialist"
  - "bookkeeper"
  - "staff accountant"
  - "client services manager"
  - "monthly close"
  - "Karbon"
  - "Canopy"

demo_template: property_management   # The portal-extraction pattern transfers; PM demo is the closest visual analog
demo_vertical: null
demo_caveat: |
  Agent 3 should personalize the PM demo BUT update copy carefully — accounting
  firms will see "utility billing" and bounce. Agent 3 must override the demo
  config's hero workflow framing to "client document collection" before deploy,
  OR Agent 4 emails without a demo URL and offers one on the call.
  Default behavior: skip demo, email-only. Megha can manually deploy if a reply comes in.

email_hook: |
  "Saw the engagement coordinator role — onboarding any new client usually
   means 6+ portals before billing starts"
```

---



## Cross-industry transfer rules (for Agent 2)

When a prospect's research signals a pattern that hasn't been listed in their specific vertical above:

1. **Check the abstract pattern.** If their workflow matches the abstract pattern (e.g., "they pull data from N portals each month"), the pattern applies even if their industry isn't in `manifests_in`.
2. **Use the closest sister vertical's phrasing.** If the prospect is in (e.g.) auto repair and the multi_source_dispatch pattern applies, lift the HVAC manifestation phrasing — it's a direct shape match.
3. **Don't over-match.** A pattern only applies if the prospect has the specific bottleneck the pattern solves. A 5-person business with low volume isn't suffering from dispatch pain even if they're an HVAC company. Headcount and volume have to be there.
4. **Respect risk flags.** Patterns with `risk: high` (currently medical_claims_processing) require Megha review regardless of how clean the match looks. Agent 2 still produces the match record, but Agent 4 reads the risk flag and never auto-drafts — it writes "REQUIRES MEGHA REVIEW" at the top of the email and leaves the body as a structured outline rather than a finished draft.

---

## When Agent 2 should flag for Megha (not auto-process)

- Prospect's research signals a pattern not in this file. Don't fabricate a new pattern; flag the prospect with `needs_pattern_review: true` and let Megha decide.
- Prospect signals a pattern but with no `demo_template`. Agent 3 will skip; Agent 4 still drafts an email but without a demo URL — flag it as "demo deferred."
- Prospect signals 3+ patterns. The email will be too unfocused; flag for Megha to pick the strongest one manually.

---

## Adding a new pattern

When you (Megha) close or attempt a deal that revealed a new pattern:

1. Append a new `## Pattern: {name}` section to this file
2. Fill out the schema
3. Update `signal_keywords` with anything you saw in their research that signaled the pain
4. Set `demo_template: none` if no template covers it yet — Agent 4 will draft demo-less emails and you can decide whether the volume justifies a new template
5. Re-run the pipeline against any prospects in the queue that hadn't matched cleanly

The library is the compounding asset. Templates compound the demo work; this file compounds the pattern recognition.
