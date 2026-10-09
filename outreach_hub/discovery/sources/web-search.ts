// Real DiscoverySource: uses Claude's web_search tool to find candidate
// property management firms in a given US metro. Returns raw candidates;
// classification happens separately against icp-rubric.md.

import Anthropic from "@anthropic-ai/sdk";
import type { Candidate, DiscoverySource } from "../types";

const SYSTEM_PROMPT = `You discover candidate property management firms for an outbound automation tool. You will be given a US metropolitan area. Use the web_search tool to find small/mid US property management firms that operate residences (lease, maintain, and bill on behalf of owners) — NOT real-estate brokerages, NOT investment funds, NOT VC-backed proptech.

Search the web for things like:
- "property management firms in <metro>"
- "residential property management <metro>"
- "best property managers <metro>"
- Local business directories that list PM firms.

For each promising firm you find, capture:
- company name
- website domain (no protocol, no trailing slash)
- location ("City, ST" — use the metro you were asked about)
- a champion if visible on the site or in search results: Director of Operations, COO, Operations Manager, Head of Operations, Office Manager. Include fullName and title; include linkedinUrl only if a real one is visible.
- a one-line "notes" field with the strongest signal you saw (e.g., "Site says 'managing 450+ residential units since 1998'").

Return ONLY a JSON object of the form:
{ "candidates": [ { "company": "...", "website": "...", "location": "...", "champion": { "fullName": "...", "title": "..." }, "notes": "..." }, ... ] }

Hard rules:
1. Real firms only — no inventing domains. If you can't verify the domain, skip the candidate.
2. Skip brokerages, VC-backed proptech, and out-of-US firms.
3. Skip firms whose only signal is an Apollo or Crunchbase snippet — needs a real-world site or directory hit.
4. Maximum candidates per call = the limit you are given. Stop searching once you have enough.`;

export class WebSearchDiscoverySource implements DiscoverySource {
  readonly name = "web-search";

  async search(metro: string, limit: number): Promise<Candidate[]> {
    const client = new Anthropic();
    const userContent = `Metro: ${metro}\nLimit: ${limit}\n\nFind up to ${limit} candidate property management firms in ${metro}. Use web_search liberally. Return JSON only.`;

    const response = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 8000,
      tools: [
        { type: "web_search_20260209", name: "web_search", max_uses: 6 },
      ],
      system: [
        { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
      ],
      messages: [{ role: "user", content: userContent }],
    });

    const textBlocks = response.content.filter(
      (b): b is Anthropic.TextBlock => b.type === "text",
    );
    if (textBlocks.length === 0) {
      console.warn(`[discovery:web-search:${metro}] no text block returned (stop=${response.stop_reason})`);
      return [];
    }
    const finalText = textBlocks[textBlocks.length - 1].text;
    const jsonMatch = finalText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn(`[discovery:web-search:${metro}] no JSON object in final text`);
      return [];
    }
    let parsed: { candidates?: unknown[] };
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      console.warn(`[discovery:web-search:${metro}] JSON parse failed`);
      return [];
    }
    const raw = Array.isArray(parsed.candidates) ? parsed.candidates : [];
    const out: Candidate[] = [];
    for (const c of raw) {
      if (!c || typeof c !== "object") continue;
      const obj = c as Record<string, unknown>;
      const company = typeof obj.company === "string" ? obj.company.trim() : "";
      if (!company) continue;
      const website =
        typeof obj.website === "string"
          ? obj.website.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "")
          : undefined;
      const location =
        typeof obj.location === "string" && obj.location.trim()
          ? obj.location.trim()
          : metro;
      const championRaw = (obj.champion ?? null) as Record<string, unknown> | null;
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
          : undefined;
      out.push({
        company,
        website,
        location,
        champion,
        notes: typeof obj.notes === "string" ? obj.notes : undefined,
        source: this.name,
      });
      if (out.length >= limit) break;
    }
    return out;
  }
}
