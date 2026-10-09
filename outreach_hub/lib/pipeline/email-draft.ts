import fs from "fs/promises";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import { db, schema } from "@/db/client";
import { eq, desc } from "drizzle-orm";
import {
  industryDescriptorFor,
  renderEmail,
  workflowLibraryFor,
} from "./email-template";

type EmailOutput = { subject: string; body: string };

// Phase 2: email-draft no longer depends on research-deep / pain-mapping
// output. It pulls firm fields directly off the prospect row and reads
// outreach_hub/config/products.md for voice rules (read-only). Optional
// `pains` / `signals` are accepted for backward compatibility with any caller
// that still wants to thread them in — they are not required.
type Input = {
  slug: string;
  company: string;
  championName: string;
  championTitle: string;
  industry: string;
  template: "property_management" | "service_dispatch";
  location: string;
  pack: "hvac" | "plumbing" | "electrical" | null;
  demoUrl: string;
  // Optional — present only when a caller still has research-era data.
  pains?: Array<{
    title: string;
    pattern: string;
    evidence: string;
    libraryPatternId: string | null;
  }>;
  signals?: Array<{ source: string; quote: string }>;
  techProfile?: string;
};

type ClaudePick = { workflowExamples: string[] };

// products.md lives at outreach_hub/config/products.md and is the source of
// truth for voice rules + product catalog. Phase 2 reads it once per process
// to surface the REVIEW BANNER warning, and to make its absence loud.
const PRODUCTS_PATH = path.join(process.cwd(), "config", "products.md");
let cachedProducts: string | null = null;
let productsBannerWarned = false;
async function loadProducts(): Promise<string> {
  if (cachedProducts !== null) return cachedProducts;
  try {
    cachedProducts = await fs.readFile(PRODUCTS_PATH, "utf8");
  } catch (e) {
    console.warn(
      `[email-draft] products.md missing at ${PRODUCTS_PATH} — voice rules unenforceable: ${(e as Error).message}`,
    );
    cachedProducts = "";
  }
  if (cachedProducts.includes("REVIEW BANNER — UNSIGNED HUMAN-OWNED INPUT") && !productsBannerWarned) {
    console.warn(
      "[email-draft] products.md still contains its REVIEW BANNER — emails NOT send-ready until human signs off.",
    );
    productsBannerWarned = true;
  }
  return cachedProducts;
}

// Phase 2: derive libraryPatternId from the prospect's template instead of
// from pain-mapping output. property_management → multi_portal_extraction
// (matches the utility-billing fixed demo); service_dispatch →
// multi_source_dispatch (HVAC/plumbing/electrical analog).
function patternIdForTemplate(template: Input["template"]): string {
  return template === "service_dispatch"
    ? "multi_source_dispatch"
    : "multi_portal_extraction";
}

const SYSTEM_PROMPT_BASE = `You assist with cold-outbound emails for Reasonable Automations. The email body is hard-coded by Megha (the founder). Your ONLY job: pick THREE workflow examples that best fit this specific prospect.

## How to pick
- Choose from the approved workflow list provided. Do NOT invent new workflows.
- Pick the 3 that best match the research signals and pains for this prospect.
- The strongest matches go first.
- If only 1-2 obviously fit, still return 3 — pick the next most likely ones from the same list. Never return fewer than 3.

## Format
Return a JSON object with one key, "workflowExamples", an array of EXACTLY 3 strings, each copied verbatim from the approved list. No new strings, no edits, no embellishments.

\`\`\`
{ "workflowExamples": ["...", "...", "..."] }
\`\`\``;

async function askClaudeForWorkflows(
  input: Input,
  approvedList: string[],
): Promise<ClaudePick> {
  const client = new Anthropic();

  const userContent = [
    `Company: ${input.company}`,
    `Champion: ${input.championName}, ${input.championTitle}`,
    input.techProfile ? `Tech: ${input.techProfile}` : null,
    "",
    "Research signals:",
    ...(input.signals ?? []).map((s) => `- [${s.source}] "${s.quote}"`),
    "",
    "Pains (top first):",
    ...(input.pains ?? []).map((p) => `- ${p.title}: ${p.pattern}`),
    "",
    "Approved workflow list (pick 3, verbatim):",
    ...approvedList.map((w) => `- ${w}`),
    "",
    "Return JSON only.",
  ]
    .filter((l): l is string => l !== null)
    .join("\n");

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    system: [{ type: "text", text: SYSTEM_PROMPT_BASE, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: userContent }],
  });

  const textBlocks = response.content.filter(
    (b): b is Anthropic.TextBlock => b.type === "text",
  );
  if (textBlocks.length === 0) {
    throw new Error(`Email pick returned no text (stop=${response.stop_reason})`);
  }
  const finalText = textBlocks[textBlocks.length - 1].text;
  const jsonMatch = finalText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error(`[email-draft:${input.slug}] non-JSON output:`, finalText.slice(0, 500));
    throw new Error("Workflow pick contained no JSON object");
  }
  return JSON.parse(jsonMatch[0]) as ClaudePick;
}

export async function draftEmail(input: Input): Promise<EmailOutput> {
  // Read products.md for voice-rule awareness (logs a banner warning when
  // unsigned). The body template is already platform-name-free, satisfying
  // the products.md `cold_open_angle` rule "never name a specific PM platform".
  await loadProducts();

  // Drive libraryPatternId from template — no longer pain-derived.
  const libraryPatternId = patternIdForTemplate(input.template);
  const approvedList = workflowLibraryFor(libraryPatternId);

  // Phase 2: when no research signals/pains are threaded in (the default
  // post-restructure), pick the top 3 workflows deterministically from the
  // approved list. Skip the Claude pick entirely — there is no per-prospect
  // signal to weight against.
  const hasSignals = (input.signals?.length ?? 0) > 0;
  const hasPains = (input.pains?.length ?? 0) > 0;

  let workflows: string[];
  if (approvedList.length === 0) {
    // Fallback: pain titles if present, otherwise generic stubs.
    workflows = hasPains
      ? input.pains!.slice(0, 3).map((p) => p.title)
      : ["operations", "vendor coordination", "owner reporting"];
    console.warn(
      `[email-draft:${input.slug}] no approved workflow list for pattern=${libraryPatternId}; using fallback`,
    );
  } else if (!hasSignals && !hasPains) {
    // Deterministic pick — first 3 workflows from approved list.
    workflows = approvedList.slice(0, 3);
  } else {
    // Caller still has research-era context — let Claude weight against it.
    const pick = await askClaudeForWorkflows(input, approvedList);
    const lookup = new Map(approvedList.map((w) => [w.toLowerCase(), w]));
    const cleaned: string[] = [];
    for (const w of pick.workflowExamples ?? []) {
      const exact = lookup.get(String(w).toLowerCase().trim());
      if (exact && !cleaned.includes(exact)) cleaned.push(exact);
    }
    for (const w of approvedList) {
      if (cleaned.length >= 3) break;
      if (!cleaned.includes(w)) cleaned.push(w);
    }
    workflows = cleaned.slice(0, 3);
  }

  // Phase 2: products.md rule #1 forbids naming a specific PM platform, so
  // detectedSoftware is intentionally not derived from a tech profile here.
  const detectedSoftware = "";

  const firstName = (input.championName || "").trim().split(/\s+/)[0] || "there";

  const { subject, body } = renderEmail({
    slug: input.slug,
    firstName,
    championName: input.championName,
    company: input.company,
    location: input.location,
    techProfile: input.techProfile ?? "",
    detectedSoftware,
    industryDescriptor: industryDescriptorFor(libraryPatternId),
    workflowExamples: workflows.join(", "),
    signalQuote: input.signals?.[0]?.quote ?? "",
    signalSource: input.signals?.[0]?.source ?? "",
    painTitle: input.pains?.[0]?.title ?? "",
    painPattern: input.pains?.[0]?.pattern ?? "",
  });

  console.log(
    `[email-draft:${input.slug}] pattern=${libraryPatternId} workflows=[${workflows.join(", ")}] subject="${subject}"`,
  );

  return { subject: subject.trim(), body };
}

export async function draftEmailForProspect(input: Input): Promise<EmailOutput> {
  const out = await draftEmail(input);

  const latest = db
    .select({ version: schema.emailDrafts.version })
    .from(schema.emailDrafts)
    .where(eq(schema.emailDrafts.prospectSlug, input.slug))
    .orderBy(desc(schema.emailDrafts.version))
    .get();
  const nextVersion = (latest?.version ?? 0) + 1;

  db.insert(schema.emailDrafts)
    .values({
      prospectSlug: input.slug,
      version: nextVersion,
      subject: out.subject,
      body: out.body,
      createdAt: new Date().toISOString(),
    })
    .run();

  db.update(schema.prospects)
    .set({
      currentStage: "email_drafted",
      lastTouch: new Date().toISOString().slice(0, 10),
    })
    .where(eq(schema.prospects.slug, input.slug))
    .run();

  db.insert(schema.events)
    .values({
      prospectSlug: input.slug,
      ts: new Date().toISOString(),
      kind: "email_drafted",
      note: `Template draft v${nextVersion}`,
    })
    .run();

  return out;
}
