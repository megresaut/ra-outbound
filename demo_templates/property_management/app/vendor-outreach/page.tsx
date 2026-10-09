"use client";

import {
  MessageSquare,
  ListChecks,
  Mail,
  CheckCircle2,
  Inbox,
  Send,
  Star,
  Clock,
  Users,
  ArrowRight,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { WorkflowRunner } from "@/components/demo/workflow-runner";

export default function VendorOutreachPage() {
  return (
    <PageShell>
      <div className="mb-8 max-w-3xl">
        <div className="text-xs uppercase tracking-wider text-accent mb-2">
          Automation · Vendor outreach
        </div>
        <h1 className="font-display text-4xl text-text-primary mb-3">
          Quote requests, without the phone tag.
        </h1>
        <p className="text-text-secondary leading-relaxed">
          When a work order needs a vendor, we text the top 3 in your network in
          parallel and bring back prices, ETAs, and notes. Nothing gets dispatched
          until your team approves a quote — humans stay in the loop on every job.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <ContextStat
          icon={Clock}
          label="Avg quote response"
          value="6 min"
          sub="vs. 4-12h by phone"
          accent
        />
        <ContextStat
          icon={Users}
          label="Vendors per request"
          value="3"
          sub="parallel outreach"
        />
        <ContextStat
          icon={Star}
          label="Quote acceptance rate"
          value="74%"
          sub="last 90 days"
        />
        <ContextStat
          icon={MessageSquare}
          label="Touches per ticket"
          value="0"
          sub="until you decide"
        />
      </div>

      <WorkflowRunner
        title="Send quote request · 14 open work orders"
        schedule="Triggered by a new work order · or run on demand"
        stages={[
          {
            key: "queue",
            label: "Reading the work order queue",
            detail: "14 tickets needing a quote",
            icon: Inbox,
            durationMs: 1200,
            log: [
              { text: "  · Loaded 14 tickets · 6 plumbing, 4 HVAC, 3 electrical, 1 roofing" },
              { text: "  · Grouped by trade for batch outreach" },
            ],
          },
          {
            key: "match",
            label: "Matching vendors by trade & service area",
            detail: "Top 3 per ticket by rating, distance, current load",
            icon: ListChecks,
            durationMs: 1600,
            log: [
              { text: "  · Plumbing: matched to Reliable, AAA, QuickFix" },
              { text: "  · HVAC: matched to Cool Air, Climate Pros, Mountain HVAC" },
              { text: "  · Electrical: matched to Sparks, BrightLine, Voltage" },
              { text: "  · Roofing: matched to Apex, Skyline (only 2 in service area)", type: "warn" },
            ],
          },
          {
            key: "send",
            label: "Sending parallel quote requests",
            detail: "SMS + email with ticket context and photos",
            icon: Send,
            durationMs: 1800,
            log: [
              { text: "  · Sent 6 plumbing requests · 3 vendors x 2 batches" },
              { text: "  · Sent 4 HVAC requests" },
              { text: "  · Sent 3 electrical requests" },
              { text: "  · Sent 2 roofing requests" },
              { text: "  ✓ 41 outbound messages delivered", type: "success" },
            ],
          },
          {
            key: "collect",
            label: "Collecting quotes",
            detail: "Vendors reply by SMS · we parse price, ETA, notes",
            icon: Mail,
            durationMs: 2200,
            log: [
              { text: "  · Reliable Plumbing replied · $185 · tomorrow 10am" },
              { text: "  · Cool Air Solutions replied · $340 · next-day" },
              { text: "  · AAA Plumbing replied · $220 · tomorrow 2pm" },
              { text: "  · Sparks Electric replied · $145 · same-day", type: "success" },
              { text: "  · QuickFix Plumbing replied · $165 · 2-day lead" },
              { text: "  · 9 quotes received, 5 still pending (will keep collecting)" },
            ],
          },
          {
            key: "queue-up",
            label: "Queuing for your approval",
            detail: "Side-by-side comparison ready in your inbox",
            icon: CheckCircle2,
            durationMs: 1000,
            log: [
              { text: "  · Built comparison view per ticket" },
              { text: "  ✓ 14 tickets ready to review · awaiting your approval", type: "success" },
            ],
          },
        ]}
        summary={[
          { label: "Tickets processed", value: 14, total: 14 },
          { label: "Quotes received", value: 9, total: 41, accent: true },
          { label: "Awaiting your approval", value: 14, warn: true },
          { label: "Auto-dispatched", value: 0, suffix: " (you decide)" },
        ]}
        completionFootnote="Equivalent manual work: ~3 hours of phone calls"
        reviewCallout={
          <>
            <span className="text-text-primary font-medium">
              Quotes are in — your turn.
            </span>{" "}
            We won't dispatch any vendor until your ops team approves a quote.
            Open the work order queue to compare prices and approve.
          </>
        }
      />

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-lg border border-border-subtle bg-bg-raised p-6">
          <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-3">
            How it works
          </div>
          <h3 className="font-display text-xl text-text-primary mb-4">
            Faster vendor responses, same human approval.
          </h3>
          <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
            <p>
              When a work order is created, we text the top 3 eligible vendors in
              parallel with the issue, photos, and unit access notes. Vendors
              reply with price, ETA, and any flags — usually within 5-10 minutes.
            </p>
            <p>
              We parse the replies into a structured comparison view and send it
              to your ops team. Nothing happens automatically: you approve a
              quote, we dispatch that vendor, the others get a thank-you message
              with no further action.
            </p>
            <p>
              If no quotes come back within your SLA (default 30 minutes for
              non-urgent), we widen the vendor pool or escalate to your team for
              a manual call.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-accent-border bg-accent-glow/30 p-6 flex flex-col">
          <ArrowRight className="h-5 w-5 text-accent mb-3" />
          <div className="font-display text-lg text-text-primary mb-2">
            Human-in-the-loop, by design
          </div>
          <p className="text-sm text-text-secondary leading-relaxed mb-4 flex-1">
            We surface options. You make the call. Every dispatch, every spend,
            and every tenant-facing message goes out only with your team's
            approval — unless you explicitly turn on auto-dispatch for routine
            categories.
          </p>
          <div className="text-2xs text-text-tertiary">
            Toggle auto-dispatch per trade, per priority, or per dollar amount.
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function ContextStat({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        accent
          ? "border-accent-border bg-accent-glow"
          : "border-border-subtle bg-bg-raised"
      }`}
    >
      <Icon
        className={`h-4 w-4 mb-3 ${
          accent ? "text-accent-bright" : "text-text-tertiary"
        }`}
      />
      <div
        className={`font-display text-2xl tabular ${
          accent ? "text-accent-bright" : "text-text-primary"
        }`}
      >
        {value}
      </div>
      <div className="text-2xs text-text-tertiary mt-1">{label}</div>
      <div className="text-2xs text-text-dim">{sub}</div>
    </div>
  );
}
