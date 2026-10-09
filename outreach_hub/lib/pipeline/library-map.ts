// Library pattern → demo template mapping.
//
// Each library pattern from openclaw_pipeline/pain_library.md is either:
//   - BUILDABLE: we have a working template that renders the workflow truthfully
//   - NOT BUILDABLE: pattern is real but we don't have a demo (yet) — prospect
//     goes to novel_pain_review and we skip auto-demo + auto-send.
//
// Today, only two patterns are truly buildable. Everything else, including
// PM-applicable patterns like rent_collection or vendor_coordination, has
// no faithful renderer yet because the PM template's runner is hardcoded to
// multi-portal extraction (utility billing flavor). Once template variants
// land, expand this map.

export type LibraryPatternId =
  | "multi_portal_extraction"
  | "multi_source_dispatch"
  | "expiration_tracking"
  | "ap_ar_processing"
  | "medical_claims_processing"
  | "aia_billing_lien_waivers"
  | "accounting_client_close"
  | "novel"; // catch-all for pains research finds that aren't in the library

export type BuildableTarget = {
  template: "property_management" | "service_dispatch";
  pack: "hvac" | "plumbing" | "electrical" | null;
};

const BUILDABLE: Partial<Record<LibraryPatternId, BuildableTarget>> = {
  multi_portal_extraction: { template: "property_management", pack: null },
  // accounting_client_close maps to PM as a visual analog per the library —
  // same multi-portal-extraction architecture, different copy.
  accounting_client_close: { template: "property_management", pack: null },
  multi_source_dispatch: { template: "service_dispatch", pack: null }, // pack set per prospect
};

export const ALL_LIBRARY_PATTERN_IDS: LibraryPatternId[] = [
  "multi_portal_extraction",
  "multi_source_dispatch",
  "expiration_tracking",
  "ap_ar_processing",
  "medical_claims_processing",
  "aia_billing_lien_waivers",
  "accounting_client_close",
  "novel",
];

export function buildableTarget(
  patternId: string | null | undefined,
): BuildableTarget | null {
  if (!patternId) return null;
  return BUILDABLE[patternId as LibraryPatternId] ?? null;
}

export type TaggedPain = {
  title: string;
  pattern: string;
  evidence: string;
  libraryPatternId: string | null;
};

/**
 * Pick the strongest pain whose library pattern has a buildable demo for the
 * prospect's template. Pains are assumed to be ordered by strength (index 0
 * is strongest). The returned pain is hoisted to the front when passed into
 * the demo builder. Returns null when no pain matches a buildable pattern.
 */
export function pickBuildablePain(
  pains: TaggedPain[],
  template: "property_management" | "service_dispatch",
  pack: "hvac" | "plumbing" | "electrical" | null,
): { pain: TaggedPain; target: BuildableTarget } | null {
  for (const p of pains) {
    const target = buildableTarget(p.libraryPatternId);
    if (!target) continue;
    if (target.template !== template) continue;
    // service_dispatch pack is set per prospect — only enforce template match.
    return { pain: p, target: { template, pack } };
  }
  return null;
}
