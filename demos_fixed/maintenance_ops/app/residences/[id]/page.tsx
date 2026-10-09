import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Users,
  CheckCircle2,
  Calendar,
  RotateCw,
  ChevronRight,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import {
  residenceById,
  workOrdersFor,
  timelineFor,
  vendorById,
  STATUS_LABEL,
  type TimelineEntry,
  type WorkOrder,
  type WorkOrderStatus,
} from "@/lib/data";
import {
  formatRelativeTime,
  formatLongDate,
  formatShortDate,
  cn,
} from "@/lib/utils";
import { PriorityPill } from "@/components/ui/priority-pill";

export const dynamic = "force-dynamic";

const STATUS_ACCENT: Record<WorkOrderStatus, string> = {
  new: "bg-accent/15 text-accent-bright border-accent-border",
  scheduled: "bg-status-info/15 text-status-info border-status-info/30",
  in_progress: "bg-status-warning/15 text-status-warning border-status-warning/30",
  awaiting_owner: "bg-status-warning/15 text-status-warning border-status-warning/30",
  done: "bg-status-success/15 text-status-success border-status-success/30",
};

export default async function ResidenceDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const residence = residenceById(id);
  if (!residence) notFound();

  const orders = workOrdersFor(residence.id);
  const open = orders.filter((w) => w.status !== "done");
  const timeline = timelineFor(residence.id);

  return (
    <PageShell>
      <Link
        href="/residences"
        className="inline-flex items-center gap-1.5 text-2xs uppercase tracking-wider text-text-tertiary hover:text-text-secondary mb-4"
      >
        <ArrowLeft className="h-3 w-3" />
        All residences
      </Link>

      <div className="rounded-lg border border-border-subtle bg-bg-raised overflow-hidden mb-8">
        <div
          className="h-40 relative"
          style={{ backgroundImage: residence.hero }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
          <div className="absolute bottom-5 left-6 right-6 text-white">
            <div className="text-2xs uppercase tracking-[0.2em] opacity-80">
              {residence.shortLocation}
            </div>
            <div className="font-display text-3xl mt-1">{residence.name}</div>
          </div>
        </div>
        <div className="px-6 py-4 grid grid-cols-4 gap-6 border-b border-border-subtle">
          <Meta icon={MapPin} label="Address" value={residence.address} />
          <Meta
            icon={Users}
            label="Estate manager"
            value={residence.estateManager}
          />
          <Meta
            icon={Users}
            label="Household staff"
            value={`${residence.staff} on payroll`}
          />
          <Meta
            icon={RotateCw}
            label="Recurring services"
            value={`${residence.recurringServices} active`}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <SectionHead label="Timeline" title="Activity · upcoming & recent" />

          <ol className="relative border-l border-border-subtle ml-2 mt-4 space-y-5">
            {timeline.map((entry, i) => (
              <TimelineRow key={i} entry={entry} />
            ))}
            {timeline.length === 0 && (
              <li className="text-sm text-text-tertiary py-4">
                No timeline entries yet.
              </li>
            )}
          </ol>
        </div>

        <aside>
          <SectionHead
            label="Active"
            title={`${open.length} open work orders`}
          />
          <ul className="mt-4 space-y-2">
            {open.map((wo) => (
              <WoCard key={wo.id} wo={wo} />
            ))}
            {open.length === 0 && (
              <li className="text-sm text-text-tertiary py-4">
                Nothing open. Catch your breath.
              </li>
            )}
          </ul>

          <div className="mt-8">
            <SectionHead label="History" title="Recently completed" />
            <ul className="mt-4 space-y-2">
              {orders
                .filter((w) => w.status === "done")
                .map((wo) => (
                  <DoneCard key={wo.id} wo={wo} />
                ))}
            </ul>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}

function Meta({
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
      <div className="flex items-center gap-1 text-2xs uppercase tracking-wider text-text-tertiary">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="text-sm text-text-primary mt-1">{value}</div>
    </div>
  );
}

function SectionHead({ label, title }: { label: string; title: string }) {
  return (
    <div>
      <div className="text-2xs uppercase tracking-wider text-text-tertiary">
        {label}
      </div>
      <div className="font-display text-lg text-text-primary mt-0.5">
        {title}
      </div>
    </div>
  );
}

function TimelineRow({ entry }: { entry: TimelineEntry }) {
  const Icon =
    entry.kind === "completed"
      ? CheckCircle2
      : entry.kind === "scheduled"
      ? Calendar
      : RotateCw;
  const dotCls =
    entry.kind === "completed"
      ? "bg-status-success"
      : entry.kind === "scheduled"
      ? "bg-status-info"
      : "bg-accent-dim";

  return (
    <li className="pl-6 relative">
      <span
        className={cn(
          "absolute left-[-5px] top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-bg-base",
          dotCls,
        )}
      />
      <div className="flex items-start gap-3">
        <Icon className="h-4 w-4 text-text-tertiary shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-2xs uppercase tracking-wider text-text-tertiary">
            <span>{formatLongDate(entry.date.slice(0, 10))}</span>
            <span>·</span>
            <span className="text-text-tertiary">
              {entry.kind === "completed"
                ? "completed"
                : entry.kind === "scheduled"
                ? "scheduled"
                : "recurring"}
            </span>
          </div>
          <div className="text-sm text-text-primary mt-1">{entry.title}</div>
          <div className="text-2xs text-text-tertiary mt-0.5">
            {entry.vendorName} · {entry.trade}
          </div>
          {entry.detail && (
            <div className="text-xs text-text-secondary mt-2 leading-snug">
              {entry.detail}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

function WoCard({ wo }: { wo: WorkOrder }) {
  const v = vendorById(wo.vendorId);
  return (
    <li
      id={`wo-${wo.id}`}
      className="rounded-md border border-border-subtle bg-bg-raised p-3"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span
          className={cn(
            "text-2xs uppercase tracking-wider px-1.5 py-0.5 rounded border",
            STATUS_ACCENT[wo.status],
          )}
        >
          {STATUS_LABEL[wo.status]}
        </span>
        <PriorityPill priority={wo.priority} />
      </div>
      <div className="text-xs text-text-primary leading-snug">{wo.title}</div>
      <div className="text-2xs text-text-tertiary mt-1.5 flex items-center gap-1">
        <ChevronRight className="h-2.5 w-2.5" />
        {v?.name} · {wo.trade}
      </div>
      {wo.scheduledFor && (
        <div className="text-2xs text-text-tertiary mt-1 tabular">
          {formatShortDate(wo.scheduledFor)} ·{" "}
          {formatRelativeTime(wo.scheduledFor)}
        </div>
      )}
    </li>
  );
}

function DoneCard({ wo }: { wo: WorkOrder }) {
  const v = vendorById(wo.vendorId);
  return (
    <li className="rounded-md border border-border-subtle bg-bg-subtle/50 p-3">
      <div className="flex items-center gap-2 text-2xs uppercase tracking-wider text-status-success mb-1">
        <CheckCircle2 className="h-3 w-3" />
        Done
        {wo.scheduledFor && (
          <span className="text-text-tertiary ml-auto tabular">
            {formatShortDate(wo.scheduledFor)}
          </span>
        )}
      </div>
      <div className="text-xs text-text-primary leading-snug">{wo.title}</div>
      <div className="text-2xs text-text-tertiary mt-1">
        {v?.name} · {wo.trade}
      </div>
    </li>
  );
}
