import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { RESIDENCES, STATEMENTS, statementTotalCents } from "@/lib/data";
import { formatUSD, formatLongDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function StatementsIndex() {
  const stmt = STATEMENTS[0];
  const total = statementTotalCents(stmt);

  return (
    <PageShell>
      <div className="mb-8">
        <div className="text-2xs uppercase tracking-[0.18em] text-text-tertiary mb-2">
          Statements
        </div>
        <h1 className="font-display text-3xl tracking-tight text-text-primary">
          April 2026 owner statements
        </h1>
        <div className="text-text-secondary mt-2 max-w-2xl">
          Six statements prepared from 184 invoices. Five sent on the 3rd; one
          remains in draft pending a category assignment on a manual provisioning
          expense.
        </div>
      </div>

      <div className="rounded-lg border border-border-subtle bg-bg-raised divide-y divide-border-subtle">
        {RESIDENCES.map((r) => {
          const isLatest = r.id === stmt.residenceId;
          const href = isLatest
            ? `/statements/${stmt.id}`
            : `/residences#${r.id}`;
          const amount = isLatest
            ? total
            : r.monthlyOpCents + r.managementFeeCents;
          return (
            <Link
              key={r.id}
              href={href}
              className="flex items-center gap-4 px-5 py-4 hover:bg-bg-subtle/60 transition-colors"
            >
              <div
                className="h-11 w-11 rounded-md shrink-0 ring-1 ring-black/5 flex items-center justify-center text-white text-xs font-medium font-display"
                style={{ backgroundImage: r.hero }}
              >
                {r.ownerInitials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-text-primary truncate">
                  {r.name}
                </div>
                <div className="text-2xs text-text-tertiary mt-0.5">
                  {r.ownerDisplay} · {formatLongDate(r.lastStatementSentISO)}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm tabular text-text-primary">
                  {formatUSD(amount)}
                </div>
                <div className="text-2xs mt-0.5">
                  {r.status === "current" && (
                    <span className="text-status-success">Sent · paid</span>
                  )}
                  {r.status === "pending" && (
                    <span className="text-status-warning">Draft · in review</span>
                  )}
                  {r.status === "exception" && (
                    <span className="text-status-error">Exception flagged</span>
                  )}
                </div>
              </div>
              {isLatest && (
                <ArrowUpRight className="h-4 w-4 text-text-tertiary shrink-0" />
              )}
            </Link>
          );
        })}
      </div>
    </PageShell>
  );
}
