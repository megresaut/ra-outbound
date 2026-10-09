// ICP classifier — reads outreach_hub/discovery/icp-rubric.md verbatim and
// asks Claude to classify a single candidate. Strict JSON output.

import fs from "fs/promises";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import type { Candidate, ClassificationResult } from "./types";

const RUBRIC_PATH = path.join(__dirname, "icp-rubric.md");

let cachedRubric: string | null = null;
async function loadRubric(): Promise<string> {
  if (cachedRubric) return cachedRubric;
  cachedRubric = await fs.readFile(RUBRIC_PATH, "utf8");
  return cachedRubric;
}

const SYSTEM_PROMPT = (rubric: string) => `You classify one candidate firm at a time against the rubric below. You must follow the rubric verbatim — do not relax any threshold.

${rubric}

Return ONLY a JSON object matching the rubric's "Output schema" section. No prose. No code fences.

If you cannot verify a field, use null (for nested object fields) or "unclear" (for operating_model) and lower confidence accordingly. Never invent specifics.`;

const VALID_MODELS: ClassificationResult["operating_model"][] = [
  "operates-residences",
  "invests-in-RE",
  "brokerage",
  "concierge-only",
  "unclear",
];

export async function classifyCandidate(
  c: Candidate,
): Promise<ClassificationResult> {
  const rubric = await loadRubric();
  const client = new Anthropic();

  const userContent = [
    `Company: ${c.company}`,
    c.website ? `Website: ${c.website}` : null,
    `Location: ${c.location}`,
    c.champion
      ? `Pre-scraped champion: ${c.champion.fullName}${c.champion.title ? `, ${c.champion.title}` : ""}${c.champion.linkedinUrl ? ` (${c.champion.linkedinUrl})` : ""}`
      : `No pre-scraped champion.`,
    c.notes ? `Notes from discovery: ${c.notes}` : null,
    "",
    "Classify against the rubric. Return JSON only.",
  ]
    .filter((l): l is string => l !== null)
    .join("\n");

  const response = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 1024,
    system: [
      { type: "text", text: SYSTEM_PROMPT(rubric), cache_control: { type: "ephemeral" } },
    ],
    messages: [{ role: "user", content: userContent }],
  });

  const textBlocks = response.content.filter(
    (b): b is Anthropic.TextBlock => b.type === "text",
  );
  if (textBlocks.length === 0) {
    throw new Error(`Classifier returned no text (stop=${response.stop_reason})`);
  }
  const finalText = textBlocks[textBlocks.length - 1].text;
  const jsonMatch = finalText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Classifier output contained no JSON object");
  }
  const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;

  // Defensive coercion — never trust raw model output.
  const operating_model =
    typeof parsed.operating_model === "string" &&
    (VALID_MODELS as string[]).includes(parsed.operating_model)
      ? (parsed.operating_model as ClassificationResult["operating_model"])
      : "unclear";

  const confidenceRaw = typeof parsed.confidence === "number" ? parsed.confidence : 0;
  const confidence = Math.max(0, Math.min(1, confidenceRaw));

  const championRaw = parsed.champion as Record<string, unknown> | null | undefined;
  const champion =
    championRaw && typeof championRaw.fullName === "string" && championRaw.fullName.trim()
      ? {
          fullName: championRaw.fullName.trim(),
          title:
            typeof championRaw.title === "string" && championRaw.title.trim()
              ? championRaw.title.trim()
              : undefined,
          linkedinUrl:
            typeof championRaw.linkedinUrl === "string" && championRaw.linkedinUrl.trim()
              ? championRaw.linkedinUrl.trim()
              : undefined,
        }
      : c.champion;

  return {
    is_icp: parsed.is_icp === true,
    operating_model,
    firm_size_estimate:
      typeof parsed.firm_size_estimate === "number" ? parsed.firm_size_estimate : 0,
    confidence,
    reasoning:
      typeof parsed.reasoning === "string" ? parsed.reasoning : "(no reasoning provided)",
    champion,
    domain: typeof parsed.domain === "string" ? parsed.domain.trim() : c.website,
  };
}

/**
 * Pass gate per the rubric: confidence >= 0.8 AND operating_model ==
 * "operates-residences". `unclear` never passes.
 */
export function passesIcpGate(r: ClassificationResult): boolean {
  if (r.operating_model !== "operates-residences") return false;
  if (r.operating_model === ("unclear" as ClassificationResult["operating_model"])) return false;
  return r.confidence >= 0.8;
}
