# RA Demo · Service Dispatch (HVAC / Plumbing / Electrical)

One template, three vertical packs. Set `vertical` in `config/demo.config.ts` and the entire demo personalizes — copy, terminology, urgency examples, skill tags, fake data.

## What this is

A dark, refined operational platform UI for service businesses. Demonstrates RA's multi-source dispatch automation as the hero workflow: requests come in from voicemail, web forms, email, and a field-service platform → classified for urgency → matched to a technician with the right skills, location, and calendar availability → calendar invites and SMS confirmations sent automatically.

The runner takes ~9 seconds and dispatches 13 tickets. Two of them are emergencies. The COO clicking "Run dispatch" sees their morning happen, automatically.

## Setup

```bash
npm install
npm run dev
# → http://localhost:3000 → redirects to /dashboard
```

## Personalizing for a prospect

**Edit `config/demo.config.ts` only.**

```typescript
export const demoConfig: DemoConfig = {
  vertical: "plumbing",                     // hvac | plumbing | electrical
  company: {
    name: "Cascade Plumbing",
    logo: "/logos/cascade.png",             // null falls back to monogram
    primaryColor: "#0891b2",                // their brand color (hex)
    location: "Seattle, WA",
  },
  scale: {
    workers: 22,                            // their actual headcount
    weeklyTickets: 240,
    weeklyDispatchHoursBefore: 30,          // scale with team size
  },
  details: {
    fieldServiceSystem: "ServiceTitan",     // verified from their stack
    phoneSystem: "RingCentral",
  },
};
```

### How verticals differ

| | HVAC | Plumbing | Electrical |
|---|---|---|---|
| Worker term | technician | plumber | electrician |
| Urgency examples | no heat / no AC / gas smell | burst pipe / sewage backup / no water | sparking outlet / no power / burning smell |
| Issue types | refrigerant, ductwork, heat pump install | drain, water heater, repipe | panel upgrade, EV charger, generator |
| Skills | EPA 608, NATE, refrigerant, ductwork | master plumber, gas line, backflow, sewer | master, journeyman, panel, EV, generator |

The agent doesn't pick these — they're loaded from the vertical pack based on the `vertical` flag.

### Per-prospect agent checklist

1. **Verify ICP fit** from Agent 1's research record
2. **Pick the vertical** — `hvac` | `plumbing` | `electrical` (their actual trade)
3. **Set company.name + logo** — drop logo PNG into `public/logos/` if available
4. **Set company.primaryColor** — extract from logo or website
5. **Set scale numbers** — actual headcount and ticket volume if researched
6. **Set details.fieldServiceSystem** — verified from job posts or website (ServiceTitan, Housecall Pro, Jobber, FieldEdge, etc.)
7. **Deploy** — `vercel --prod` from this directory
8. **Save URL** — write back to the prospect record

### What NOT to personalize

- Don't edit vertical packs per prospect — they're shared across all prospects in that vertical
- Don't change layouts, fonts, or theme structure
- Don't add or remove pages without you (Megha) approving
- Don't tweak runner copy — the vertical pack handles that

## Adding a new vertical

If you want to add (e.g.) garage door, locksmith, or appliance repair:

1. Create `config/verticals/garage_door.ts` conforming to `VerticalPack`
2. Add it to the registry in `config/verticals/index.ts`
3. Add `"garage_door"` to the `VerticalKey` union in `config/verticals/types.ts`
4. The whole template now supports it. No other code changes.

## Deployment

```bash
# First time:
npx vercel link
npx vercel --prod

# Subsequent prospects (after editing config):
npx vercel --prod
```

## File map

```
config/demo.config.ts                  ← THE personalization file (only thing edited per prospect)
config/verticals/types.ts              ← VerticalPack contract
config/verticals/hvac.ts               ← HVAC vocabulary, urgency, skills
config/verticals/plumbing.ts           ← Plumbing vocabulary, urgency, skills
config/verticals/electrical.ts         ← Electrical vocabulary, urgency, skills
config/verticals/index.ts              ← Pack registry
lib/theme.ts                           ← Hex → theme variables
lib/fake-data.ts                       ← Vertical-aware deterministic fake data
lib/utils.ts                           ← cn() helper
app/layout.tsx                         ← Loads fonts, injects theme variables
app/page.tsx                           ← Redirects to /dashboard
app/dashboard/page.tsx                 ← Operational overview, hero CTA
app/dispatch/page.tsx                  ← THE hero page: dispatch runner
app/board/page.tsx                     ← Ticket kanban board
app/technicians/page.tsx               ← Roster grouped by status
components/demo/dispatch-runner.tsx    ← THE interactive centerpiece
components/layout/sidebar.tsx
components/layout/demo-banner.tsx
components/layout/page-shell.tsx
```

## Design intent

**Aesthetic:** identical to the property management template (intentional — same RA, same design system). Dark operational software lineage. Prospect's brand color used as accent, not dominant.

**The dispatch runner** is where this demo earns its keep. Five stages, real-time logs, urgent tickets called out in red, streamed assignment table. Animation timing is tuned to ~9 seconds — long enough to feel like real coordination, short enough to keep attention.

**The honest framing** banner stays at the top of every page, same as PM. "Tailored demo for X · prepared by Reasonable Automations" — not a fake product.

**Why one template for three trades:** the workflow is *structurally* the same (multi-source intake → urgency classify → skill+location match → calendar + comms), but the *vocabulary* is different. The vertical pack abstracts the vocabulary out so the structural code stays single-source-of-truth. When you ship this to plumbers, they see plumber-specific examples; when electricians see it, they see electrician-specific examples; the underlying claim about what the automation does is identical.
