import { PageShell } from "@/components/layout/page-shell";
import { generateTechs } from "@/lib/fake-data";
import { verticalPacks } from "@/config/verticals";
import { demoConfig } from "@/config/demo.config";
import { Star, Truck, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_META = {
  on_job: { label: "On a job", dot: "bg-accent" },
  traveling: { label: "Traveling", dot: "bg-status-warning" },
  available: { label: "Available", dot: "bg-status-success" },
  off: { label: "Off today", dot: "bg-text-dim" },
} as const;

export default function TechniciansPage() {
  const pack = verticalPacks[demoConfig.vertical];
  const techs = generateTechs();

  const grouped = techs.reduce((acc, t) => {
    (acc[t.status] ??= []).push(t);
    return acc;
  }, {} as Record<string, typeof techs>);

  const order: Array<keyof typeof STATUS_META> = [
    "on_job",
    "traveling",
    "available",
    "off",
  ];

  const totalActive = techs.filter((t) => t.status !== "off").length;

  return (
    <PageShell>
      <div className="mb-6">
        <div className="text-xs uppercase tracking-wider text-text-tertiary mb-2">
          {pack.workerNoun.plural[0].toUpperCase() + pack.workerNoun.plural.slice(1)}
        </div>
        <h1 className="font-display text-3xl text-text-primary">
          Roster
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          {techs.length} {pack.workerNoun.plural} · {totalActive} active today
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
        {order.map((status) => (
          <KpiTile
            key={status}
            label={STATUS_META[status].label}
            value={(grouped[status] ?? []).length.toString()}
            dotClass={STATUS_META[status].dot}
          />
        ))}
      </div>

      <div className="space-y-8">
        {order.map((status) => {
          const list = grouped[status] ?? [];
          if (list.length === 0) return null;
          return (
            <section key={status}>
              <div className="flex items-center gap-3 mb-3">
                <span className={cn("status-dot", STATUS_META[status].dot)} />
                <h2 className="text-sm font-medium text-text-primary">
                  {STATUS_META[status].label}
                </h2>
                <div className="text-2xs text-text-tertiary">
                  {list.length} {pack.workerNoun.plural}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {list.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-lg border border-border-subtle bg-bg-raised p-4 hover:border-border-strong transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-semibold border border-accent-border bg-accent-glow text-accent-bright"
                      >
                        {t.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-text-primary truncate">
                          {t.name}
                        </div>
                        <div className="text-2xs text-text-tertiary flex items-center gap-1">
                          <Truck className="h-3 w-3" /> {t.truck}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-2xs text-status-warning shrink-0">
                        <Star className="h-3 w-3 fill-current" />
                        <span className="tabular">{t.rating}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {t.skills.map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-2xs border border-border bg-bg-subtle text-text-secondary"
                        >
                          {s}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-2xs text-text-tertiary border-t border-border-subtle pt-2.5">
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        <span className="tabular">{t.jobsToday}</span> today
                      </span>
                      <span>
                        <span className="tabular">{t.jobsThisWeek}</span> this week
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </PageShell>
  );
}

function KpiTile({
  label,
  value,
  dotClass,
}: {
  label: string;
  value: string;
  dotClass: string;
}) {
  return (
    <div className="rounded-lg border border-border-subtle bg-bg-raised p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className={cn("status-dot", dotClass)} />
        <div className="text-xs text-text-tertiary">{label}</div>
      </div>
      <div className="font-display text-2xl tabular text-text-primary">
        {value}
      </div>
    </div>
  );
}
