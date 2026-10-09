import Link from "next/link";
import {
  ArrowUpRight,
  AlertTriangle,
  Clock,
  Calendar,
  Hammer,
  Users,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { BrandedTitle } from "@/components/layout/branded-title";
import {
  RESIDENCES,
  WORK_ORDERS,
  VENDORS,
  workOrdersByStatus,
  vendorById,
  residenceById,
} from "@/lib/data";
import { formatRelativeTime, formatShortDate } from "@/lib/utils";
import { PriorityPill } from "@/components/ui/priority-pill";

export const dynamic = "force-dynamic";

export default function Overview() {
  const grouped = workOrdersByStatus();
  const openCount =
    grouped.new.length +
    grouped.scheduled.length +
    grouped.in_progress.length +
    grouped.awaiting_owner.length;

  const STATS = [
    {
      label: "Open work orders",
      value: openCount.toString(),
      sub: "across 6 residences",
      icon: Hammer,
    },
    {
      label: "Scheduled this week",
      value: grouped.scheduled.length.toString(),
      sub: "next 7 days",
      icon: Calendar,
    },
    {
      label: "Active vendors",
      value: VENDORS.filter((v) => v.status === "active").length.toString(),
      sub: `${VENDORS.length} on roster`,
      icon: Users,
    },
    {
      label: "Vendors flagged",
      value: VENDORS.filter((v) => v.status === "review").length.toString(),
      sub: "under review",
      icon: AlertTriangle,
    },
  ];

  const upNext = [...grouped.scheduled, ...grouped.in_progress]
    .filter((w) => w.scheduledFor)
    .sort((a, b) =>
      (a.scheduledFor ?? "").localeCompare(b.scheduledFor ?? ""),
    )
    .slice(0, 5);

  const awaiting = grouped.awaiting_owner;
  const newOrders = grouped.new;

  return (
    <PageShell>
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="text-2xs uppercase tracking-[0.18em] text-text-tertiary mb-2">
            Tuesday · May 19, 2026
          </div>
          <BrandedTitle suffix=" · Maintenance & Concierge" />
          <div className="text-text-secondary mt-2 max-w-2xl">
            {openCount} open work orders across the portfolio. Three crews on
            site today; one vendor relationship is under review after a
            second pool-heater callback at Meadow House.
          </div>
        </div>
        <Link
          href="/work-orders"
          className="inline-flex items-center gap-1.5 text-sm text-accent-bright hover:text-accent transition-colors"
        >
          Open work orders board
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-10">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="rounded-lg border border-border-subtle bg-bg-raised p-5"
            >
              <div className="flex items-center justify-between">
                <div className="text-2xs uppercase tracking-wider text-text-tertiary">
                  {s.label}
                </div>
                <Icon className="h-3.5 w-3.5 text-text-tertiary" />
              </div>
              <div className="font-display text-3xl text-text-primary mt-2 tabular">
                {s.value}
              </div>
              <div className="text-2xs text-text-tertiary mt-1">{s.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Panel
            label="Today & this week"
            title="Up next"
            href="/work-orders"
            hrefLabel="Open board →"
          >
            <ul className="divide-y divide-border-subtle">
              {upNext.map((wo) => {
                const v = vendorById(wo.vendorId);
                const r = residenceById(wo.residenceId);
                return (
                  <li
                    key={wo.id}
                    className="px-5 py-3.5 flex items-center gap-4"
                  >
                    <div
                      className="h-9 w-9 rounded-md shrink-0 ring-1 ring-black/5 flex items-center justify-center text-white text-2xs font-medium font-display"
                      style={{ backgroundImage: r?.hero }}
                    >
                      {r?.ownerInitials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-text-primary truncate">
                        {wo.title}
                      </div>
                      <div className="text-2xs text-text-tertiary mt-0.5 truncate">
                        {r?.name} · {v?.name} · {wo.trade}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs text-text-primary tabular">
                        {wo.scheduledFor && formatShortDate(wo.scheduledFor)}
                      </div>
                      <div className="text-2xs text-text-tertiary mt-0.5 tabular">
                        {wo.scheduledFor &&
                          formatRelativeTime(wo.scheduledFor)}
                      </div>
                    </div>
                    <div className="shrink-0">
                      <PriorityPill priority={wo.priority} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>

          <Panel
            label="Awaiting owner"
            title={`${awaiting.length} decisions pending`}
            href="/work-orders"
            hrefLabel="Open board →"
          >
            <ul className="divide-y divide-border-subtle">
              {awaiting.map((wo) => {
                const r = residenceById(wo.residenceId);
                return (
                  <li
                    key={wo.id}
                    className="px-5 py-3.5 flex items-start gap-4"
                  >
                    <Clock className="h-4 w-4 text-status-warning shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-text-primary">
                        {wo.title}
                      </div>
                      <div className="text-2xs text-text-tertiary mt-0.5">
                        {r?.name} · raised {formatRelativeTime(wo.createdAt)} ·{" "}
                        {wo.raisedBy}
                      </div>
                      <div className="text-xs text-text-secondary mt-2 leading-relaxed">
                        {wo.notes}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel
            label="Inbox"
            title="New requests"
            href="/work-orders"
            hrefLabel={`${newOrders.length} new →`}
          >
            <ul className="divide-y divide-border-subtle">
              {newOrders.map((wo) => {
                const r = residenceById(wo.residenceId);
                return (
                  <li
                    key={wo.id}
                    className="px-5 py-3.5 flex items-start gap-3"
                  >
                    <span className="status-dot bg-accent mt-1.5" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-text-primary leading-snug">
                        {wo.title}
                      </div>
                      <div className="text-2xs text-text-tertiary mt-1">
                        {r?.name} · {wo.trade} ·{" "}
                        {formatRelativeTime(wo.createdAt)}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>

          <Panel
            label="By residence"
            title="Open per property"
            href="/residences"
            hrefLabel="View all →"
          >
            <ul className="divide-y divide-border-subtle">
              {RESIDENCES.map((r) => {
                const open = WORK_ORDERS.filter(
                  (w) => w.residenceId === r.id && w.status !== "done",
                ).length;
                return (
                  <li key={r.id}>
                    <Link
                      href={`/residences/${r.id}`}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-bg-subtle/60 transition-colors"
                    >
                      <div
                        className="h-7 w-7 rounded-md shrink-0 ring-1 ring-black/5 flex items-center justify-center text-white text-2xs font-medium font-display"
                        style={{ backgroundImage: r.hero }}
                      >
                        {r.ownerInitials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-text-primary truncate">
                          {r.name}
                        </div>
                        <div className="text-2xs text-text-tertiary mt-0.5 truncate">
                          {r.shortLocation}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs text-text-primary tabular">
                          {open}
                        </div>
                        <div className="text-2xs text-text-tertiary">open</div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>
      </div>
    </PageShell>
  );
}

function Panel({
  label,
  title,
  href,
  hrefLabel,
  children,
}: {
  label: string;
  title: string;
  href?: string;
  hrefLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border-subtle bg-bg-raised">
      <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
        <div>
          <div className="text-2xs uppercase tracking-wider text-text-tertiary">
            {label}
          </div>
          <div className="font-display text-lg text-text-primary mt-0.5">
            {title}
          </div>
        </div>
        {href && hrefLabel && (
          <Link
            href={href}
            className="text-2xs uppercase tracking-wider text-accent-bright hover:text-accent"
          >
            {hrefLabel}
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}
