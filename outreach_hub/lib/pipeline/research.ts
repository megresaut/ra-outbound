import fs from "fs/promises";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import { db, schema } from "@/db/client";
import { eq } from "drizzle-orm";

const REPO_ROOT = path.resolve(process.cwd(), "..");

type ResearchOutput = {
  yearsOperating: number;
  employees: number;
  fundingStatus: string;
  techProfile: string;
  developerHeadcount: number;
  location: string;
  website: string;
  fitScore: number;
  signals: Array<{ source: string; quote: string }>;
};

type Input = {
  slug: string;
  company: string;
  industry: string;
  website: string;
  location: string;
};

let cachedIcp: string | null = null;
async function loadIcp(): Promise<string> {
  if (cachedIcp) return cachedIcp;
  cachedIcp = await fs.readFile(path.join(REPO_ROOT, "icp.md"), "utf8");
  return cachedIcp;
}

const SYSTEM_PROMPT_TEMPLATE = (icp: string) => `You research a US SMB as a prospect for Reasonable Automations cold outbound. Use the web_search tool aggressively — start with the company website + LinkedIn, then look for hiring posts (Indeed, LinkedIn jobs), Glassdoor/Indeed reviews, press coverage, and Crunchbase/SEC for funding.

## ICP (must satisfy or fitScore drops)
${icp}

## What to extract
- yearsOperating: int. From company website "since YYYY" or LinkedIn founded year.
- employees: int. From LinkedIn employee range (pick midpoint) or careers page.
- fundingStatus: string. "Bootstrapped — no funding records" / "Family-owned since YYYY" / "PE-owned (Firm name, YEAR)". If VC-backed, say so explicitly.
- techProfile: string. Real software names. E.g. "Buildium + Excel + Outlook · WordPress · no CRM" or "ServiceTitan + paper invoices · QuickBooks Online".
- developerHeadcount: int. Almost always 0 for SMBs; check LinkedIn for any engineering titles.
- location: city, state (refine if input is "—").
- website: clean domain (no protocol).
- signals: 2-4 workflow-pain quotes, EACH with source attribution. Look for:
  * Job postings naming manual workflows ("re-enter invoices", "track permits across portals", "pull statements from 4 utility providers")
  * Glassdoor/Indeed reviews complaining about specific manual processes
  * LinkedIn posts from founders about scaling pain or recent hires
  * Company blog posts that describe their ops cycle
  Format: { source: "Indeed posting · Apr 28", quote: "verbatim quote ≤200 chars" }
- fitScore: 0-100. Score based on ICP match:
  * 15-75 employees, US, non-VC, ops-heavy: 80-95
  * Edge of headcount band, or thin signals: 60-79
  * Wrong size, VC-backed, or low manual-work signals: 30-59
  * Strongly disqualified (VC, too small/large, no manual workflows visible): 0-29

## Voice
Concrete, factual, no hype words. Real product/company names. If you can't find a fact, say so in the field rather than inventing.

Return ONLY a JSON object matching the schema.`;

export async function runResearch(input: Input): Promise<ResearchOutput> {
  const client = new Anthropic();
  const icp = await loadIcp();

  const userContent = [
    `Company: ${input.company}`,
    `Industry (raw): ${input.industry}`,
    input.website ? `Website hint: ${input.website}` : null,
    input.location && input.location !== "—" ? `Location hint: ${input.location}` : null,
    "",
    "Research this company. Search the web for real signals. Return structured JSON only.",
  ]
    .filter((l) => l !== null)
    .join("\n");

  const response = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 8192,
    tools: [
      {
        type: "web_search_20260209",
        name: "web_search",
        max_uses: 6,
      },
    ],
    output_config: {
      effort: "medium",
      format: {
        type: "json_schema",
        schema: {
          type: "object",
          properties: {
            yearsOperating: { type: "integer" },
            employees: { type: "integer" },
            fundingStatus: { type: "string" },
            techProfile: { type: "string" },
            developerHeadcount: { type: "integer" },
            location: { type: "string" },
            website: { type: "string" },
            fitScore: { type: "integer" },
            signals: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  source: { type: "string" },
                  quote: { type: "string" },
                },
                required: ["source", "quote"],
                additionalProperties: false,
              },
            },
          },
          required: [
            "yearsOperating",
            "employees",
            "fundingStatus",
            "techProfile",
            "developerHeadcount",
            "location",
            "website",
            "fitScore",
            "signals",
          ],
          additionalProperties: false,
        },
      },
    },
    system: [
      { type: "text", text: SYSTEM_PROMPT_TEMPLATE(icp), cache_control: { type: "ephemeral" } },
    ],
    messages: [{ role: "user", content: userContent }],
  });

  const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
  if (!textBlock) throw new Error("Claude returned no text block during research");
  return JSON.parse(textBlock.text) as ResearchOutput;
}

export async function researchProspect(input: Input): Promise<ResearchOutput> {
  const out = await runResearch(input);

  // Persist core research fields.
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

  // Replace signals for idempotency on retry.
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

  // Update prospect-level fields the researcher refined.
  db.update(schema.prospects)
    .set({
      employees: out.employees || 0,
      location: out.location || "—",
      website: out.website ? out.website.replace(/^https?:\/\//, "") : "",
      fitScore: out.fitScore,
    })
    .where(eq(schema.prospects.slug, input.slug))
    .run();

  // Audit event.
  db.insert(schema.events)
    .values({
      prospectSlug: input.slug,
      ts: new Date().toISOString(),
      kind: "researched",
      note: `Autonomous research · ${out.signals.length} signals · fit ${out.fitScore}`,
    })
    .run();

  return out;
}
