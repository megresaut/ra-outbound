import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Mail,
  Download,
  FileText,
  Sparkles,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import {
  STATEMENTS,
  residenceById,
  statementSubtotalCents,
  statementTotalCents,
} from "@/lib/data";
import {
  formatUSD,
  formatUSDPrecise,
  formatLongDate,
  formatMonthDay,
  cn,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

const CATEGORY_LABEL: Record<string, string> = {
  utility: "Utility",
  grounds: "Grounds",
  pool: "Pool",
  security: "Security",
  staff: "Household staff",
  repair: "Repair",
  supplies: "Supplies",
  fee: "Management fee",
};

const SOURCE_LABEL: Record<string, string> = {
  portal: "Portal pull",
  email: "Email forward",
  manual: "Manual entry",
  computed: "Computed",
};

export default async function StatementDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const stmt = STATEMENTS.find((s) => s.id === id);
  if (!stmt) notFound();
  const residence = residenceById(stmt.residenceId);
  if (!residence) notFound();

  const subtotal = statementSubtotalCents(stmt);
  const total = statementTotalCents(stmt);
  const feeLine = stmt.lineItems.find((li) => li.category === "fee");

  // Group by category for summary
  const byCategory = new Map<string, number>();
  for (const li of stmt.lineItems) {
    if (li.category === "fee") continue;
    byCategory.set(
      li.category,
      (byCategory.get(li.category) ?? 0) + li.amountCents,
    );
  }
  const categoryRows = Array.from(byCategory.entries()).sort(
    (a, b) => b[1] - a[1],
  );

  return (
    <PageShell>
      <Link
        href="/statements"
        className="inline-flex items-center gap-1.5 text-2xs uppercase tracking-wider text-text-tertiary hover:text-text-secondary mb-4"
      >
        <ArrowLeft className="h-3 w-3" />
        All statements
      </Link>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="rounded-lg border border-border-subtle bg-bg-raised overflow-hidden">
            <div
              className="h-24 relative"
              style={{ backgroundImage: residence.hero }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
              <div className="absolute bottom-3 left-5 right-5 text-white">
                <div className="text-2xs uppercase tracking-[0.2em] opacity-80">
                  Owner statement · {stmt.periodLabel}
                </div>
                <div className="font-display text-2xl mt-0.5">
                  {residence.name}
                </div>
              </div>
            </div>
            <div className="px-5 py-4 grid grid-cols-3 gap-4 border-b border-border-subtle">
              <div>
                <div className="text-2xs uppercase tracking-wider text-text-tertiary">
                  Billed to
                </div>
                <div className="text-sm text-text-primary mt-1">
                  {stmt.ownerName}
                </div>
                <div className="text-2xs text-text-tertiary mt-0.5">
                  {stmt.ownerEmail}
                </div>
              </div>
              <div>
                <div className="text-2xs uppercase tracking-wider text-text-tertiary">
                  Service period
                </div>
                <div className="text-sm text-text-primary mt-1">
                  {formatMonthDay(stmt.periodStart)} —{" "}
                  {formatMonthDay(stmt.periodEnd)}, 2026
                </div>
                <div className="text-2xs text-text-tertiary mt-0.5">
                  {residence.address}
                </div>
              </div>
              <div>
                <div className="text-2xs uppercase tracking-wider text-text-tertiary">
                  Statement sent
                </div>
                <div className="text-sm text-text-primary mt-1 inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-status-success" />
                  {stmt.sentDate ? formatLongDate(stmt.sentDate) : "Not yet sent"}
                </div>
                <div className="text-2xs text-text-tertiary mt-0.5">
                  Prepared {formatLongDate(stmt.preparedDate)}
                </div>
              </div>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="text-2xs uppercase tracking-wider text-text-tertiary border-b border-border-subtle">
                  <th className="text-left font-medium px-5 py-3">Item</th>
                  <th className="text-left font-medium px-3 py-3 w-32">
                    Vendor
                  </th>
                  <th className="text-left font-medium px-3 py-3 w-24">Date</th>
                  <th className="text-right font-medium px-3 py-3 w-28">
                    Source
                  </th>
                  <th className="text-right font-medium px-5 py-3 w-32">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {stmt.lineItems
                  .filter((li) => li.category !== "fee")
                  .map((li) => (
                    <tr key={li.id} className="hover:bg-bg-subtle/40">
                      <td className="px-5 py-3 align-top">
                        <div className="text-text-primary">
                          {li.description}
                        </div>
                        <div className="text-2xs text-text-tertiary mt-0.5">
                          {CATEGORY_LABEL[li.category]} · {li.invoiceRef}
                        </div>
                      </td>
                      <td className="px-3 py-3 align-top text-text-secondary text-xs">
                        {li.vendor}
                      </td>
                      <td className="px-3 py-3 align-top text-text-secondary text-xs tabular">
                        {formatMonthDay(li.serviceDate)}
                      </td>
                      <td className="px-3 py-3 align-top text-right">
                        <SourceBadge
                          source={li.source}
                          confidence={li.matchConfidence}
                        />
                      </td>
                      <td className="px-5 py-3 align-top text-right tabular text-text-primary">
                        {formatUSDPrecise(li.amountCents)}
                      </td>
                    </tr>
                  ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border">
                  <td colSpan={4} className="px-5 py-3 text-right text-text-secondary text-xs">
                    Subtotal (pass-through operating costs)
                  </td>
                  <td className="px-5 py-3 text-right tabular text-text-primary">
                    {formatUSDPrecise(subtotal)}
                  </td>
                </tr>
                {feeLine && (
                  <tr>
                    <td colSpan={4} className="px-5 py-3 text-right text-text-secondary text-xs">
                      Management fee ·{" "}
                      {(stmt.managementFeeRate * 100).toFixed(1)}%
                    </td>
                    <td className="px-5 py-3 text-right tabular text-text-primary">
                      {formatUSDPrecise(feeLine.amountCents)}
                    </td>
                  </tr>
                )}
                <tr className="bg-bg-subtle/50">
                  <td colSpan={4} className="px-5 py-4 text-right font-display text-base text-text-primary">
                    Total due from owner
                  </td>
                  <td className="px-5 py-4 text-right font-display text-base tabular text-text-primary">
                    {formatUSDPrecise(total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {stmt.notes && (
            <div className="rounded-lg border border-accent-border bg-accent-glow/40 px-5 py-4">
              <div className="text-2xs uppercase tracking-wider text-accent-bright mb-1.5">
                Note to owner
              </div>
              <div className="text-sm text-text-primary leading-relaxed">
                {stmt.notes}
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-5">
          <div className="rounded-lg border border-border-subtle bg-bg-raised p-5">
            <div className="text-2xs uppercase tracking-wider text-text-tertiary">
              Total due
            </div>
            <div className="font-display text-3xl text-text-primary mt-1 tabular">
              {formatUSD(total)}
            </div>
            <div className="text-2xs text-text-tertiary mt-1.5">
              Payable on receipt · ACH or wire
            </div>
            <div className="mt-4 space-y-2">
              <button className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-md bg-accent text-white hover:bg-accent-bright transition-colors">
                <Mail className="h-3.5 w-3.5" />
                Resend to owner
              </button>
              <button className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-md border border-border bg-bg-raised text-text-primary hover:bg-bg-subtle transition-colors">
                <Download className="h-3.5 w-3.5" />
                Download PDF
              </button>
              <button className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-md border border-border bg-bg-raised text-text-primary hover:bg-bg-subtle transition-colors">
                <FileText className="h-3.5 w-3.5" />
                Export backup pack
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-border-subtle bg-bg-raised">
            <div className="px-5 py-4 border-b border-border-subtle">
              <div className="text-2xs uppercase tracking-wider text-text-tertiary">
                Cost mix
              </div>
              <div className="font-display text-base text-text-primary mt-0.5">
                Where the spend went
              </div>
            </div>
            <ul className="px-5 py-3 space-y-2">
              {categoryRows.map(([cat, cents]) => {
                const pct = (cents / subtotal) * 100;
                return (
                  <li key={cat}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary">
                        {CATEGORY_LABEL[cat]}
                      </span>
                      <span className="tabular text-text-primary">
                        {formatUSD(cents)}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-bg-subtle overflow-hidden">
                      <div
                        className="h-full bg-accent"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-lg border border-border-subtle bg-bg-raised p-5">
            <div className="flex items-center gap-1.5 text-2xs uppercase tracking-wider text-accent-bright">
              <Sparkles className="h-3 w-3" />
              How this was built
            </div>
            <ul className="mt-3 space-y-2.5 text-xs text-text-secondary">
              <li className="flex gap-2">
                <span className="text-accent-bright tabular">01</span>
                <span>
                  11 invoices auto-pulled from utility portals and vendor
                  email forwards
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent-bright tabular">02</span>
                <span>
                  Each invoice matched to its expected recurring expense; one
                  off-pattern line flagged
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent-bright tabular">03</span>
                <span>
                  Management fee computed at 7.5% of pass-through costs
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent-bright tabular">04</span>
                <span>
                  Statement drafted, reviewed by an estate manager, sent on the
                  3rd
                </span>
              </li>
            </ul>
            <div className="mt-3 text-2xs text-text-tertiary border-t border-border-subtle pt-3">
              End-to-end: 11 minutes. Previously 4–6 hours per residence.
            </div>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}

function SourceBadge({
  source,
  confidence,
}: {
  source: "portal" | "email" | "manual" | "computed";
  confidence: number;
}) {
  const tone =
    source === "manual"
      ? "border-status-warning/30 bg-status-warning/10 text-status-warning"
      : confidence >= 0.95
      ? "border-status-success/30 bg-status-success/10 text-status-success"
      : "border-border bg-bg-subtle text-text-secondary";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-2xs px-1.5 py-0.5 rounded border tabular",
        tone,
      )}
    >
      {SOURCE_LABEL[source]} · {Math.round(confidence * 100)}%
    </span>
  );
}
