// Helpers for CSV → prospect conversion.

export type IndustryKey = "Property management" | "HVAC" | "Plumbing" | "Electrical";
export type TemplateKey = "property_management" | "service_dispatch";
export type PackKey = "hvac" | "plumbing" | "electrical";

export type IntakeRow = {
  company: string;
  industry: string;
  contactName: string;
  contactEmail: string;
  website?: string;
  location?: string;
};

export type NormalizedRow = {
  slug: string;
  company: string;
  industry: IndustryKey;
  template: TemplateKey;
  pack: PackKey | null;
  contactName: string;
  contactEmail: string;
  website: string;
  location: string;
};

const INDUSTRY_RULES: Array<{ match: RegExp; industry: IndustryKey; template: TemplateKey; pack: PackKey | null }> = [
  { match: /\b(property|pm|realty|residential|multifamily|apartments?|real\s*estate)\b/i, industry: "Property management", template: "property_management", pack: null },
  { match: /\bhvac|heating|cooling|air[ -]?cond|mechanical\b/i, industry: "HVAC", template: "service_dispatch", pack: "hvac" },
  { match: /\bplumb(ing|er)?\b/i, industry: "Plumbing", template: "service_dispatch", pack: "plumbing" },
  { match: /\belectric(al|ian)?\b/i, industry: "Electrical", template: "service_dispatch", pack: "electrical" },
];

export function classifyIndustry(raw: string, companyName: string): {
  industry: IndustryKey;
  template: TemplateKey;
  pack: PackKey | null;
} | null {
  const haystack = `${raw} ${companyName}`;
  for (const rule of INDUSTRY_RULES) {
    if (rule.match.test(haystack)) {
      return { industry: rule.industry, template: rule.template, pack: rule.pack };
    }
  }
  return null;
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[''`]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-(inc|llc|corp|co|ltd|the)$/g, "")
    .replace(/^the-/, "");
}

export function uniqueSlug(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base;
  for (let i = 2; i < 100; i++) {
    const candidate = `${base}-${i}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${base}-${Date.now()}`;
}

export function deriveWebsite(email: string, given?: string): string {
  if (given) return given.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const at = email.indexOf("@");
  if (at < 0) return "";
  const domain = email.slice(at + 1).toLowerCase();
  // Skip free-mail domains — caller should treat as missing.
  if (/^(gmail|yahoo|outlook|hotmail|icloud|aol|proton(mail)?)\./.test(domain)) return "";
  return domain;
}

export function parseContactName(raw: string): { first: string; full: string } {
  const full = raw.trim();
  const first = full.split(/\s+/)[0] || full;
  return { first, full };
}
