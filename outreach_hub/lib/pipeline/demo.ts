import fs from "fs/promises";
import { spawn } from "child_process";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import { db, schema } from "@/db/client";
import { eq } from "drizzle-orm";

const REPO_ROOT = path.resolve(process.cwd(), "..");
const DEMOS_DIR = path.join(REPO_ROOT, "demos");

const COPY_SKIP = new Set([
  "node_modules",
  ".next",
  ".vercel",
  "tsconfig.tsbuildinfo",
  ".DS_Store",
]);

async function copyTemplate(src: string, dest: string) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    if (COPY_SKIP.has(entry.name)) continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyTemplate(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

// ─── Property Management config ──────────────────────────────────────────────

type PmDetails = {
  units: number;
  properties: number;
  monthlyHoursBefore: number;
  utilities: string[];
  propertyManagementSystem: string;
  quotedPainPoint: string;
  suggestedColor: string;
  painNarrative: string;
  howItWorks: string[];
  statementsPerMonth: number;
  hoursAfter: number;
  manualEquivalentHours: number;
  runnerConnectDetail: string;
  runnerPostLabel: string;
  runnerPostDetail: string;
};

const PM_SYSTEM_PROMPT = `You convert prospect research into a structured demo configuration for a US property management firm. Output renders into a working Next.js demo a COO will open.

INPUT: company name, website, location, research signals (real workflow pains found on the web), and matched pain patterns.

GROUNDING: Every field must be specific to this prospect. Lift facts from research when present. If thin, ground in plausible defaults appropriate to firmographics — never contradict research, never invent specifics.

VOICE — critical:
Concrete, specific, plain English. Banned words: "leverage", "streamline", "synergy", "transform", "empower", "unlock", "robust", "seamless", "powerful". Use real product/company names (Buildium, AppFolio, PGE, NW Natural, Austin Energy).

FIELD GUIDANCE:
- units: lift from research; else infer from employees (~30 units/employee); else 400.
- properties: round(units / 15).
- monthlyHoursBefore: round(units * 0.25), clamped [40, 400].
- utilities: real providers in their city/state. Real names only.
- propertyManagementSystem: lift from research; else Buildium for small/mid, AppFolio for >40 units/employee.
- quotedPainPoint: one short phrase (<80 chars).
- suggestedColor: tasteful hex — navy, deep green, slate, burgundy.
- painNarrative: 2-3 sentences naming PMS, providers, painful step.
- howItWorks: exactly 3 paragraphs (2-4 sentences each).
- statementsPerMonth: round(units * 0.4).
- hoursAfter: 3.
- manualEquivalentHours: roughly monthlyHoursBefore / 12, clamped [3, 10].
- runnerConnectDetail: "N providers · Real, Names, Here".
- runnerPostLabel: "Posting to <PMS>".
- runnerPostDetail: 1-line, mentions their PMS.`;

async function extractPmDetails(input: {
  company: string;
  website: string;
  location: string;
  signals: Array<{ source: string; quote: string }>;
  pains: Array<{ title: string; pattern: string; evidence: string }>;
  techProfile: string;
  employees: number;
}): Promise<PmDetails> {
  const client = new Anthropic();
  const userContent = [
    `Company: ${input.company}`,
    `Website: ${input.website}`,
    `Location: ${input.location}`,
    `Employees: ${input.employees}`,
    `Tech profile: ${input.techProfile}`,
    "",
    "Research signals:",
    ...input.signals.map((s) => `- [${s.source}] "${s.quote}"`),
    "",
    "Matched pains:",
    ...input.pains.map((p) => `- ${p.title}: ${p.pattern} (evidence: ${p.evidence})`),
  ].join("\n");

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8192,
    output_config: {
      effort: "medium",
      format: {
        type: "json_schema",
        schema: {
          type: "object",
          properties: {
            units: { type: "integer" },
            properties: { type: "integer" },
            monthlyHoursBefore: { type: "integer" },
            utilities: { type: "array", items: { type: "string" } },
            propertyManagementSystem: { type: "string" },
            quotedPainPoint: { type: "string" },
            suggestedColor: { type: "string" },
            painNarrative: { type: "string" },
            howItWorks: { type: "array", items: { type: "string" } },
            statementsPerMonth: { type: "integer" },
            hoursAfter: { type: "integer" },
            manualEquivalentHours: { type: "number" },
            runnerConnectDetail: { type: "string" },
            runnerPostLabel: { type: "string" },
            runnerPostDetail: { type: "string" },
          },
          required: [
            "units",
            "properties",
            "monthlyHoursBefore",
            "utilities",
            "propertyManagementSystem",
            "quotedPainPoint",
            "suggestedColor",
            "painNarrative",
            "howItWorks",
            "statementsPerMonth",
            "hoursAfter",
            "manualEquivalentHours",
            "runnerConnectDetail",
            "runnerPostLabel",
            "runnerPostDetail",
          ],
          additionalProperties: false,
        },
      },
    },
    system: [{ type: "text", text: PM_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: userContent }],
  });
  const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
  if (!textBlock) throw new Error("No PM details from Claude");
  return JSON.parse(textBlock.text) as PmDetails;
}

function pmConfigSource(companyName: string, config: object): string {
  return `/**
 * Personalized demo config for ${companyName}.
 */

export type WorkflowKey = "utility_billing" | "maintenance" | "vendors" | "ap_processing";
export type RunnerStageKey = "connect" | "scrape" | "parse" | "match" | "post";
export interface RunnerStageLabel { label?: string; detail?: string; }
export interface DemoConfig {
  company: { name: string; logo: string | null; primaryColor: string; location: string; };
  workflow: { primary: WorkflowKey; enabled: WorkflowKey[]; runnerLabels?: Partial<Record<RunnerStageKey, RunnerStageLabel>>; };
  scale: { units: number; properties: number; monthlyHoursBefore: number; };
  details: {
    utilities?: string[];
    propertyManagementSystem?: string;
    quotedPainPoint?: string;
    painNarrative?: string;
    howItWorks?: string[];
    mathBreakdown?: { statementsPerMonth?: number; hoursAfter?: number; manualEquivalentHours?: number; };
  };
}

export const demoConfig: DemoConfig = ${JSON.stringify(config, null, 2)};
`;
}

// ─── Service Dispatch config ─────────────────────────────────────────────────

type DispatchDetails = {
  workers: number;
  weeklyTickets: number;
  weeklyDispatchHoursBefore: number;
  fieldServiceSystem: string;
  phoneSystem: string;
  quotedPainPoint: string;
  suggestedColor: string;
  serviceArea: string;
};

const DISPATCH_SYSTEM_PROMPT = `You convert prospect research into a structured demo configuration for a US HVAC / plumbing / electrical service company. Output renders into a working Next.js dispatch-board demo a Service Manager will open.

GROUNDING: Every field must be specific. Lift from research. If thin, infer from employees + vertical.

VOICE: Concrete, plain English. Real product names (ServiceTitan, Housecall Pro, FieldEdge, Jobber, RingCentral). Banned hype words.

FIELD GUIDANCE:
- workers: number of field techs. ~70% of employees.
- weeklyTickets: workers * ~12.
- weeklyDispatchHoursBefore: workers * ~1.6, clamped [10, 60].
- fieldServiceSystem: lift from research; else ServiceTitan (HVAC mid+), Housecall Pro (smaller plumbing), Jobber, FieldEdge.
- phoneSystem: RingCentral / OpenPhone / Aircall / Vonage. If not in research, RingCentral.
- quotedPainPoint: short phrase (<80 chars).
- suggestedColor: vertical-tasteful hex — HVAC dark red/navy, plumbing deep blue, electrical amber/charcoal.
- serviceArea: city + region they cover.`;

async function extractDispatchDetails(input: {
  company: string;
  website: string;
  location: string;
  signals: Array<{ source: string; quote: string }>;
  pains: Array<{ title: string; pattern: string; evidence: string }>;
  techProfile: string;
  employees: number;
  pack: "hvac" | "plumbing" | "electrical";
}): Promise<DispatchDetails> {
  const client = new Anthropic();
  const userContent = [
    `Company: ${input.company}`,
    `Website: ${input.website}`,
    `Location: ${input.location}`,
    `Employees: ${input.employees}`,
    `Vertical: ${input.pack}`,
    `Tech profile: ${input.techProfile}`,
    "",
    "Research signals:",
    ...input.signals.map((s) => `- [${s.source}] "${s.quote}"`),
    "",
    "Matched pains:",
    ...input.pains.map((p) => `- ${p.title}: ${p.pattern} (${p.evidence})`),
  ].join("\n");

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    output_config: {
      effort: "medium",
      format: {
        type: "json_schema",
        schema: {
          type: "object",
          properties: {
            workers: { type: "integer" },
            weeklyTickets: { type: "integer" },
            weeklyDispatchHoursBefore: { type: "integer" },
            fieldServiceSystem: { type: "string" },
            phoneSystem: { type: "string" },
            quotedPainPoint: { type: "string" },
            suggestedColor: { type: "string" },
            serviceArea: { type: "string" },
          },
          required: [
            "workers",
            "weeklyTickets",
            "weeklyDispatchHoursBefore",
            "fieldServiceSystem",
            "phoneSystem",
            "quotedPainPoint",
            "suggestedColor",
            "serviceArea",
          ],
          additionalProperties: false,
        },
      },
    },
    system: [{ type: "text", text: DISPATCH_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: userContent }],
  });
  const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
  if (!textBlock) throw new Error("No dispatch details from Claude");
  return JSON.parse(textBlock.text) as DispatchDetails;
}

function dispatchConfigSource(companyName: string, config: object): string {
  return `/**
 * Personalized demo config for ${companyName}.
 */

import type { VerticalKey } from "./verticals";

export interface DemoConfig {
  vertical: VerticalKey;
  company: { name: string; logo: string | null; primaryColor: string; location: string; };
  scale: { workers: number; weeklyTickets: number; weeklyDispatchHoursBefore: number; };
  details: { fieldServiceSystem?: string; phoneSystem?: string; quotedPainPoint?: string; serviceArea?: string; };
}

export const demoConfig: DemoConfig = ${JSON.stringify(config, null, 2)};
`;
}

// ─── Vercel deploy ───────────────────────────────────────────────────────────

function vercelDeploy(cwd: string, projectName: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "npx",
      ["--yes", "vercel", "--prod", "--yes", "--name", projectName],
      { cwd, env: { ...process.env } },
    );
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => (stdout += d.toString()));
    child.stderr.on("data", (d) => (stderr += d.toString()));
    child.on("error", (e) => reject(new Error(`Failed to spawn vercel: ${e.message}`)));
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`vercel exited ${code}\nstderr tail: ${stderr.slice(-800)}`));
        return;
      }
      const urlMatch = (stdout + "\n" + stderr).match(/https:\/\/[a-z0-9-]+\.vercel\.app/g);
      if (!urlMatch || urlMatch.length === 0) {
        reject(new Error(`vercel succeeded but no URL found`));
        return;
      }
      resolve(urlMatch[urlMatch.length - 1]);
    });
  });
}

// ─── Public: build + deploy ──────────────────────────────────────────────────
//
// Phase 3: per-prospect Next.js generation is replaced with a deterministic
// selector between two FIXED, pre-deployed demos. No file copying. No vercel
// spawn. The old extract*Details / config-writing / vercelDeploy code is
// intentionally left in place above as dead code — Phase 3 spec says deploy
// internals stay untouched even though they become unused for this flow.

export type DemoTemplateKey = "utility-billing" | "maintenance-management";

const FIXED_DEMO_URLS: Record<DemoTemplateKey, string> = {
  "utility-billing": "https://ra-demo-utility-billing.vercel.app",
  "maintenance-management": "https://ra-demo-maintenance-ops.vercel.app",
};

const DEFAULT_COMPANY_FALLBACK = "Pinecrest Estate Group";

export type BuildAndDeployInput = {
  slug: string;
  company: string;
  template: "property_management" | "service_dispatch";
  pack: "hvac" | "plumbing" | "electrical" | null;
  website: string;
  location: string;
  employees: number;
  // Optional legacy fields — accepted for backward compatibility, ignored.
  techProfile?: string;
  signals?: Array<{ source: string; quote: string }>;
  pains?: Array<{ title: string; pattern: string; evidence: string }>;
  // Optional logo URL — only emitted as a query param when present.
  logoUrl?: string | null;
};

/**
 * Deterministic mapping from prospect row fields to one of the two fixed
 * demos. Rule:
 *   - service_dispatch firms (HVAC / plumbing / electrical) → maintenance-management
 *     (maintenance/concierge ops is the closest analog of multi-source dispatch).
 *   - property_management firms → utility-billing (owner statements / utility
 *     pass-through is the proven wedge).
 *   - Anything else → utility-billing default, logged.
 *
 * No LLM call — the rule is intentionally trivial so the selection is
 * reproducible and auditable.
 */
export function chooseDemoTemplate(
  prospect: Pick<BuildAndDeployInput, "template" | "pack" | "slug" | "company">,
): DemoTemplateKey {
  if (prospect.template === "service_dispatch") return "maintenance-management";
  if (prospect.template === "property_management") return "utility-billing";
  console.warn(
    `[demo:${prospect.slug}] ambiguous template="${(prospect as { template: string }).template}" — defaulting to utility-billing`,
  );
  return "utility-billing";
}

function buildFixedDemoUrl(
  template: DemoTemplateKey,
  company: string,
  logoUrl?: string | null,
): string {
  const base = FIXED_DEMO_URLS[template];
  const params = new URLSearchParams();
  params.set("company", company && company.trim() ? company.trim() : DEFAULT_COMPANY_FALLBACK);
  if (logoUrl && logoUrl.trim()) params.set("logo", logoUrl.trim());
  return `${base}?${params.toString()}`;
}

export async function buildAndDeployDemo(input: BuildAndDeployInput): Promise<string> {
  const template = chooseDemoTemplate(input);
  const url = buildFixedDemoUrl(template, input.company, input.logoUrl ?? null);

  // Preserve the existing currentStage + demoUrl write + audit event so the
  // review UI (StageProgress, demo column, timeline) renders identically.
  const ts = new Date().toISOString();
  const today = ts.slice(0, 10);
  db.update(schema.prospects)
    .set({ currentStage: "demo_built", demoUrl: url, lastTouch: today })
    .where(eq(schema.prospects.slug, input.slug))
    .run();
  db.insert(schema.events)
    .values({
      prospectSlug: input.slug,
      ts,
      kind: "demo_built",
      note: `Fixed demo selected: ${template} → ${url}`,
    })
    .run();

  console.log(`[demo:${input.slug}] fixed=${template} url=${url}`);
  return url;
}
