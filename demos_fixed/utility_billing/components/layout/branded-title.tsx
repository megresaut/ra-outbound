"use client";

import { useSearchParams } from "next/navigation";
import { resolveBrand } from "@/lib/brand";

/**
 * Display the branded company name as an H1 prefix. Reads the ?company=
 * URL param via useSearchParams. Used on the dashboard hero.
 */
export function BrandedTitle({
  suffix = "",
  className = "font-display text-3xl tracking-tight text-text-primary",
}: {
  suffix?: string;
  className?: string;
}) {
  const params = useSearchParams();
  const { company } = resolveBrand(params);
  return (
    <h1 className={className}>
      {company}
      {suffix}
    </h1>
  );
}
