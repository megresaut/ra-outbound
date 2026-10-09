import Link from "next/link";
import { MapPin, Users, Building2, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { RESIDENCES, STATEMENTS } from "@/lib/data";
import { formatUSD, formatLongDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function Residences() {
  return (
    <PageShell>
      <div className="mb-8">
        <div className="text-2xs uppercase tracking-[0.18em] text-text-tertiary mb-2">
          Portfolio
        </div>
        <h1 className="font-display text-3xl tracking-tight text-text-primary">
          Residences under management
        </h1>
        <div className="text-text-secondary mt-2 max-w-2xl">
          Six private residences across five states. Each carries its own
          household staff, vendor relationships, and recurring service
          cadence; billing is consolidated monthly per owner.
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {RESIDENCES.map((r) => {
          const stmt = STATEMENTS.find((s) => s.residenceId === r.id);
          const stmtHref = stmt
            ? `/statements/${stmt.id}`
            : `/statements`;
          return (
            <div
              key={r.id}
              id={r.id}
              className="rounded-lg border border-border-subtle bg-bg-raised overflow-hidden flex flex-col"
            >
              <div
                className="h-32 relative"
                style={{ backgroundImage: r.hero }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
                <div className="absolute top-3 right-3">
                  <StatusBadge status={r.status} />
                </div>
                <div className="absolute bottom-3 left-5 right-5 text-white">
                  <div className="font-display text-xl">{r.name}</div>
                  <div className="text-2xs uppercase tracking-wider opacity-80 mt-0.5 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {r.shortLocation}
                  </div>
                </div>
              </div>

              <div className="px-5 py-4 flex-1">
                <div className="text-2xs uppercase tracking-wider text-text-tertiary">
                  {r.ownerDisplay}
                </div>
                <div className="text-xs text-text-secondary mt-1">
                  {r.address}
                </div>

                <dl className="grid grid-cols-3 gap-2 mt-4 text-xs">
                  <Stat
                    icon={Building2}
                    label="Built area"
                    value={`${r.sqft.toLocaleString()} sqft`}
                  />
                  <Stat
                    icon={MapPin}
                    label="Grounds"
                    value={r.acres ? `${r.acres} acres` : "—"}
                  />
                  <Stat
                    icon={Users}
                    label="Staff"
                    value={`${r.staff}`}
                  />
                </dl>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {r.utilities.map((u) => (
                    <span
                      key={u}
                      className="text-2xs px-1.5 py-0.5 rounded border border-border-subtle bg-bg-subtle text-text-secondary"
                    >
                      {u}
                    </span>
                  ))}
                </div>
              </div>

              <div className="px-5 py-3 border-t border-border-subtle bg-bg-subtle/40 flex items-center justify-between">
                <div>
                  <div className="text-2xs uppercase tracking-wider text-text-tertiary">
                    Last statement
                  </div>
                  <div className="text-xs text-text-primary mt-0.5">
                    {formatLongDate(r.lastStatementSentISO)} ·{" "}
                    <span className="tabular">
                      {formatUSD(r.monthlyOpCents + r.managementFeeCents)}
                    </span>
                  </div>
                </div>
                <Link
                  href={stmtHref}
                  className="text-2xs uppercase tracking-wider text-accent-bright hover:text-accent"
                >
                  Open →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 text-2xs text-text-tertiary uppercase tracking-wider">
        <Icon className="h-2.5 w-2.5" />
        {label}
      </div>
      <div className="text-text-primary mt-1 tabular">{value}</div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: "current" | "pending" | "exception";
}) {
  if (status === "current")
    return (
      <span className="inline-flex items-center gap-1 text-2xs uppercase tracking-wider px-1.5 py-0.5 rounded border bg-white/80 backdrop-blur-sm border-white/40 text-status-success">
        <CheckCircle2 className="h-2.5 w-2.5" /> Sent · paid
      </span>
    );
  if (status === "pending")
    return (
      <span className="inline-flex items-center gap-1 text-2xs uppercase tracking-wider px-1.5 py-0.5 rounded border bg-white/80 backdrop-blur-sm border-white/40 text-status-warning">
        <Clock className="h-2.5 w-2.5" /> Draft
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-2xs uppercase tracking-wider px-1.5 py-0.5 rounded border bg-white/80 backdrop-blur-sm border-white/40 text-status-error">
      <AlertCircle className="h-2.5 w-2.5" /> Exception
    </span>
  );
}
