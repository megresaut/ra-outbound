import { Star, Phone, MapPin, AlertTriangle, CheckCircle2, Pause } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { VENDORS, residenceById, type Vendor } from "@/lib/data";
import { formatRelativeTime, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function VendorsList() {
  const byStatus = {
    active: VENDORS.filter((v) => v.status === "active"),
    standby: VENDORS.filter((v) => v.status === "standby"),
    review: VENDORS.filter((v) => v.status === "review"),
  };

  return (
    <PageShell>
      <div className="mb-8">
        <div className="text-2xs uppercase tracking-[0.18em] text-text-tertiary mb-2">
          Vendor roster
        </div>
        <h1 className="font-display text-3xl tracking-tight text-text-primary">
          {VENDORS.length} vendors across six properties
        </h1>
        <div className="text-text-secondary mt-2 max-w-2xl">
          Trade, region, last visit, and the residences they serve. Vendors
          on review status need a second-opinion bid or a closeout
          conversation.
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatusSummary
          icon={CheckCircle2}
          label="Active"
          count={byStatus.active.length}
          tone="success"
        />
        <StatusSummary
          icon={Pause}
          label="Standby"
          count={byStatus.standby.length}
          tone="neutral"
        />
        <StatusSummary
          icon={AlertTriangle}
          label="Under review"
          count={byStatus.review.length}
          tone="warning"
        />
      </div>

      <div className="rounded-lg border border-border-subtle bg-bg-raised overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-2xs uppercase tracking-wider text-text-tertiary border-b border-border-subtle">
              <th className="text-left font-medium px-5 py-3">Vendor</th>
              <th className="text-left font-medium px-3 py-3 w-32">Trade</th>
              <th className="text-left font-medium px-3 py-3 w-40">Region</th>
              <th className="text-left font-medium px-3 py-3">Serves</th>
              <th className="text-right font-medium px-3 py-3 w-28">
                Satisfaction
              </th>
              <th className="text-right font-medium px-3 py-3 w-24">Jobs</th>
              <th className="text-right font-medium px-3 py-3 w-28">
                Last visit
              </th>
              <th className="text-right font-medium px-5 py-3 w-32">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {VENDORS.map((v) => (
              <VendorRow key={v.id} vendor={v} />
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}

function VendorRow({ vendor }: { vendor: Vendor }) {
  return (
    <tr className="hover:bg-bg-subtle/40">
      <td className="px-5 py-3 align-top">
        <div className="text-text-primary">{vendor.name}</div>
        <div className="text-2xs text-text-tertiary mt-0.5 flex items-center gap-1">
          <Phone className="h-2.5 w-2.5" />
          {vendor.primaryContact}
        </div>
      </td>
      <td className="px-3 py-3 align-top text-text-secondary text-xs">
        {vendor.trade}
      </td>
      <td className="px-3 py-3 align-top text-text-secondary text-xs">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-2.5 w-2.5 text-text-tertiary" />
          {vendor.region}
        </span>
      </td>
      <td className="px-3 py-3 align-top">
        <div className="flex flex-wrap gap-1">
          {vendor.serves.map((rid) => {
            const r = residenceById(rid);
            if (!r) return null;
            return (
              <span
                key={rid}
                className="text-2xs px-1.5 py-0.5 rounded border border-border-subtle bg-bg-subtle text-text-secondary"
                title={r.shortLocation}
              >
                {r.name}
              </span>
            );
          })}
        </div>
      </td>
      <td className="px-3 py-3 align-top text-right">
        <div className="inline-flex items-center gap-1 tabular text-text-primary">
          <Star className="h-3 w-3 text-accent" />
          <span>{vendor.satisfaction.toFixed(1)}</span>
        </div>
      </td>
      <td className="px-3 py-3 align-top text-right tabular text-text-secondary text-xs">
        {vendor.jobsYTD}
      </td>
      <td className="px-3 py-3 align-top text-right tabular text-text-secondary text-xs">
        {formatRelativeTime(vendor.lastVisit)}
      </td>
      <td className="px-5 py-3 align-top text-right">
        <StatusPill status={vendor.status} />
      </td>
    </tr>
  );
}

function StatusPill({ status }: { status: Vendor["status"] }) {
  if (status === "active")
    return (
      <span className="inline-flex items-center gap-1 text-2xs uppercase tracking-wider px-1.5 py-0.5 rounded border border-status-success/30 bg-status-success/10 text-status-success">
        <span className="status-dot bg-status-success" /> Active
      </span>
    );
  if (status === "standby")
    return (
      <span className="inline-flex items-center gap-1 text-2xs uppercase tracking-wider px-1.5 py-0.5 rounded border border-border-subtle bg-bg-subtle text-text-tertiary">
        <Pause className="h-2.5 w-2.5" /> Standby
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-2xs uppercase tracking-wider px-1.5 py-0.5 rounded border border-status-warning/30 bg-status-warning/10 text-status-warning">
      <AlertTriangle className="h-2.5 w-2.5" /> Review
    </span>
  );
}

function StatusSummary({
  icon: Icon,
  label,
  count,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  count: number;
  tone: "success" | "neutral" | "warning";
}) {
  const tones = {
    success: "text-status-success",
    neutral: "text-text-primary",
    warning: "text-status-warning",
  };
  return (
    <div className="rounded-lg border border-border-subtle bg-bg-raised px-5 py-4 flex items-center gap-4">
      <Icon className={cn("h-4 w-4", tones[tone])} />
      <div className="flex-1">
        <div className="text-2xs uppercase tracking-wider text-text-tertiary">
          {label}
        </div>
        <div
          className={cn(
            "font-display text-2xl tabular",
            tones[tone],
          )}
        >
          {count}
        </div>
      </div>
    </div>
  );
}
