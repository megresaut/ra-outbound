import fs from "fs/promises";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import { db, schema } from "@/db/client";
import { eq } from "drizzle-orm";
import { ALL_LIBRARY_PATTERN_IDS } from "./library-map";

const REPO_ROOT = path.resolve(process.cwd(), "..");

type DeepResearchOutput = {
  yearsOperating: number;
  employees: number;
  fundingStatus: string;
  techProfile: string;
  developerHeadcount: number;
  location: string;
  website: string;
  fitScore: number;
  signals: Array<{ source: string; quote: string }>;
  pains: Array<{
    title: string;
    pattern: string;
    evidence: string;
    libraryPatternId: string;
  }>;
};

type Input = {
  slug: string;
  company: string;
  industry: string;
  website: string;
  location: string;
  // Apollo CSV hints — treat as leads to verify, not facts.
  championName?: string;
  championTitle?: string;
  championLinkedinUrl?: string | null;
  companyLinkedinUrl?: string | null;
  technologies?: string | null;
  apolloEmployees?: number;
  annualRevenue?: string | null;
};

let cachedIcp: string | null = null;
let cachedLibrary: string | null = null;

async function loadIcp(): Promise<string> {
  if (cachedIcp) return cachedIcp;
  cachedIcp = await fs.readFile(path.join(REPO_ROOT, "icp.md"), "utf8");
  return cachedIcp;
}

async function loadPainLibrary(): Promise<string> {
  if (cachedLibrary) return cachedLibrary;
  cachedLibrary = await fs.readFile(
    path.join(REPO_ROOT, "openclaw_pipeline", "pain_library.md"),
    "utf8",
  );
  return cachedLibrary;
}

const SYSTEM_PROMPT = (icp: string, library: string) => `You are a research agent for Reasonable Automations (RA). You investigate one US SMB prospect at a time using web search and web fetch, then produce structured findings.

# Your goal
Find SPECIFIC, prospect-unique workflow pains backed by verbatim evidence. Avoid generic / template pains. Each prospect should feel observed, not pattern-matched.

# Research playbook (be thorough)
1. Start with the company's own website — About, Services, Blog, News, Careers pages. Fetch the actual pages, not just search snippets.
2. Pull at least one Indeed or LinkedIn job posting that names internal duties. Job posts are the single best source of workflow pain.
3. Look at Glassdoor / Indeed reviews for complaints about specific manual processes.
4. Check LinkedIn company page for employee count and any recent posts from founders/COOs.
5. Search for press, Crunchbase, or SEC filings to confirm funding status.
6. If you find a job posting URL, FETCH the full page — the body text usually contains more workflow detail than the snippet.
7. Iterate: when you find a thin signal, search again for confirmation. Don't accept the first weak match.

# What makes a strong signal vs a weak one
STRONG: Specific software named ("ServiceTitan", "Buildium"), specific portal/provider named ("PGE", "NW Natural", "Travelers"), specific frequency stated ("monthly", "every renewal"), a quoted phrase from a real source.
WEAK: Generic phrases like "data entry", "manual processes", "spreadsheets" without concrete context.

If after 6+ searches you only have weak signals, lower fitScore — the prospect may not be a good fit, or may be too small/quiet to research.

# What to extract
- yearsOperating: int. From "since YYYY" / LinkedIn founded.
- employees: int. From LinkedIn band midpoint or careers/About count.
- fundingStatus: string. "Bootstrapped — no funding records" / "Family-owned since YYYY" / "PE-owned (Firm, YEAR)". If VC-backed, say so.
- techProfile: string with REAL product names. E.g. "AppFolio + Slack · Excel for owner reporting".
- developerHeadcount: int. Almost always 0 for SMBs; check LinkedIn.
- location: City, ST.
- website: clean domain.
- fitScore: 0-100. See ICP. 15-75 employees, US, non-VC, ops-heavy with concrete signals = 80-95. Edge cases or thin = 60-79. Disqualified = <60.
- signals: 3-6 verbatim quotes, each with source attribution like "Indeed posting · Apr 28". Quote should be ≤200 chars and grounded in something you fetched, not paraphrased.
- pains: 2-4 SPECIFIC pains. Each must reference a real signal. Each pain object has:
  * title: short (3-7 words) in prospect's voice
  * pattern: one sentence describing the actual workflow shape — name the real tools/portals/cadence
  * evidence: cite the source (which signal it came from)
  * libraryPatternId: tag with ONE of the library pattern IDs (see list below). Use "novel" if the pain is real and evidence-backed but doesn't fit any library pattern — DO NOT force-fit.

  Valid libraryPatternId values: ${ALL_LIBRARY_PATTERN_IDS.join(", ")}.

  Pattern matching rules (these are loose — go by workflow shape, not vertical):
  * multi_portal_extraction → recurring login to N external portals to download/parse/post docs (utility billing, COIs, carrier portals, bank statements, etc.)
  * multi_source_dispatch → triage/dispatch of incoming work across phone/email/SMS/portal channels with manual rotation or board (HVAC/plumbing/electrical/IT service)
  * expiration_tracking → tracking renewal/expiration dates across N items (contracts, certificates, permits, warranties)
  * ap_ar_processing → re-keying invoices/payments between systems
  * medical_claims_processing → clinical claim submission/EOB processing
  * aia_billing_lien_waivers → construction progress billing + waiver collection
  * accounting_client_close → accounting firm monthly close, pulling client docs from N institutions
  * novel → real evidence-backed pain that fits none of the above. Use freely when warranted.

# Pain library (INSPIRATION ONLY — not a constraint)
The library below lists workflows RA has solved or can credibly solve. You may use it as a sanity check ("would RA actually be able to automate this?") and as a vocabulary source for naming patterns. But DO NOT force-fit the prospect into a library pattern if the evidence points somewhere new. Novel, well-grounded pains are MORE valuable than library-matched generic ones. If a real pain emerges that isn't in the library, surface it — that's a signal we should expand the library.

${library}

# RA's ICP (use to inform fitScore)
${icp}

# Voice
Concrete, factual. Real product/company names everywhere. No hype words ("streamline", "leverage", "transform", "empower"). If you don't find a fact, say so in the field rather than inventing one.

# Output
After you've done your searches and have enough evidence, emit a single JSON object as your FINAL text — no prose before or after, no markdown fences. Schema:

\`\`\`
{
  "yearsOperating": integer,
  "employees": integer,
  "fundingStatus": string,
  "techProfile": string,
  "developerHeadcount": integer,
  "location": string,
  "website": string,
  "fitScore": integer,            // 0-100
  "signals": [ { "source": string, "quote": string }, ... ],   // 3-6 entries
  "pains": [ { "title": string, "pattern": string, "evidence": string, "libraryPatternId": string }, ... ]  // 2-4 entries
}
\`\`\`

Even if signals are weak, return at least 1 signal and 1 pain with libraryPatternId="novel". Returning empty arrays is never correct — if the prospect is genuinely un-researchable, drop fitScore to <30 and still emit one signal explaining why (e.g. {"source": "No web presence", "quote": "Company website returns 404; no Indeed/LinkedIn presence found"}) plus one novel pain noting the same.`;

export async function runDeepResearch(input: Input): Promise<DeepResearchOutput> {
  const client = new Anthropic();
  const [icp, library] = await Promise.all([loadIcp(), loadPainLibrary()]);

  const apolloHints = [
    input.championName && input.championName !== "—"
      ? `Champion: ${input.championName}${input.championTitle && input.championTitle !== "—" ? `, ${input.championTitle}` : ""}`
      : null,
    input.championLinkedinUrl ? `Champion LinkedIn: ${input.championLinkedinUrl}` : null,
    input.companyLinkedinUrl ? `Company LinkedIn: ${input.companyLinkedinUrl}` : null,
    input.technologies ? `Apollo tech stack guess (verify, don't trust blindly): ${input.technologies}` : null,
    input.apolloEmployees && input.apolloEmployees > 0
      ? `Apollo employee count (verify against LinkedIn): ${input.apolloEmployees}`
      : null,
    input.annualRevenue ? `Apollo annual revenue estimate: ${input.annualRevenue}` : null,
  ].filter((l) => l !== null);

  const userContent = [
    `Company: ${input.company}`,
    `Industry (raw): ${input.industry}`,
    input.website ? `Website hint: ${input.website}` : null,
    input.location && input.location !== "—" ? `Location hint: ${input.location}` : null,
    apolloHints.length > 0 ? "" : null,
    apolloHints.length > 0 ? "Apollo CSV hints (starting points — fetch the LinkedIn URLs first if present, then verify the rest):" : null,
    ...apolloHints,
    "",
    "Research this company deeply. Use web_search and web_fetch aggressively. Iterate when signals are thin. Produce specific, evidence-backed pains. Return JSON only.",
  ]
    .filter((l) => l !== null)
    .join("\n");

  const response = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 16000,
    tools: [
      { type: "web_search_20260209", name: "web_search", max_uses: 8 },
      { type: "web_fetch_20260309", name: "web_fetch", max_uses: 5, max_content_tokens: 20000 },
    ],
    system: [
      { type: "text", text: SYSTEM_PROMPT(icp, library), cache_control: { type: "ephemeral" } },
    ],
    messages: [{ role: "user", content: userContent }],
  });

  // Diagnostic logging — server tools loop produces multiple content blocks.
  const blockTypes = response.content.map((b) => b.type);
  const searches = response.content.filter((b) => b.type === "server_tool_use" && (b as { name?: string }).name === "web_search").length;
  const fetches = response.content.filter((b) => b.type === "server_tool_use" && (b as { name?: string }).name === "web_fetch").length;
  console.log(
    `[research-deep:${input.slug}] stop=${response.stop_reason} blocks=[${blockTypes.join(",")}] searches=${searches} fetches=${fetches} usage=${JSON.stringify(response.usage)}`,
  );

  // Find the LAST text block — earlier text blocks may be preambles or
  // chain-of-thought emitted between tool uses.
  const textBlocks = response.content.filter(
    (b): b is Anthropic.TextBlock => b.type === "text",
  );
  if (textBlocks.length === 0) {
    throw new Error(
      `Deep research returned no text block (stop=${response.stop_reason}, blocks=[${blockTypes.join(",")}])`,
    );
  }
  const finalText = textBlocks[textBlocks.length - 1].text;

  // Extract JSON — Claude may wrap in ```json fences or add a preamble.
  const jsonMatch = finalText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error(`[research-deep:${input.slug}] non-JSON output:`, finalText.slice(0, 1000));
    throw new Error("Deep research final text contained no JSON object");
  }
  try {
    return JSON.parse(jsonMatch[0]) as DeepResearchOutput;
  } catch (e) {
    console.error(`[research-deep:${input.slug}] JSON parse failed:`, jsonMatch[0].slice(0, 1000));
    throw new Error(`Deep research JSON parse failed: ${(e as Error).message}`);
  }
}

export async function researchProspectDeep(input: Input): Promise<DeepResearchOutput> {
  const out = await runDeepResearch(input);

  // Normalize libraryPatternId — accept anything in the enum, coerce unknowns to "novel".
  const validIds = new Set(ALL_LIBRARY_PATTERN_IDS);
  out.pains = (out.pains ?? []).map((p) => ({
    ...p,
    libraryPatternId: validIds.has(p.libraryPatternId as (typeof ALL_LIBRARY_PATTERN_IDS)[number])
      ? p.libraryPatternId
      : "novel",
  }));
  out.signals = out.signals ?? [];

  if (out.signals.length === 0) {
    throw new Error(
      "Deep research returned zero signals — model likely skipped tool-use loop. Check terminal logs for [research-deep] line.",
    );
  }
  if (out.pains.length === 0) {
    throw new Error(
      "Deep research returned zero pains — prospect likely off-ICP or model skipped tool-use loop.",
    );
  }

  // Persist research core.
  db.insert(schema.research)
    .values({
      prospectSlug: input.slug,
      fundingStatus: out.fundingStatus,
      yearsOperating: out.yearsOperating,
      techProfile: out.techProfile,
      developerHeadcount: out.developerHeadcount,
    })
    .onConflictDoUpdate({
      target: schema.research.prospectSlug,
      set: {
        fundingStatus: out.fundingStatus,
        yearsOperating: out.yearsOperating,
        techProfile: out.techProfile,
        developerHeadcount: out.developerHeadcount,
      },
    })
    .run();

  // Replace signals (idempotent retry).
  db.delete(schema.researchSignals)
    .where(eq(schema.researchSignals.prospectSlug, input.slug))
    .run();
  out.signals.forEach((s, i) => {
    db.insert(schema.researchSignals)
      .values({
        prospectSlug: input.slug,
        source: s.source,
        quote: s.quote,
        ord: i,
      })
      .run();
  });

  // Replace pains (idempotent retry).
  db.delete(schema.pains).where(eq(schema.pains.prospectSlug, input.slug)).run();
  out.pains.forEach((p, i) => {
    db.insert(schema.pains)
      .values({
        prospectSlug: input.slug,
        title: p.title,
        pattern: p.pattern,
        evidence: p.evidence,
        ord: i,
        libraryPatternId: p.libraryPatternId,
      })
      .run();
  });

  // Update prospect-level fields. Preserve Apollo employee count if research returned 0.
  db.update(schema.prospects)
    .set({
      employees: out.employees || input.apolloEmployees || 0,
      location: out.location || "—",
      website: out.website ? out.website.replace(/^https?:\/\//, "") : "",
      fitScore: out.fitScore,
      currentStage: "pain_mapped",
    })
    .where(eq(schema.prospects.slug, input.slug))
    .run();

  // Audit events for both stages.
  const ts = new Date().toISOString();
  db.insert(schema.events)
    .values({
      prospectSlug: input.slug,
      ts,
      kind: "researched",
      note: `Deep research · ${out.signals.length} signals · fit ${out.fitScore}`,
    })
    .run();
  db.insert(schema.events)
    .values({
      prospectSlug: input.slug,
      ts,
      kind: "pain_mapped",
      note: `${out.pains.length} pain${out.pains.length === 1 ? "" : "s"} (evidence-grounded)`,
    })
    .run();

  return out;
}
