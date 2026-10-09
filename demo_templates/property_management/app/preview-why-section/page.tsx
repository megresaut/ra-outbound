import { PageShell } from "@/components/layout/page-shell";
import {
  WhyWeBuiltThisCards,
  WhyWeBuiltThisConversation,
  WhyWeBuiltThisListed,
  type WhyObservation,
} from "@/components/marketing/why-we-built-this";

const companyName = "Atlas HVAC Services";

const sampleObservations: WhyObservation[] = [
  {
    fact: "You're hiring 3 dispatcher roles right now.",
    connector:
      "The dispatch automation above absorbs most of what those roles would do — phone, web, ServiceTitan, all routed in seconds.",
    source: "Indeed job posts, last 30 days",
  },
  {
    fact: "Your team uses ServiceTitan.",
    connector:
      "The automation pushes directly into ServiceTitan, not a separate system. Your dispatchers see assignments where they already work.",
    source: "Job post requirements",
  },
  {
    fact: "Your office triages voicemails each morning before techs hit the road.",
    connector:
      "The 6 AM run handles those automatically. Your team walks into a routed day, not a triage backlog.",
    source: "About page on atlashvac.com",
  },
];

function VariationLabel({
  letter,
  title,
  subtitle,
}: {
  letter: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-baseline gap-3 mb-4">
      <span className="font-mono text-2xs text-accent">VARIATION {letter}</span>
      <span className="font-display text-lg text-text-primary">{title}</span>
      <span className="text-text-tertiary text-sm">— {subtitle}</span>
    </div>
  );
}

export default function PreviewWhySectionPage() {
  return (
    <PageShell>
      <div className="mb-10">
        <div className="text-2xs uppercase tracking-[0.16em] text-text-tertiary mb-2">
          Prototype
        </div>
        <h1 className="font-display text-3xl text-text-primary mb-2">
          "Why we built this for you" — variations
        </h1>
        <p className="text-text-secondary text-sm max-w-2xl">
          Three layouts of the same panel rendered against the same sample
          observations for {companyName}. Stacked top-to-bottom for comparison.
        </p>
      </div>

      <div className="space-y-12">
        <div>
          <VariationLabel
            letter="A"
            title="Three observations"
            subtitle="clean numbered list, reads like an internal memo"
          />
          <WhyWeBuiltThisListed
            companyName={companyName}
            observations={sampleObservations}
          />
        </div>

        <div>
          <VariationLabel
            letter="B"
            title="Observation cards"
            subtitle="three columns side-by-side, more visual"
          />
          <WhyWeBuiltThisCards
            companyName={companyName}
            observations={sampleObservations}
          />
        </div>

        <div>
          <VariationLabel
            letter="C"
            title="Conversation"
            subtitle="quoted observations, least like an ad"
          />
          <WhyWeBuiltThisConversation
            companyName={companyName}
            observations={sampleObservations}
          />
        </div>
      </div>
    </PageShell>
  );
}
