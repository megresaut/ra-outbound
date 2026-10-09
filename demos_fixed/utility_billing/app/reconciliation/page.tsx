import {
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Wand2,
  ArrowRight,
  Inbox,
  Mail,
  Globe,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import {
  RECON_INBOUND,
  RECON_AUTO_MATCHED,
  RECON_EXCEPTIONS,
  RECON_MANUAL,
  RECON_FLAGGED,
} from "@/lib/data";
import { formatUSD, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function Reconciliation() {
  const matchedPct = Math.round((RECON_AUTO_MATCHED / RECON_INBOUND) * 100);

  return (
    <PageShell>
      <div className="mb-8 max-w-3xl">
        <div className="text-2xs uppercase tracking-[0.18em] text-text-tertiary mb-2">
          Reconciliation · April 2026
        </div>
        <h1 className="font-display text-3xl tracking-tight text-text-primary">
          From spreadsheet to automatic
        </h1>
        <div className="text-text-secondary mt-2">
          The old way was a colour-coded workbook the senior bookkeeper
          rebuilt every month. The new way: invoices arrive, the system
          matches them to recurring expenses, and the exception queue is the
          only thing left to review.
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-10">
        <PanelBefore />
        <PanelAfter matchedPct={matchedPct} />
      </div>

      <div className="rounded-lg border border-border-subtle bg-bg-raised">
        <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
          <div>
            <div className="text-2xs uppercase tracking-wider text-text-tertiary">
              Inbox · April
            </div>
            <div className="font-display text-lg text-text-primary mt-0.5">
              How invoices arrive
            </div>
          </div>
          <div className="text-2xs text-text-tertiary tabular">
            {RECON_INBOUND} invoices · 6 residences
          </div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-border-subtle">
          <SourceCol
            icon={Globe}
            label="Utility portals"
            count={104}
            sub="LADWP, PG&E, ConEd, FPL, Holy Cross, Lower Valley, PSEG LI, SoCalGas, National Grid, Optimum, Spectrum, Comcast, …"
          />
          <SourceCol
            icon={Mail}
            label="Vendor email"
            count={62}
            sub="Landscape, pool, security, household maintenance, repairs, supplies"
          />
          <SourceCol
            icon={Inbox}
            label="Manual entry"
            count={18}
            sub="Petty cash, household provisioning, concierge receipts"
          />
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-border-subtle bg-bg-raised">
        <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
          <div>
            <div className="text-2xs uppercase tracking-wider text-text-tertiary">
              Exception queue
            </div>
            <div className="font-display text-lg text-text-primary mt-0.5">
              What still needs a human · {RECON_FLAGGED.length} items
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-2xs uppercase tracking-wider px-2 py-0.5 rounded border border-status-warning/30 bg-status-warning/10 text-status-warning">
            <AlertCircle className="h-3 w-3" />
            Awaiting review
          </span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-2xs uppercase tracking-wider text-text-tertiary border-b border-border-subtle">
              <th className="text-left font-medium px-5 py-3">Invoice</th>
              <th className="text-left font-medium px-3 py-3 w-40">Why flagged</th>
              <th className="text-right font-medium px-3 py-3 w-32">Expected</th>
              <th className="text-right font-medium px-5 py-3 w-32">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {RECON_FLAGGED.map((row) => (
              <tr key={row.invoice} className="hover:bg-bg-subtle/40">
                <td className="px-5 py-3">
                  <div className="text-text-primary">{row.invoice}</div>
                  <div className="text-2xs text-text-tertiary mt-0.5">
                    {row.vendor}
                  </div>
                </td>
                <td className="px-3 py-3 text-xs text-text-secondary">
                  {row.reason}
                </td>
                <td className="px-3 py-3 text-right tabular text-text-tertiary text-xs">
                  {row.expected > 0 ? formatUSD(row.expected) : "—"}
                </td>
                <td className="px-5 py-3 text-right tabular text-text-primary">
                  {formatUSD(row.amountCents)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}

function PanelBefore() {
  return (
    <div className="rounded-lg border border-border-subtle bg-bg-raised overflow-hidden">
      <div className="px-5 py-4 border-b border-border-subtle flex items-center gap-2">
        <FileSpreadsheet className="h-4 w-4 text-text-tertiary" />
        <div className="text-2xs uppercase tracking-wider text-text-tertiary">
          Before
        </div>
        <div className="font-display text-base text-text-primary ml-auto">
          owner_recon_APR2026_v7.xlsx
        </div>
      </div>
      <div className="p-5">
        <div className="rounded-md border border-border-subtle overflow-hidden font-mono text-2xs">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] bg-bg-subtle border-b border-border-subtle">
            <div className="px-2 py-1.5 text-text-tertiary">Vendor</div>
            <div className="px-2 py-1.5 text-text-tertiary text-right">Apr</div>
            <div className="px-2 py-1.5 text-text-tertiary text-right">Mar</div>
            <div className="px-2 py-1.5 text-text-tertiary text-right">∆</div>
          </div>
          {[
            ["LADWP", "$4,842", "$4,610", "+5%"],
            ["SoCalGas", "$2,184", "$2,160", "+1%"],
            ["Mariposa Gardens", "$12,480", "$12,480", "0%"],
            ["Westside Aquatic", "$1,840", "$1,840", "0%"],
            ["BH Protective", "$6,420", "$6,420", "0%"],
            ["Crown Mech", "$1,448", "—", "NEW"],
            ["Optimum (Meadow)", "$712", "$514", "+38%"],
            ["FPL (Mariposa)", "$3,482", "$2,680", "+30%"],
            ["?? (manual)", "$1,874", "—", "?"],
          ].map((row, i) => (
            <div
              key={i}
              className={cn(
                "grid grid-cols-[2fr_1fr_1fr_1fr] border-b border-border-subtle/60",
                i % 2 === 1 && "bg-bg-subtle/30",
                (row[3] === "NEW" || row[3] === "?" || row[3]?.startsWith("+3")) &&
                  "bg-yellow-50/70",
              )}
            >
              <div className="px-2 py-1 text-text-primary truncate">
                {row[0]}
              </div>
              <div className="px-2 py-1 text-right tabular">{row[1]}</div>
              <div className="px-2 py-1 text-right tabular text-text-tertiary">
                {row[2]}
              </div>
              <div className="px-2 py-1 text-right tabular text-text-secondary">
                {row[3]}
              </div>
            </div>
          ))}
        </div>
        <ul className="mt-4 space-y-1.5 text-xs text-text-secondary">
          <li className="flex gap-2">
            <span className="text-text-tertiary">·</span>
            Senior bookkeeper rebuilt this every month
          </li>
          <li className="flex gap-2">
            <span className="text-text-tertiary">·</span>4–6 hours per residence
          </li>
          <li className="flex gap-2">
            <span className="text-text-tertiary">·</span>
            Owner statements drafted from this sheet, copy-pasted to letterhead
          </li>
          <li className="flex gap-2">
            <span className="text-text-tertiary">·</span>
            Receipts attached as a PDF bundle — emailed separately
          </li>
        </ul>
      </div>
    </div>
  );
}

function PanelAfter({ matchedPct }: { matchedPct: number }) {
  return (
    <div className="rounded-lg border border-accent-border bg-bg-raised overflow-hidden">
      <div className="px-5 py-4 border-b border-border-subtle flex items-center gap-2">
        <Wand2 className="h-4 w-4 text-accent" />
        <div className="text-2xs uppercase tracking-wider text-accent-bright">
          After
        </div>
        <div className="font-display text-base text-text-primary ml-auto">
          April reconciliation · automatic
        </div>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-4 gap-3 mb-5">
          <Counter label="Inbound" value={RECON_INBOUND.toString()} sub="invoices" />
          <Counter
            label="Auto-matched"
            value={`${matchedPct}%`}
            sub={`${RECON_AUTO_MATCHED} of ${RECON_INBOUND}`}
            tone="success"
          />
          <Counter
            label="Exceptions"
            value={RECON_EXCEPTIONS.toString()}
            sub="flagged"
            tone="warning"
          />
          <Counter
            label="Manual"
            value={RECON_MANUAL.toString()}
            sub="awaiting category"
          />
        </div>

        <ul className="space-y-2.5 text-xs">
          <Step icon={Inbox} label="Invoices arrive">
            Portal pulls, vendor email forwards, manual receipts
          </Step>
          <Step icon={ArrowRight} label="Match to recurring">
            Each line item linked to its rolling 90-day baseline
          </Step>
          <Step icon={AlertCircle} label="Flag anomalies">
            ±20% deltas, new vendors, missing periods, duplicates
          </Step>
          <Step icon={CheckCircle2} label="Draft statements" highlight>
            Estate manager reviews exceptions, statements send on the 3rd
          </Step>
        </ul>

        <div className="mt-5 pt-4 border-t border-border-subtle text-2xs text-text-tertiary leading-relaxed">
          What's preserved from the spreadsheet era: per-line audit trail,
          variance vs. prior month, and the same total numbers — just
          arrived at without the rebuild.
        </div>
      </div>
    </div>
  );
}

function Counter({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone?: "success" | "warning";
}) {
  const toneCls =
    tone === "success"
      ? "text-status-success"
      : tone === "warning"
      ? "text-status-warning"
      : "text-text-primary";
  return (
    <div className="rounded-md border border-border-subtle bg-bg-base px-3 py-2.5">
      <div className="text-2xs uppercase tracking-wider text-text-tertiary">
        {label}
      </div>
      <div className={cn("font-display text-xl mt-1 tabular", toneCls)}>
        {value}
      </div>
      <div className="text-2xs text-text-tertiary mt-0.5">{sub}</div>
    </div>
  );
}

function Step({
  icon: Icon,
  label,
  children,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <li className="flex items-start gap-3">
      <span
        className={cn(
          "h-6 w-6 rounded-md flex items-center justify-center shrink-0 mt-0.5",
          highlight
            ? "bg-accent text-white"
            : "bg-bg-subtle text-text-tertiary border border-border-subtle",
        )}
      >
        <Icon className="h-3 w-3" />
      </span>
      <div>
        <div className="text-text-primary">{label}</div>
        <div className="text-text-tertiary mt-0.5 leading-snug">{children}</div>
      </div>
    </li>
  );
}

function SourceCol({
  icon: Icon,
  label,
  count,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  count: number;
  sub: string;
}) {
  return (
    <div className="px-5 py-5">
      <div className="flex items-center gap-2 text-2xs uppercase tracking-wider text-text-tertiary">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="font-display text-3xl text-text-primary mt-2 tabular">
        {count}
      </div>
      <div className="text-2xs text-text-tertiary mt-2 leading-relaxed">
        {sub}
      </div>
    </div>
  );
}
