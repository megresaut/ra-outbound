import { AlertTriangle, Clock, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export function PriorityPill({
  priority,
}: {
  priority: "routine" | "elevated" | "urgent";
}) {
  if (priority === "urgent")
    return (
      <span className="inline-flex items-center gap-1 text-2xs uppercase tracking-wider px-1.5 py-0.5 rounded border border-status-error/30 bg-status-error/10 text-status-error">
        <AlertTriangle className="h-2.5 w-2.5" /> Urgent
      </span>
    );
  if (priority === "elevated")
    return (
      <span className="inline-flex items-center gap-1 text-2xs uppercase tracking-wider px-1.5 py-0.5 rounded border border-status-warning/30 bg-status-warning/10 text-status-warning">
        <Clock className="h-2.5 w-2.5" /> Elevated
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-2xs uppercase tracking-wider px-1.5 py-0.5 rounded border border-border-subtle bg-bg-subtle text-text-tertiary">
      <Circle className="h-2 w-2" /> Routine
    </span>
  );
}

export function TradeChip({ trade }: { trade: string }) {
  return (
    <span
      className={cn(
        "text-2xs px-1.5 py-0.5 rounded border border-border-subtle bg-bg-subtle text-text-secondary",
      )}
    >
      {trade}
    </span>
  );
}
