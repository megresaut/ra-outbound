# RA Demo · Property Management

Tailored demo template for Reasonable Automations outbound to property management prospects.

## What this is

A dark, refined operational platform UI that demonstrates RA's utility billing automation (the wedge) plus supporting modules. Personalized per prospect by editing one config file.

The demo's job is to make the pain tangible: a COO clicks "Run automation" and watches 47 statements get pulled, parsed, matched, and posted in 9 seconds. That's the pool render equivalent.

## Setup

```bash
npm install
npm run dev
# → http://localhost:3000 → redirects to /dashboard
```

## Personalizing for a prospect

Edit `config/demo.config.ts` only. Everything else reads from it.

```typescript
export const demoConfig: DemoConfig = {
  company: {
    name: "Acme Property Management",       // their name
    logo: "/logos/acme.png",                 // optional; null falls back to monogram
    primaryColor: "#2563eb",                 // their brand color (hex)
    location: "Boston, MA",                  // city, state
  },
  workflow: {
    primary: "utility_billing",              // hero workflow
    enabled: ["utility_billing", "maintenance", "vendors"],
  },
  scale: {
    units: 1200,                             // their actual unit count if known
    properties: 65,
    monthlyHoursBefore: 240,                 // scale this with units
  },
  details: {
    utilities: ["NSTAR", "National Grid"],   // real providers in their service area
    propertyManagementSystem: "AppFolio",    // what they actually use
  },
};
```

### Per-prospect agent checklist

When personalizing, the agent should:

1. **Verify ICP fit** — pull the prospect record from Agent 1's research
2. **Set company.name + logo** — drop logo PNG into `public/logos/` if available
3. **Set company.primaryColor** — extract from logo or website
4. **Set scale numbers** — use actual unit count if researched, otherwise default
5. **Set details.utilities** — research actual providers in their service area
6. **Set details.propertyManagementSystem** — verified from job posts or website
7. **Deploy** — `vercel --prod` from this directory
8. **Save URL** — write the deployment URL back to the prospect record

### What NOT to personalize

- Don't change layouts, fonts, or theme structure
- Don't add or remove pages without you (Megha) approving
- Don't tweak copy on individual pages — that's the template's job to stay consistent
- Don't invent unit counts or provider names — leave defaults if not researched

## Deployment

```bash
# First time:
npx vercel link
npx vercel --prod

# Subsequent prospects (after editing config):
npx vercel --prod
```

Each prospect gets a unique Vercel deployment URL. Save it into the prospect's record.

## File map

```
config/demo.config.ts           ← THE personalization file (only thing to edit per prospect)
lib/theme.ts                    ← Hex → theme variable generation
lib/fake-data.ts                ← Deterministic fake data, seeded by company name
lib/utils.ts                    ← cn() helper
app/layout.tsx                  ← Loads fonts, injects theme variables
app/page.tsx                    ← Redirects to /dashboard
app/dashboard/page.tsx          ← Operational overview, hero CTA
app/utility-billing/page.tsx    ← Hero demo: the automation runner
app/maintenance/page.tsx        ← Supporting page
app/vendors/page.tsx            ← Supporting page
components/demo/automation-runner.tsx  ← The interactive centerpiece
components/layout/sidebar.tsx
components/layout/demo-banner.tsx
components/layout/page-shell.tsx
```

## Design intent

**Aesthetic:** Dark operational software. Linear / Vercel / Stripe Dashboard lineage. The accent color is the prospect's brand, but it's used sparingly — primary surfaces are near-black, text is restrained, the palette stays refined regardless of input hex.

**Typography:** Fraunces (display serif) for headlines, Inter Tight (sans) for UI, JetBrains Mono for tabular data. The serif/sans pairing signals "considered software for adults."

**The demo banner** at the top is intentional honesty. COOs aren't fooled by fake products — owning the framing as "tailored demo prepared for X by Reasonable Automations" builds trust instead of suspicion.

**The automation runner** is where the demo earns its keep. Every other page is supporting structure. If you're tempted to add features elsewhere, the answer is no — make the runner more compelling instead.

## When to break the template (for Megha)

After 5-10 deployments, you'll learn what prospects react to. Things worth iterating on:

- The hero page copy (currently generic; could hit harder)
- The run timing (9s might be too fast to feel real, or too slow)
- Whether the "flagged for review" outcome lands as honesty or as a flaw
- Whether anyone clicks beyond the dashboard at all (if not, kill maintenance + vendors)

Don't iterate before sending. Iterate based on actual prospect behavior.
