/**
 * Email template.
 *
 * Single body for all prospects. Claude's only job is to pick which 3
 * workflow examples to drop into {{workflowExamples}} based on the
 * prospect's research signals and the approved workflow list for their
 * industry. Subject rotates across 3 variants (deterministic per slug so
 * regenerating the same prospect gives the same subject).
 *
 * ───────────────────────────────────────────────────────────────────────────
 *
 * AVAILABLE PLACEHOLDERS:
 *
 *   {{firstName}}            Champion's first name
 *   {{company}}              Company name
 *   {{industryDescriptor}}   "property management firms" / "accounting firms"
 *                            / "service company offices" — derived from the
 *                            matched library pattern
 *   {{workflowExamples}}     Three comma-joined workflow names, Claude-picked
 *                            from the approved list for this industry, e.g.
 *                            "utility billing, vendor outreach, maintenance
 *                            ticketing"
 *   {{demoUrl}}              Demo URL (stays as {{demo_url}} in stored draft;
 *                            substituted at send time)
 *
 *   Also available but unused in the current body — leave them in the render
 *   layer so future templates can pick them up:
 *     {{championName}} {{location}} {{techProfile}} {{detectedSoftware}}
 *     {{signalQuote}} {{signalSource}} {{painTitle}} {{painPattern}}
 */

import type { LibraryPatternId } from "./library-map";

// ─── Subject rotation ──────────────────────────────────────────────────────
// Three subjects; picked deterministically per prospect (hash of slug) so
// re-running the same prospect always gives the same subject. Spreads
// across a batch to reduce same-subject bulk-detection risk.

export const SUBJECT_VARIANTS: string[] = [
  "Something we built for {{company}}",
  "Built a quick demo for {{company}}",
  "Quick demo for {{company}}",
];

// ─── Industry descriptor by library pattern ────────────────────────────────
// Used in the body as: "...take up hundreds of hours a month at
// {{industryDescriptor}}: ..."

export const INDUSTRY_DESCRIPTOR_BY_PATTERN: Partial<Record<LibraryPatternId, string>> = {
  multi_portal_extraction: "property management firms",
  accounting_client_close: "accounting firms",
  multi_source_dispatch: "service company offices",
};

export function industryDescriptorFor(libraryPatternId: string | null | undefined): string {
  if (!libraryPatternId) return "operations-heavy businesses";
  return (
    INDUSTRY_DESCRIPTOR_BY_PATTERN[libraryPatternId as LibraryPatternId] ??
    "operations-heavy businesses"
  );
}

// ─── Approved workflow examples per library pattern ────────────────────────
// Claude picks 3 from the relevant list based on the prospect's signals
// and pains. Order roughly reflects how common / impactful the workflow is
// for that pattern — but Claude is told to prefer evidence-grounded matches.

export const WORKFLOW_LIBRARY: Partial<Record<LibraryPatternId, string[]>> = {
  multi_portal_extraction: [
    "utility billing",
    "vendor outreach",
    "maintenance ticketing",
    "owner statement assembly",
    "turnover coordination",
    "lease renewal tracking",
    "rent collection follow-up",
    "AP processing",
    "vendor onboarding",
    "tenant communication",
  ],
  accounting_client_close: [
    "client document collection",
    "bank statement pulling",
    "payroll export reconciliation",
    "monthly close",
    "engagement onboarding",
    "expense categorization",
    "1099 preparation",
    "client status reporting",
  ],
  multi_source_dispatch: [
    "dispatch routing",
    "on-call rotation tracking",
    "after-hours intake",
    "parts ordering",
    "invoice entry",
    "work order intake",
    "warranty registration",
    "permit tracking",
    "maintenance contract renewals",
    "tech timesheet reconciliation",
  ],
};

export function workflowLibraryFor(libraryPatternId: string | null | undefined): string[] {
  if (!libraryPatternId) return [];
  return WORKFLOW_LIBRARY[libraryPatternId as LibraryPatternId] ?? [];
}

// ─── Known software for personalization ────────────────────────────────────
// Detected from research's techProfile — still used in render input even
// though the current template doesn't reference it.

const KNOWN_SOFTWARE_BY_TEMPLATE: Record<string, string[]> = {
  property_management: [
    "Buildium",
    "AppFolio",
    "Yardi",
    "ResMan",
    "Rent Manager",
    "Propertyware",
    "RealPage",
    "Entrata",
    "DoorLoop",
    "TenantCloud",
  ],
  service_dispatch: [
    "ServiceTitan",
    "Housecall Pro",
    "FieldEdge",
    "Jobber",
    "ServiceFusion",
    "Service Fusion",
    "Workiz",
    "mHelpDesk",
    "Smart Service",
  ],
  accounting: [
    "QuickBooks Online",
    "QuickBooks",
    "Xero",
    "Karbon",
    "Sage Intacct",
    "NetSuite",
  ],
};

export function detectKnownSoftware(
  techProfile: string,
  template: "property_management" | "service_dispatch",
  libraryPatternId: string | null,
): string {
  if (!techProfile) return "";
  const list =
    libraryPatternId === "accounting_client_close"
      ? KNOWN_SOFTWARE_BY_TEMPLATE.accounting
      : KNOWN_SOFTWARE_BY_TEMPLATE[template] ?? [];
  for (const name of list) {
    const re = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (re.test(techProfile)) return name;
  }
  return "";
}

// ─── The template body ─────────────────────────────────────────────────────
// One body for all prospects. Edit freely.

export const EMAIL_BODY = `Hi {{firstName}},

We built {{company}} a working demo of some workflows we know take up hundreds of hours a month at {{industryDescriptor}}: {{workflowExamples}} to name a few. {{demoUrl}}

Everything we build is custom to the firm, so if your bottleneck is somewhere else entirely, that's the more interesting conversation. Let me know what's actually eating time over there.

Best,
Megha`;

// ─── Engine ────────────────────────────────────────────────────────────────
// You don't usually need to edit below this line.

export type RenderInput = {
  slug: string;                  // used for deterministic subject rotation
  firstName: string;
  championName: string;
  company: string;
  location: string;
  techProfile: string;
  detectedSoftware: string;
  industryDescriptor: string;
  workflowExamples: string;      // pre-joined comma string
  signalQuote: string;
  signalSource: string;
  painTitle: string;
  painPattern: string;
};

// FNV-1a 32-bit — small, deterministic, no deps.
function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function pickSubjectVariant(slug: string): string {
  const idx = hashString(slug) % SUBJECT_VARIANTS.length;
  return SUBJECT_VARIANTS[idx];
}

export function renderEmail(input: RenderInput): { subject: string; body: string } {
  const subjectTemplate = pickSubjectVariant(input.slug);
  return {
    subject: substitute(subjectTemplate, input),
    body: substitute(EMAIL_BODY, input),
  };
}

function substitute(s: string, input: RenderInput): string {
  return s
    .replace(/\{\{firstName\}\}/g, input.firstName)
    .replace(/\{\{championName\}\}/g, input.championName)
    .replace(/\{\{company\}\}/g, input.company)
    .replace(/\{\{location\}\}/g, input.location)
    .replace(/\{\{techProfile\}\}/g, input.techProfile)
    .replace(/\{\{detectedSoftware\}\}/g, input.detectedSoftware)
    .replace(/\{\{industryDescriptor\}\}/g, input.industryDescriptor)
    .replace(/\{\{workflowExamples\}\}/g, input.workflowExamples)
    .replace(/\{\{signalQuote\}\}/g, input.signalQuote)
    .replace(/\{\{signalSource\}\}/g, input.signalSource)
    .replace(/\{\{painTitle\}\}/g, input.painTitle)
    .replace(/\{\{painPattern\}\}/g, input.painPattern)
    .replace(/\{\{demoUrl\}\}/g, "{{demo_url}}");
}
