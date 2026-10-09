import fs from "fs/promises";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import { db, schema } from "@/db/client";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const REPO_ROOT = path.resolve(process.cwd(), "..");
const TEMPLATE_DIR = path.join(REPO_ROOT, "demo_templates", "property_management");
const DEMOS_DIR = path.join(REPO_ROOT, "demos");

const COPY_SKIP = new Set([
  "node_modules",
  ".next",
  ".vercel",
  "tsconfig.tsbuildinfo",
  ".DS_Store",
]);

type ExtractedDetails = {
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

type FormPayload = {
  companyName: string;
  website: string;
  location: string;
  primaryColor: string;
  championName: string;
  championTitle: string;
  championEmail: string;
  notes: string;
  logo: File | null;
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[''`]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-(inc|llc|corp|co|ltd|the)$/g, "")
    .replace(/^the-/, "");
}

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

async function extractDetails(payload: FormPayload): Promise<ExtractedDetails> {
  const client = new Anthropic();
  const systemPrompt = `You convert short prospect-research notes about a US property management firm into a structured personalized-demo configuration. The output is rendered into a working Next.js demo that a COO will open.

INPUT: company name, website, location, and free-text notes from the seller (research findings, pain points, observations). Notes may be detailed or thin.

GROUNDING: Every field must be specific to this prospect. Lift facts from notes when present. If notes are thin, ground in plausible defaults appropriate to the firmographics (location, scale, PMS) — never contradict notes, never invent specifics that aren't supported.

VOICE — critical:
Write the way a busy COO talks to another busy COO. Concrete, specific, plain English. Banned words: "leverage", "streamline", "synergy", "transform", "empower", "unlock", "robust", "seamless", "powerful", "best-in-class", "cutting-edge". Use real product/company names (Buildium, AppFolio, PGE, NW Natural, Austin Energy) — never generic placeholders like "your utility provider".

FIELD GUIDANCE:

units / properties / monthlyHoursBefore:
- units: lift from notes if stated; else infer from employee count (~30 units/employee for typical, ~50 for multifamily-heavy); else 400.
- properties: round(units / 15).
- monthlyHoursBefore: round(units * 0.25), clamped [40, 400].

utilities: real providers in their city/state. Portland OR → ["Portland General Electric", "NW Natural", "Portland Water Bureau"]. Real names only. Empty array only if location truly unknown.

propertyManagementSystem: lift from notes if stated (Buildium / AppFolio / ResMan / Yardi / Rent Manager / Propertyware); else default Buildium for small/mid, AppFolio for >40 units/employee.

quotedPainPoint: one short phrase (<80 chars) capturing their main workflow pain in their language.

suggestedColor: tasteful hex (#RRGGBB) — navy, deep green, slate, burgundy. Avoid bright primaries.

painNarrative: 2-3 sentences (50-80 words) painting their specific monthly experience. Name PMS, name providers, name the painful step. Reads like the seller is summarizing back what they heard. Example: "Every month, your office manager spends 2-3 days logging into PGE and NW Natural, downloading 47 statements for your Portland multifamily portfolio, parsing each PDF for unit-level amounts, and rekeying everything into Buildium."

howItWorks: exactly 3 paragraphs (each 2-4 sentences) explaining the automation. Reference their PMS by name. Paragraph 1: the happy-path flow. Paragraph 2: edge cases (flagged statements, layout changes). Paragraph 3: visibility and rollback.

statementsPerMonth: round(units * 0.4).
hoursAfter: 3 (constant — represents ops time on flagged exceptions).
manualEquivalentHours: hours per single run for an ops person to do this manually. Roughly monthlyHoursBefore / 12, clamped [3, 10].

runnerConnectDetail: short phrase listing their actual providers. E.g. "3 providers · PGE, NW Natural, Portland Water Bureau". Use the real provider names from the utilities array.
runnerPostLabel: short label, "Posting to <PMS>". E.g. "Posting to Buildium".
runnerPostDetail: 1-line description tied to their PMS. E.g. "Direct Buildium API write · atomic with rollback on failure".`;

  const userContent = [
    `Company: ${payload.companyName}`,
    payload.website ? `Website: ${payload.website}` : null,
    payload.location ? `Location: ${payload.location}` : null,
    "",
    "Notes:",
    payload.notes || "(no notes provided — use defaults based on company name and location)",
  ]
    .filter((l) => l !== null)
    .join("\n");

  const response = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 8192,
    output_config: {
      effort: "medium",
      format: {
        type: "json_schema",
        schema: {
          type: "object",
          properties: {
            units: { type: "integer", description: "Estimated unit count under management" },
            properties: { type: "integer", description: "Estimated number of properties/buildings" },
            monthlyHoursBefore: { type: "integer", description: "Manual ops hours/month before automation" },
            utilities: {
              type: "array",
              items: { type: "string" },
              description: "Real utility provider names in their service area",
            },
            propertyManagementSystem: {
              type: "string",
              description: "PMS software they use (Buildium, AppFolio, etc.)",
            },
            quotedPainPoint: {
              type: "string",
              description: "Short phrase capturing their main workflow pain",
            },
            suggestedColor: {
              type: "string",
              description: "Tasteful hex color #RRGGBB for the demo accent",
            },
            painNarrative: {
              type: "string",
              description:
                "2-3 sentences painting their specific monthly experience. Names PMS, providers, painful step.",
            },
            howItWorks: {
              type: "array",
              items: { type: "string" },
              description:
                "Exactly 3 paragraphs (no more, no fewer) explaining the automation flow, edge cases, and visibility. Each paragraph is 2-4 sentences.",
            },
            statementsPerMonth: {
              type: "integer",
              description: "Estimated statements per month (~units * 0.4).",
            },
            hoursAfter: {
              type: "integer",
              description: "Ops hours/month after automation (3 unless notes say otherwise).",
            },
            manualEquivalentHours: {
              type: "number",
              description:
                "Hours of manual work per single run, ~monthlyHoursBefore/12, clamped [3, 10].",
            },
            runnerConnectDetail: {
              type: "string",
              description:
                "Subtitle for the 'connect' stage in the automation runner. Lists their real providers.",
            },
            runnerPostLabel: {
              type: "string",
              description: "Title for the 'post' stage. E.g. 'Posting to Buildium'.",
            },
            runnerPostDetail: {
              type: "string",
              description: "Subtitle for the 'post' stage. References their PMS.",
            },
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
    system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: userContent }],
  });

  const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
  if (!textBlock) throw new Error("Claude returned no text block");
  return JSON.parse(textBlock.text) as ExtractedDetails;
}

function buildConfigObject(
  payload: FormPayload,
  details: ExtractedDetails,
  logoPath: string | null,
) {
  const color = payload.primaryColor || details.suggestedColor || "#3b82f6";
  return {
    company: {
      name: payload.companyName,
      logo: logoPath,
      primaryColor: color,
      location: payload.location || "—",
    },
    workflow: {
      primary: "utility_billing" as const,
      enabled: ["utility_billing", "maintenance", "vendors"] as const,
      runnerLabels: {
        connect: { detail: details.runnerConnectDetail },
        post: { label: details.runnerPostLabel, detail: details.runnerPostDetail },
      },
    },
    scale: {
      units: details.units,
      properties: details.properties,
      monthlyHoursBefore: details.monthlyHoursBefore,
    },
    details: {
      utilities: details.utilities,
      propertyManagementSystem: details.propertyManagementSystem,
      quotedPainPoint: details.quotedPainPoint,
      painNarrative: details.painNarrative,
      howItWorks: details.howItWorks,
      mathBreakdown: {
        statementsPerMonth: details.statementsPerMonth,
        hoursAfter: details.hoursAfter,
        manualEquivalentHours: details.manualEquivalentHours,
      },
    },
  };
}

function configToSource(companyName: string, config: object): string {
  return `/**
 * Personalized demo config for ${companyName}.
 * Generated by outreach_hub. Edit demo_templates/property_management to change the template;
 * edit this file to tweak per-prospect details.
 */

export type WorkflowKey =
  | "utility_billing"
  | "maintenance"
  | "vendors"
  | "ap_processing";

export type RunnerStageKey = "connect" | "scrape" | "parse" | "match" | "post";

export interface RunnerStageLabel {
  label?: string;
  detail?: string;
}

export interface DemoConfig {
  company: {
    name: string;
    logo: string | null;
    primaryColor: string;
    location: string;
  };
  workflow: {
    primary: WorkflowKey;
    enabled: WorkflowKey[];
    runnerLabels?: Partial<Record<RunnerStageKey, RunnerStageLabel>>;
  };
  scale: {
    units: number;
    properties: number;
    monthlyHoursBefore: number;
  };
  details: {
    utilities?: string[];
    propertyManagementSystem?: string;
    quotedPainPoint?: string;
    painNarrative?: string;
    howItWorks?: string[];
    mathBreakdown?: {
      statementsPerMonth?: number;
      hoursAfter?: number;
      manualEquivalentHours?: number;
    };
  };
}

export const demoConfig: DemoConfig = ${JSON.stringify(config, null, 2)};
`;
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY not set in environment" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const form = await req.formData();
  const payload: FormPayload = {
    companyName: String(form.get("companyName") ?? "").trim(),
    website: String(form.get("website") ?? "").trim(),
    location: String(form.get("location") ?? "").trim(),
    primaryColor: String(form.get("primaryColor") ?? "").trim(),
    championName: String(form.get("championName") ?? "").trim(),
    championTitle: String(form.get("championTitle") ?? "").trim(),
    championEmail: String(form.get("championEmail") ?? "").trim(),
    notes: String(form.get("notes") ?? ""),
    logo: (form.get("logo") as File | null) ?? null,
  };

  if (!payload.companyName) {
    return new Response(
      JSON.stringify({ error: "companyName is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const slug = slugify(payload.companyName);
  if (!slug) {
    return new Response(
      JSON.stringify({ error: "Could not derive slug from company name" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const existing = db
    .select({ slug: schema.prospects.slug })
    .from(schema.prospects)
    .where(eq(schema.prospects.slug, slug))
    .get();
  if (existing) {
    return new Response(
      JSON.stringify({ error: `Prospect "${slug}" already exists` }),
      { status: 409, headers: { "Content-Type": "application/json" } },
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (type: string, data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type, data })}\n\n`));
      };

      try {
        send("step", { label: "Extracting details from notes", stage: "llm" });
        const details = await extractDetails(payload);
        send("step", { label: "Details extracted", stage: "llm", details });

        send("step", { label: "Copying template", stage: "copy" });
        const demoDir = path.join(DEMOS_DIR, slug);
        await copyTemplate(TEMPLATE_DIR, demoDir);

        let logoPath: string | null = null;
        if (payload.logo && payload.logo.size > 0) {
          send("step", { label: "Saving logo", stage: "copy" });
          const ext = (payload.logo.name.split(".").pop() ?? "png").toLowerCase();
          const safeExt = /^[a-z0-9]+$/.test(ext) ? ext : "png";
          const logoBuf = Buffer.from(await payload.logo.arrayBuffer());
          const logoDir = path.join(demoDir, "public", "logos");
          await fs.mkdir(logoDir, { recursive: true });
          const fileName = `logo.${safeExt}`;
          await fs.writeFile(path.join(logoDir, fileName), logoBuf);
          logoPath = `/logos/${fileName}`;
        }

        send("step", { label: "Writing personalized config", stage: "copy" });
        const configObj = buildConfigObject(payload, details, logoPath);
        await fs.writeFile(
          path.join(demoDir, "config", "demo.data.json"),
          JSON.stringify(configObj, null, 2),
        );
        await fs.writeFile(
          path.join(demoDir, "config", "demo.config.ts"),
          configToSource(payload.companyName, configObj),
        );

        send("step", { label: "Saving prospect to DB", stage: "db" });
        const today = new Date().toISOString().slice(0, 10);
        db.insert(schema.prospects)
          .values({
            slug,
            company: payload.companyName,
            industry: "Property management",
            template: "property_management",
            pack: null,
            employees: 0,
            location: payload.location || "—",
            website: payload.website.replace(/^https?:\/\//, ""),
            championName: payload.championName || "—",
            championTitle: payload.championTitle || "—",
            championEmail: payload.championEmail || "",
            currentStage: "demo_built",
            fitScore: 80,
            demoUrl: null,
            addedAt: today,
            lastTouch: today,
          })
          .run();

        db.insert(schema.events)
          .values({
            prospectSlug: slug,
            ts: new Date().toISOString(),
            kind: "demo_built",
            note: "Local demo built — edit & deploy from prospect page",
          })
          .run();

        send("done", { slug });
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        send("error", { message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
