/**
 * "Why we built this for you" — three layout variations of the same panel.
 *
 * Drop one of <WhyWeBuiltThisListed />, <WhyWeBuiltThisCards />, or
 * <WhyWeBuiltThisConversation /> into a demo page. They all consume the
 * same WhyWeBuiltThisProps shape.
 */

import type { ReactNode } from "react";

export interface WhyObservation {
  fact: string;
  connector: string;
  source: string;
}

export interface WhyWeBuiltThisProps {
  companyName: string;
  observations: WhyObservation[];
}

function PanelHeader({ companyName }: { companyName: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 mb-6">
      <div>
        <div className="text-2xs uppercase tracking-[0.16em] text-text-tertiary mb-1.5">
          For {companyName}
        </div>
        <h2 className="font-display text-2xl text-text-primary leading-tight">
          Why we built this for you
        </h2>
      </div>
      <div className="font-mono text-2xs text-text-dim hidden sm:block">
        03 / observations
      </div>
    </div>
  );
}

function SourcePill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-2xs text-text-tertiary">
      <span className="h-1 w-1 rounded-full bg-text-dim" />
      from {children}
    </span>
  );
}

/* ---------------------------------------------------------------------- *
 * Variation A — Three observations (clean list / internal memo style)
 * ---------------------------------------------------------------------- */
export function WhyWeBuiltThisListed({
  companyName,
  observations,
}: WhyWeBuiltThisProps) {
  return (
    <section className="rounded-lg border border-border-subtle bg-bg-raised p-8">
      <PanelHeader companyName={companyName} />

      <ol className="divide-y divide-border-subtle">
        {observations.slice(0, 3).map((obs, idx) => (
          <li key={idx} className="grid grid-cols-[auto_1fr] gap-5 py-5 first:pt-0 last:pb-0">
            <span className="font-mono text-2xs text-accent leading-[1.5] mt-[3px]">
              {String(idx + 1).padStart(2, "0")}
            </span>

            <div>
              <p className="text-text-primary text-base leading-snug">
                {obs.fact}
              </p>
              <p className="text-text-secondary text-sm leading-relaxed mt-2">
                {obs.connector}
              </p>
              <div className="mt-3">
                <SourcePill>{obs.source}</SourcePill>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ---------------------------------------------------------------------- *
 * Variation B — Observation cards (visual, three columns)
 * ---------------------------------------------------------------------- */
export function WhyWeBuiltThisCards({
  companyName,
  observations,
}: WhyWeBuiltThisProps) {
  return (
    <section className="rounded-lg border border-border-subtle bg-bg-raised p-8">
      <PanelHeader companyName={companyName} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {observations.slice(0, 3).map((obs, idx) => (
          <article
            key={idx}
            className="group relative flex flex-col rounded-md border border-border-subtle bg-bg-subtle p-5 transition-colors hover:border-accent-border"
          >
            <div className="absolute top-4 right-4 font-mono text-2xs text-text-dim">
              {String(idx + 1).padStart(2, "0")}
            </div>

            <h3 className="font-display text-[17px] leading-snug text-text-primary pr-8">
              {obs.fact}
            </h3>

            <p className="text-text-secondary text-sm leading-relaxed mt-3 flex-1">
              {obs.connector}
            </p>

            <div className="mt-5 pt-4 border-t border-border-subtle">
              <SourcePill>{obs.source}</SourcePill>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- *
 * Variation C — Conversation (least like an ad)
 * ---------------------------------------------------------------------- */
export function WhyWeBuiltThisConversation({
  companyName,
  observations,
}: WhyWeBuiltThisProps) {
  return (
    <section className="rounded-lg border border-border-subtle bg-bg-raised p-8">
      <PanelHeader companyName={companyName} />

      <div className="space-y-7">
        {observations.slice(0, 3).map((obs, idx) => (
          <div
            key={idx}
            className="grid grid-cols-[2px_1fr] gap-5"
          >
            {/* Vertical accent rail, only filled at the top — feels like a quote
                bar without screaming "blockquote". */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 w-px bg-border-subtle" />
              <span className="absolute top-0 left-0 h-6 w-px bg-accent" />
            </div>

            <div>
              <p className="font-display text-[19px] leading-snug text-text-primary">
                "{obs.fact}"
              </p>
              <p className="text-text-secondary text-[15px] leading-relaxed mt-3">
                {obs.connector}
              </p>
              <div className="mt-3">
                <SourcePill>{obs.source}</SourcePill>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
