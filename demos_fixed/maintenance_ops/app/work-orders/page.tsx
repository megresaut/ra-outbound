import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import {
  WORK_ORDERS,
  STATUS_LABEL,
  STATUS_ORDER,
  workOrdersByStatus,
  vendorById,
  residenceById,
  type WorkOrder,
  type WorkOrderStatus,
} from "@/lib/data";
import { formatRelativeTime, formatShortDate, cn } from "@/lib/utils";
import { PriorityPill } from "@/components/ui/priority-pill";

export const dynamic = "force-dynamic";

const STATUS_ACCENT: Record<WorkOrderStatus, string> = {
  new: "bg-accent",
  scheduled: "bg-status-info",
  in_progress: "bg-status-warning",
  awaiting_owner: "bg-status-warning/60",
  done: "bg-status-success",
};

export default function WorkOrdersBoard() {
  const grouped = workOrdersByStatus();

  return (
    <PageShell>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="text-2xs uppercase tracking-[0.18em] text-text-tertiary mb-2">
            Work orders · live
          </div>
          <h1 className="font-display text-3xl tracking-tight text-text-primary">
            Maintenance board
          </h1>
          <div className="text-text-secondary mt-2 max-w-2xl">
            {WORK_ORDERS.length} work orders across {STATUS_ORDER.length}{" "}
            columns. Click any card to see vendor coordination, scheduling
            history, and the full conversation thread.
          </div>
        </div>
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-accent text-white hover:bg-accent-bright transition-colors">
          New work order
        </button>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {STATUS_ORDER.map((status) => {
          const orders = grouped[status];
          return (
            <div key={status} className="flex flex-col min-h-[200px]">
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn("h-2 w-2 rounded-full", STATUS_ACCENT[status])}
                  />
                  <span className="text-2xs uppercase tracking-wider text-text-secondary">
                    {STATUS_LABEL[status]}
                  </span>
                </div>
                <span className="text-2xs text-text-tertiary tabular">
                  {orders.length}
                </span>
              </div>

              <ul className="space-y-2">
                {orders.map((wo) => (
                  <Card key={wo.id} wo={wo} />
                ))}
                {orders.length === 0 && (
                  <li className="text-2xs text-text-tertiary italic px-2 py-3">
                    No items
                  </li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}

function Card({ wo }: { wo: WorkOrder }) {
  const v = vendorById(wo.vendorId);
  const r = residenceById(wo.residenceId);

  return (
    <li className="rounded-md border border-border-subtle bg-bg-raised hover:border-accent-border transition-colors">
      <Link
        href={`/residences/${wo.residenceId}#wo-${wo.id}`}
        className="block px-3 py-3"
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div
            className="h-6 w-6 rounded shrink-0 ring-1 ring-black/5 flex items-center justify-center text-white text-[10px] font-medium font-display"
            style={{ backgroundImage: r?.hero }}
          >
            {r?.ownerInitials}
          </div>
          <PriorityPill priority={wo.priority} />
        </div>
        <div className="text-xs text-text-primary leading-snug line-clamp-3">
          {wo.title}
        </div>
        <div className="text-2xs text-text-tertiary mt-2 truncate">
          {r?.name} · {wo.trade}
        </div>
        <div className="flex items-center justify-between mt-2 text-2xs text-text-tertiary">
          <span className="truncate">{v?.name}</span>
          <span className="tabular shrink-0">
            {wo.scheduledFor
              ? formatShortDate(wo.scheduledFor)
              : formatRelativeTime(wo.createdAt)}
          </span>
        </div>
      </Link>
    </li>
  );
}
