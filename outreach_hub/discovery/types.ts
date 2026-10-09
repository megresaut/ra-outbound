// Shared types for the discovery CLI.
// Standalone — never imported by the Next.js server path.

export type Candidate = {
  company: string;
  website?: string;             // domain only, no protocol, no trailing slash
  location: string;             // "City, ST"
  champion?: {
    fullName: string;
    title?: string;
    linkedinUrl?: string;
  };
  notes?: string;
  source: string;               // which DiscoverySource produced it
};

export type ClassificationResult = {
  is_icp: boolean;
  operating_model:
    | "operates-residences"
    | "invests-in-RE"
    | "brokerage"
    | "concierge-only"
    | "unclear";
  firm_size_estimate: number;
  confidence: number;            // 0–1
  reasoning: string;
  champion?: { fullName: string; title?: string; linkedinUrl?: string };
  domain?: string;
};

export type EnrichmentInput = {
  fullName: string;
  domain: string;
  companyName?: string;
};

export type EnrichmentResult = {
  valid: boolean;                // true iff email_status === "valid"
  email: string | null;
  email_status: "valid" | "risky" | "not_found" | "blacklisted";
  credits_charged: number;       // 1 if valid, 0 otherwise (per Anymailfinder docs)
};

export interface DiscoverySource {
  readonly name: string;
  search(metro: string, limit: number): Promise<Candidate[]>;
}

export interface EmailEnrichmentProvider {
  readonly name: string;
  findPersonEmail(input: EnrichmentInput): Promise<EnrichmentResult>;
}

export type DiscoveryConfig = {
  metros: string[];
  totalLimit: number;
  dryRun: boolean;
  enrichmentCreditCap: number;   // default 100
};
