import fs from "fs/promises";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import { db, schema } from "@/db/client";
import { eq } from "drizzle-orm";

const REPO_ROOT = path.resolve(process.cwd(), "..");

type PainOutput = {
  pains: Array<{ title: string; pattern: string; evidence: string }>;
};

type Input = {
  slug: string;
  company: string;
  industry: string;
  techProfile: string;
  signals: Array<{ source: string; quote: string }>;
};

let cachedLibrary: string | null = null;
async function loadPainLibrary(): Promise<string> {
  if (cachedLibrary) return cachedLibrary;
  cachedLibrary = await fs.readFile(
    path.join(REPO_ROOT, "openclaw_pipeline", "pain_library.md"),
    "utf8",
  );
  return cachedLibrary;
}

const SYSTEM_PROMPT = (library: string) => `You are the pain-mapper for Reasonable Automations.

Given a prospect's research signals (quoted workflow pains found on the web), match them to patterns from our pain library and produce 1-3 pain entries grounded in the actual evidence.

## Pain library (source of truth)
${library}

## Hard rules
1. Never invent a pain not grounded in a research signal. If the signals don't match any library pattern, return { "pains": [] }.
2. Each pain entry's "evidence" must reference the actual signal quote or source.
3. "title" is short, 3-7 words, in the prospect's voice — e.g. "Multi-portal utility billback", "After-hours dispatch via phone".
4. "pattern" is one sentence describing the workflow shape — e.g. "Three utility portals → manual download → re-key into Buildium".
5. Order pains by strongest evidence first.
6. Maximum 3 pains. If only 1 is strongly grounded, return 1.

## Voice
Concrete and specific. Real product names. No "streamline", "leverage", "transform".

Return ONLY a JSON object matching the schema.`;

export async function mapPain(input: Input): Promise<PainOutput> {
  const client = new Anthropic();
  const library = await loadPainLibrary();

  const userContent = [
    `Company: ${input.company}`,
    `Industry: ${input.industry}`,
    `Tech profile: ${input.techProfile}`,
    "",
    "Signals from research:",
    ...input.signals.map((s, i) => `${i + 1}. [${s.source}] "${s.quote}"`),
    "",
    "Map these to library patterns. Return JSON only.",
  ].join("\n");

  const response = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 4096,
    output_config: {
      effort: "medium",
      format: {
        type: "json_schema",
        schema: {
          type: "object",
          properties: {
            pains: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  pattern: { type: "string" },
                  evidence: { type: "string" },
                },
                required: ["title", "pattern", "evidence"],
                additionalProperties: false,
              },
            },
          },
          required: ["pains"],
          additionalProperties: false,
        },
      },
    },
    system: [
      { type: "text", text: SYSTEM_PROMPT(library), cache_control: { type: "ephemeral" } },
    ],
    messages: [{ role: "user", content: userContent }],
  });

  const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
  if (!textBlock) throw new Error("Claude returned no text block during pain mapping");
  return JSON.parse(textBlock.text) as PainOutput;
}

export async function mapPainForProspect(input: Input): Promise<PainOutput> {
  const out = await mapPain(input);

  if (out.pains.length === 0) {
    throw new Error("No pain patterns matched the research signals");
  }

  // Replace any prior pains (idempotent retry).
  db.delete(schema.pains).where(eq(schema.pains.prospectSlug, input.slug)).run();
  out.pains.forEach((p, i) => {
    db.insert(schema.pains)
      .values({
        prospectSlug: input.slug,
        title: p.title,
        pattern: p.pattern,
        evidence: p.evidence,
        ord: i,
      })
      .run();
  });

  db.update(schema.prospects)
    .set({ currentStage: "pain_mapped", lastTouch: new Date().toISOString().slice(0, 10) })
    .where(eq(schema.prospects.slug, input.slug))
    .run();

  db.insert(schema.events)
    .values({
      prospectSlug: input.slug,
      ts: new Date().toISOString(),
      kind: "pain_mapped",
      note: `${out.pains.length} pattern${out.pains.length === 1 ? "" : "s"} matched`,
    })
    .run();

  return out;
}
