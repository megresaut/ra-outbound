import Link from "next/link";
import {
  ArrowUpRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Play,
  Link2,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { BrandedTitle } from "@/components/layout/branded-title";
import { FEED, RESIDENCES, residenceById } from "@/lib/data";
import { ACCOUNTS, providerSet } from "@/lib/automation";
import { formatUSD, formatRelativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATS = [
  { label: "Statements this month", value: "6", sub: "all residences" },
  { label: "Total billed to owners", value: "$417,420", sub: "April 2026" },
  { label: "Exceptions queued", value: "9", sub: "across 184 invoices" },
  { label: "Avg. prep time", value: "11 min", sub: "down from 4.2 hrs" },
];

export default function Dashboard() {
  return (
    <PageShell>
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="text-2xs uppercase tracking-[0.18em] text-text-tertiary mb-2">
            May 2026 · Period in progress
          </div>
          <BrandedTitle suffix=" · Owner Billing Operations" />
          <div className="text-text-secondary mt-2 max-w-2xl">
            Six residences · April statements sent · two May invoices already
            arrived and matched. Reconciliation is current as of this morning.
          </div>
        </div>
        <Link
          href="/automation"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-bright shadow-lg shadow-accent/20 transition-colors"
        >
          <Play className="h-3.5 w-3.5" />
          Run automation
        </Link>
      </div>

      <Link
        href="/automation"
        className="block mb-10 rounded-lg border border-accent-border bg-accent-glow/30 hover:bg-accent-glow/50 transition-colors overflow-hidden"
      >
        <div className="grid grid-cols-[1fr_auto] items-center gap-6 px-6 py-5">
          <div>
            <div className="text-2xs uppercase tracking-[0.18em] text-accent-bright mb-1">
              Live automation
            </div>
            <div className="font-display text-lg text-text-primary">
              Pull May statements from {providerSet().length} providers ·{" "}
              {ACCOUNTS.length} accounts · ~11s
            </div>
            <div className="text-xs text-text-secondary mt-1">
              Connect → scrape → parse → match → compute → post. Watch the run
              live or jump to{" "}
              <span className="text-accent-bright">/accounts</span> to see what's
              wired up.
            </div>
          </div>
          <div className="flex items-center gap-2 text-accent-bright">
            <Link2 className="h-4 w-4" />
            <span className="text-2xs uppercase tracking-wider">
              Open runner
            </span>
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
      </Link>

      <div className="grid grid-cols-4 gap-3 mb-10">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-border-subtle bg-bg-raised p-5"
          >
            <div className="text-2xs uppercase tracking-wider text-text-tertiary">
              {s.label}
            </div>
            <div className="font-display text-3xl text-text-primary mt-2 tabular">
              {s.value}
            </div>
            <div className="text-2xs text-text-tertiary mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 rounded-lg border border-border-subtle bg-bg-raised">
          <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
            <div>
              <div className="text-2xs uppercase tracking-wider text-text-tertiary">
                Portfolio
              </div>
              <div className="font-display text-lg text-text-primary mt-0.5">
                April 2026 statements
              </div>
            </div>
            <Link
              href="/residences"
              className="text-2xs uppercase tracking-wider text-accent-bright hover:text-accent"
            >
              All residences →
            </Link>
          </div>
          <div className="divide-y divide-border-subtle">
            {RESIDENCES.map((r) => (
              <Link
                key={r.id}
                href={
                  r.id === "the-glade"
                    ? "/statements/stmt-2026-04-the-glade"
                    : `/residences#${r.id}`
                }
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-bg-subtle/60 transition-colors"
              >
                <div
                  className="h-10 w-10 rounded-md shrink-0 ring-1 ring-black/5 flex items-center justify-center text-white text-2xs font-medium font-display"
                  style={{ backgroundImage: r.hero }}
                >
                  {r.ownerInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-text-primary truncate">
                    {r.name}
                  </div>
                  <div className="text-2xs text-text-tertiary mt-0.5">
                    {r.shortLocation} · {r.sqft.toLocaleString()} sqft ·{" "}
                    {r.staff} staff
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm tabular text-text-primary">
                    {formatUSD(r.monthlyOpCents + r.managementFeeCents)}
                  </div>
                  <div className="text-2xs text-text-tertiary mt-0.5">
                    <StatusPill status={r.status} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border-subtle bg-bg-raised">
          <div className="px-5 py-4 border-b border-border-subtle">
            <div className="text-2xs uppercase tracking-wider text-text-tertiary">
              Activity
            </div>
            <div className="font-display text-lg text-text-primary mt-0.5">
              Last 10 days
            </div>
          </div>
          <ul className="divide-y divide-border-subtle">
            {FEED.map((event) => {
              const r = residenceById(event.residenceId);
              return (
                <li
                  key={event.id}
                  className="px-5 py-3.5 flex items-start gap-3"
                >
                  <FeedIcon kind={event.kind} />
                  <div className="min-w-0 flex-1">
                    <div className="text-2xs uppercase tracking-wider text-text-tertiary">
                      {r?.name ?? "—"}
                    </div>
                    <div className="text-xs text-text-primary mt-0.5 leading-snug">
                      {event.message}
                    </div>
                    <div className="text-2xs text-text-tertiary mt-1 tabular">
                      {formatRelativeTime(event.timestamp)}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </PageShell>
  );
}

function StatusPill({ status }: { status: "current" | "pending" | "exception" }) {
  if (status === "current")
    return (
      <span className="inline-flex items-center gap-1 text-status-success">
        <span className="status-dot bg-status-success" /> Sent
      </span>
    );
  if (status === "pending")
    return (
      <span className="inline-flex items-center gap-1 text-status-warning">
        <Clock className="h-3 w-3" /> Draft
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-status-error">
      <AlertCircle className="h-3 w-3" /> Exception
    </span>
  );
}

function FeedIcon({ kind }: { kind: (typeof FEED)[number]["kind"] }) {
  const cls = "h-4 w-4 shrink-0 mt-0.5";
  if (kind === "owner_paid")
    return <CheckCircle2 className={`${cls} text-status-success`} />;
  if (kind === "exception")
    return <AlertCircle className={`${cls} text-status-error`} />;
  if (kind === "statement_sent")
    return <FileText className={`${cls} text-accent-bright`} />;
  if (kind === "invoice_matched")
    return <CheckCircle2 className={`${cls} text-accent-bright`} />;
  return <Clock className={`${cls} text-text-tertiary`} />;
}
