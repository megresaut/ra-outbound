"use client";

import {
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Banknote,
  FileText,
  Send,
  ListChecks,
  Clock,
  ArrowRight,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { WorkflowRunner } from "@/components/demo/workflow-runner";

export default function RentCollectionPage() {
  return (
    <PageShell>
      <div className="mb-8 max-w-3xl">
        <div className="text-xs uppercase tracking-wider text-accent mb-2">
          Automation · Rent collection
        </div>
        <h1 className="font-display text-4xl text-text-primary mb-3">
          The 5th of the month, but easier.
        </h1>
        <p className="text-text-secondary leading-relaxed">
          Every morning we reconcile incoming payments against the rent roll,
          identify delinquencies, and draft escalating reminders per your lease
          terms. Notices go out only when your team approves them — formal
          notices and legal escalations always require a human signature.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <ContextStat
          icon={Clock}
          label="Daily run time"
          value="~7s"
          sub="vs. 90 min manual"
          accent
        />
        <ContextStat
          icon={CreditCard}
          label="Auto-reconciled"
          value="93%"
          sub="of bank deposits"
        />
        <ContextStat
          icon={AlertCircle}
          label="Avg delinquencies"
          value="12"
          sub="surfaced daily"
        />
        <ContextStat
          icon={TrendingUp}
          label="Late-payment recovery"
          value="+18%"
          sub="vs. ad-hoc reminders"
        />
      </div>

      <WorkflowRunner
        title="Daily rent collection sweep"
        schedule="Scheduled daily at 6:00 AM · or run on demand"
        stages={[
          {
            key: "rent-roll",
            label: "Pulling rent roll",
            detail: "800 active leases across 47 properties",
            icon: ListChecks,
            durationMs: 1200,
            log: [
              { text: "  · Loaded 800 active leases" },
              { text: "  · Identified 312 due in next 7 days, 43 past due" },
            ],
          },
          {
            key: "reconcile",
            label: "Reconciling bank deposits",
            detail: "Matching incoming payments to unit ledgers",
            icon: Banknote,
            durationMs: 1800,
            log: [
              { text: "  · 287 deposits pulled from bank feeds" },
              { text: "  ✓ 268 auto-matched to tenant + unit", type: "success" },
              { text: "  · 19 unmatched (memo unclear) · queued for review", type: "warn" },
              { text: "  · Posted matched payments to ledgers" },
            ],
          },
          {
            key: "delinquency",
            label: "Identifying delinquencies",
            detail: "Cross-referencing unpaid rent against lease terms",
            icon: AlertCircle,
            durationMs: 1400,
            log: [
              { text: "  · 12 accounts past due > 1 day" },
              { text: "  · 4 accounts past due > 5 days (formal notice eligible)" },
              { text: "  · 1 account past due > 30 days (escalation required)", type: "warn" },
            ],
          },
          {
            key: "draft",
            label: "Drafting reminders & notices",
            detail: "Escalating tone per your lease + state requirements",
            icon: FileText,
            durationMs: 1600,
            log: [
              { text: "  · 8 friendly reminders drafted (day 1-3 late)" },
              { text: "  · 4 formal late notices drafted (day 5-15 late)" },
              { text: "  · 1 escalation packet drafted (>30 days)" },
              { text: "  · Late fees calculated per lease terms · totaling $1,847" },
            ],
          },
          {
            key: "queue",
            label: "Queuing for your approval",
            detail: "Reminders ready · formal notices await your sign-off",
            icon: Send,
            durationMs: 1100,
            log: [
              { text: "  · 8 reminders ready to auto-send (per your standing rule)" },
              { text: "  · 5 notices awaiting your approval · requires signature", type: "warn" },
              { text: "  ✓ Daily sweep complete · approval queue posted", type: "success" },
            ],
          },
        ]}
        summary={[
          { label: "Payments reconciled", value: 268, total: 287, accent: true },
          { label: "Delinquencies surfaced", value: 12, warn: true },
          { label: "Reminders queued", value: 8 },
          { label: "Notices awaiting you", value: 5, warn: true },
        ]}
        completionFootnote="Equivalent manual work: ~90 min of spreadsheet work"
        reviewCallout={
          <>
            <span className="text-text-primary font-medium">
              Action needed.
            </span>{" "}
            5 formal late notices are drafted and awaiting your team's
            signature — these never go out automatically. Friendly reminders go
            out per your standing rule.
          </>
        }
      />

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-lg border border-border-subtle bg-bg-raised p-6">
          <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-3">
            How it works
          </div>
          <h3 className="font-display text-xl text-text-primary mb-4">
            Reconciliation today, action when you say.
          </h3>
          <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
            <p>
              Each morning we pull bank deposits, match them against the rent
              roll, and post receipts to the right unit ledger. Anything
              ambiguous (unclear memo, partial payment, wrong amount) goes to a
              human review queue rather than guessing.
            </p>
            <p>
              Delinquencies are surfaced with full payment history attached. We
              draft the reminder or notice your lease and state require — but
              formal notices and legal escalations always wait for your team's
              explicit approval.
            </p>
            <p>
              You can configure standing rules per property (e.g. "always
              auto-send the day-1 friendly reminder for residential leases")
              while keeping high-stakes actions on a human-approved path.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-accent-border bg-accent-glow/30 p-6 flex flex-col">
          <ArrowRight className="h-5 w-5 text-accent mb-3" />
          <div className="font-display text-lg text-text-primary mb-2">
            Approval-gated by default
          </div>
          <p className="text-sm text-text-secondary leading-relaxed mb-4 flex-1">
            Reminders are automated. Late fees are calculated. But every formal
            late notice and every legal escalation waits for a real signature
            from your team. We do the prep so the decision is fast — not the
            decision itself.
          </p>
          <div className="text-2xs text-text-tertiary flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3 text-status-success" />
            Audit log of every action, including who approved
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
