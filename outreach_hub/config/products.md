# RA Outbound Products — Demo Catalog & Voice Rules

> ⚠️ **REVIEW BANNER — UNSIGNED HUMAN-OWNED INPUT** ⚠️
>
> This file was scaffolded by the automation because the email-draft phase
> required a product catalog + voice rules but none existed yet. The agent
> reads this file as the source of truth for which demo to point a prospect
> at and how to write the cold open.
>
> **Megha must review, edit, and remove this banner before emails are
> send-ready.** Until this banner is removed, any draft produced from this
> file should be flagged "EMAILS NOT SEND-READY — products.md unsigned by
> human."

---

## Products (two fixed demos, already deployed)

### `utility-billing`

- **What it is:** Owner-statement / utility-billback automation for
  property managers. Web scrapers pull statements from utility provider
  portals, parse them, reconcile against the portfolio, and post into the
  customer's existing property-management platform.
- **Permanent demo URL:** `https://ra-demo-utility-billing.vercel.app`
- **Branded query params:** `?company=<name>&logo=<url>` (URL-encoded).
- **Best fit champion:** Director of Operations / COO / Office Manager at
  a firm that runs a meaningful number of owner statements per month.

### `maintenance-management`

- **What it is:** Maintenance / concierge-operations board. Work-order
  intake across phone/email/portal, vendor coordination, per-residence
  timelines, recurring-service schedules.
- **Permanent demo URL:** `https://ra-demo-maintenance-ops.vercel.app`
- **Branded query params:** `?company=<name>&logo=<url>` (URL-encoded).
- **Best fit champion:** Head of Operations / Service Manager at a firm
  whose maintenance workload spans multiple residences and vendors.

---

## Selection rule

Email-draft picks one product per prospect:

1. If the prospect's firm signals lean toward owner billing, statements,
   utility pass-through, or finance-ops cadence → `utility-billing`.
2. If the prospect's firm signals lean toward maintenance throughput,
   vendor coordination, work-order intake, or concierge ops →
   `maintenance-management`.
3. **Ambiguous default:** `utility-billing` (and the selection is logged).

The selection should be deterministic for the same prospect input.

---

## `cold_open_angle` — voice rules for the email draft

The body is largely fixed (`outreach_hub/lib/pipeline/email-template.ts`).
These rules constrain what the draft is allowed to say.

1. **Never name a specific property-management platform.** Do not write
   "Buildium", "AppFolio", "Yardi", "ResMan", "Rent Manager",
   "Propertyware", "RealPage", "Entrata", "DoorLoop", or "TenantCloud" in
   the email body or subject. The prospect knows their own stack; naming
   the wrong one burns the email.
2. **No hype words.** Banned: "streamline", "leverage", "synergy",
   "transform", "empower", "unlock", "robust", "seamless", "powerful".
3. **Concrete and operational.** Reference the workflow shape (statements,
   utilities pass-through, vendor coordination, maintenance routing) — not
   abstractions about "scale" or "growth".
4. **One firm-specific anchor.** Use the prospect's own company name as
   the only personalization anchor. Do not invent quotes, headcount
   numbers, software stacks, or testimonials.
5. **Demo placement.** The demo URL appears once in the body. It is
   rendered at send time via the `{{demo_url}}` token; the draft must
   preserve that token verbatim.
6. **Length.** Short. 4 short paragraphs maximum. Subject ≤ 60 characters.
7. **Sign-off.** "Megha" (single first name). Do not add a title.

If any rule conflicts with a workflow example from the approved list,
drop the example rather than break the rule.
