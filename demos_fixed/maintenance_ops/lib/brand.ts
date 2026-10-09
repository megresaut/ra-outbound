/**
 * Lightly branded customization for the demo.
 *
 * Two URL params (?company=, ?logo=) flow through to the top nav. Everything
 * else (residences, work orders, vendors) is fixed fictional data baked into
 * the build.
 */

export const DEFAULT_BRAND = {
  company: "Pinecrest Estate Group",
  logo: null as string | null,
};

export function monogram(name: string): string {
  const letters = name
    .split(/\s+/)
    .map((w) => w[0])
    .filter((c) => /[A-Z]/i.test(c ?? ""))
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return letters || "EG";
}

export type Brand = {
  company: string;
  logo: string | null;
};

export function resolveBrand(params: URLSearchParams | null | undefined): Brand {
  if (!params) return DEFAULT_BRAND;
  const company = params.get("company")?.trim() || DEFAULT_BRAND.company;
  const logo = params.get("logo")?.trim() || DEFAULT_BRAND.logo;
  return { company, logo };
}
