// Email enrichment via Anymailfinder.
//
// Hard guards (per the discovery spec):
//  - Per-valid-result credit counter capped at config.enrichmentCreditCap.
//  - Refuse if name is missing or empty.
//  - Refuse if domain is missing or empty.
//  - Refuse if credits exhausted.
//  - API key from env ANYMAILFINDER_API_KEY — never hardcoded.
//
// API: POST https://api.anymailfinder.com/v5.1/find-email/person
//   body: { domain, full_name }
//   headers: { Authorization: <key>, Content-Type: application/json }
//   returns: { credits_charged, email, email_status, valid_email }
//   "valid" status costs 1 credit; risky/not_found/blacklisted cost 0.

import type {
  EmailEnrichmentProvider,
  EnrichmentInput,
  EnrichmentResult,
} from "./types";

const ANYMAILFINDER_PERSON_URL =
  "https://api.anymailfinder.com/v5.1/find-email/person";

export class AnymailfinderProvider implements EmailEnrichmentProvider {
  readonly name = "anymailfinder";

  private creditsUsed = 0;
  private readonly cap: number;
  private readonly apiKey: string;

  constructor(opts: { cap: number; apiKey?: string }) {
    this.cap = opts.cap;
    const key = opts.apiKey ?? process.env.ANYMAILFINDER_API_KEY ?? "";
    if (!key) {
      throw new Error(
        "ANYMAILFINDER_API_KEY missing — required for live enrichment. Use --dry-run for offline iteration.",
      );
    }
    this.apiKey = key;
  }

  get used(): number {
    return this.creditsUsed;
  }

  async findPersonEmail(input: EnrichmentInput): Promise<EnrichmentResult> {
    // Hard guard 1: name required, non-empty.
    if (!input.fullName || !input.fullName.trim()) {
      throw new Error("enrichment refused — name missing");
    }
    // Hard guard 2: domain required, non-empty.
    if (!input.domain || !input.domain.trim()) {
      throw new Error("enrichment refused — domain missing (never enrich on domain-only or name-only)");
    }
    // Hard guard 3: credits exhausted.
    if (this.creditsUsed >= this.cap) {
      throw new Error(
        `enrichment refused — credit cap (${this.cap}) reached, used ${this.creditsUsed}`,
      );
    }

    const body: Record<string, string> = {
      domain: input.domain.trim(),
      full_name: input.fullName.trim(),
    };
    if (input.companyName && input.companyName.trim()) {
      body.company_name = input.companyName.trim();
    }

    const res = await fetch(ANYMAILFINDER_PERSON_URL, {
      method: "POST",
      headers: {
        Authorization: this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`anymailfinder ${res.status}: ${text.slice(0, 400)}`);
    }
    let parsed: {
      credits_charged?: number;
      email?: string | null;
      email_status?: string;
      valid_email?: string | null;
    };
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      throw new Error(`anymailfinder JSON parse failed: ${(e as Error).message}`);
    }
    const status = (parsed.email_status ?? "not_found") as EnrichmentResult["email_status"];
    const credits = typeof parsed.credits_charged === "number" ? parsed.credits_charged : 0;
    this.creditsUsed += credits;
    return {
      valid: status === "valid",
      email: parsed.valid_email ?? parsed.email ?? null,
      email_status: status,
      credits_charged: credits,
    };
  }
}

// Mock provider — used by --dry-run. Never touches the network. Returns a
// deterministic "valid" result so the rest of the dry-run loop is exercised.
export class MockEnrichmentProvider implements EmailEnrichmentProvider {
  readonly name = "mock";
  private creditsUsed = 0;
  private readonly cap: number;
  constructor(opts: { cap: number }) {
    this.cap = opts.cap;
  }
  get used(): number {
    return this.creditsUsed;
  }
  async findPersonEmail(input: EnrichmentInput): Promise<EnrichmentResult> {
    if (!input.fullName || !input.fullName.trim()) {
      throw new Error("enrichment refused — name missing");
    }
    if (!input.domain || !input.domain.trim()) {
      throw new Error("enrichment refused — domain missing (never enrich on domain-only or name-only)");
    }
    if (this.creditsUsed >= this.cap) {
      throw new Error(
        `enrichment refused — credit cap (${this.cap}) reached, used ${this.creditsUsed}`,
      );
    }
    // Deterministic mock: first.last@domain with credits_charged=1.
    const slug = input.fullName.trim().toLowerCase().replace(/\s+/g, ".").replace(/[^a-z.]/g, "");
    const email = `${slug}@${input.domain.trim().toLowerCase()}`;
    this.creditsUsed += 1;
    return { valid: true, email, email_status: "valid", credits_charged: 1 };
  }
}
