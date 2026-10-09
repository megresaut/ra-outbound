"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { monogram, resolveBrand } from "@/lib/brand";

export function BrandMark({ tagline = "Maintenance & Concierge" }: { tagline?: string }) {
  const params = useSearchParams();
  const { company, logo } = resolveBrand(params);
  const mg = monogram(company);

  return (
    <Link href="/" className="flex items-center gap-3 shrink-0">
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo}
          alt={company}
          className="h-9 w-9 rounded-md object-contain bg-bg-subtle p-1 border border-border-subtle"
        />
      ) : (
        <div className="h-9 w-9 rounded-md flex items-center justify-center text-xs font-semibold border bg-accent-glow border-accent-border text-accent-bright">
          {mg}
        </div>
      )}
      <div className="min-w-0">
        <div className="text-sm font-medium text-text-primary truncate font-display">
          {company}
        </div>
        <div className="text-2xs text-text-tertiary uppercase tracking-[0.14em]">
          {tagline}
        </div>
      </div>
    </Link>
  );
}
