import Link from "next/link";
import { MapPin, Users, Hammer } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { RESIDENCES, WORK_ORDERS } from "@/lib/data";

export const dynamic = "force-dynamic";

export default function ResidencesIndex() {
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
          Six private residences. Click any to see its full maintenance
          timeline, recurring service cadence, and active work orders.
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {RESIDENCES.map((r) => {
          const open = WORK_ORDERS.filter(
            (w) => w.residenceId === r.id && w.status !== "done",
          ).length;
          return (
            <Link
              key={r.id}
              href={`/residences/${r.id}`}
              className="rounded-lg border border-border-subtle bg-bg-raised overflow-hidden hover:border-accent-border transition-colors"
            >
              <div
                className="h-32 relative"
                style={{ backgroundImage: r.hero }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
                <div className="absolute bottom-3 left-5 right-5 text-white">
                  <div className="font-display text-xl">{r.name}</div>
                  <div className="text-2xs uppercase tracking-wider opacity-80 mt-0.5 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {r.shortLocation}
                  </div>
                </div>
              </div>
              <div className="px-5 py-4 grid grid-cols-3 gap-2 text-xs">
                <Stat icon={Hammer} label="Open" value={`${open}`} />
                <Stat
                  icon={Users}
                  label="Staff"
                  value={`${r.staff}`}
                />
                <Stat
                  icon={Hammer}
                  label="Recurring"
                  value={`${r.recurringServices}`}
                />
              </div>
              <div className="px-5 py-3 border-t border-border-subtle bg-bg-subtle/40 text-2xs text-text-tertiary truncate">
                Estate manager · {r.estateManager}
              </div>
            </Link>
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
      <div className="text-text-primary mt-1 tabular font-display text-base">
        {value}
      </div>
    </div>
  );
}
