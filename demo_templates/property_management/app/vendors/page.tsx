"use client";

import { useState, useMemo } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { generateVendors } from "@/lib/fake-data";
import {
  Star,
  Briefcase,
  Clock,
  X,
  Plus,
  Phone,
  Mail,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Vendor = ReturnType<typeof generateVendors>[number];

export default function VendorsPage() {
  const vendors = useMemo(() => generateVendors(), []);
  const [selected, setSelected] = useState<Vendor | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  // Group by type
  const byType = useMemo(
    () =>
      vendors.reduce((acc, v) => {
        (acc[v.type] ??= []).push(v);
        return acc;
      }, {} as Record<string, Vendor[]>),
    [vendors]
  );

  return (
    <PageShell>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-text-tertiary mb-2">
            Vendors
          </div>
          <h1 className="font-display text-3xl text-text-primary">
            Vendor directory
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            {vendors.length} active vendors · automated dispatch and invoice
            review
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-bright"
        >
          <Plus className="h-4 w-4" />
          Add vendor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
        <KpiTile label="Active vendors" value={vendors.length.toString()} />
        <KpiTile
          label="Open jobs"
          value={vendors.reduce((s, v) => s + v.activeJobs, 0).toString()}
        />
        <KpiTile
          label="Avg response"
          value={`${Math.round(
            vendors.reduce((s, v) => s + parseInt(v.avgResponse), 0) /
              vendors.length
          )}h`}
          accent
        />
      </div>

      <div className="space-y-8">
        {Object.entries(byType).map(([type, list]) => (
          <section key={type}>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-sm font-medium text-text-primary">{type}</h2>
              <div className="text-2xs text-text-tertiary">
                {list.length} vendor{list.length === 1 ? "" : "s"}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {list.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelected(v)}
                  className="text-left rounded-lg border border-border-subtle bg-bg-raised p-4 hover:border-accent-border transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-sm font-medium text-text-primary">
                      {v.name}
                    </div>
                    <div className="flex items-center gap-1 text-2xs text-status-warning">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="tabular">{v.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-2xs text-text-tertiary">
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      <span className="tabular">{v.activeJobs}</span> jobs
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span className="tabular">{v.avgResponse}</span> avg
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      {selected && (
        <VendorDetail vendor={selected} onClose={() => setSelected(null)} />
      )}

      {showAdd && <AddVendorModal onClose={() => setShowAdd(false)} />}
    </PageShell>
  );
}

function KpiTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        accent
          ? "border-accent-border bg-accent-glow"
          : "border-border-subtle bg-bg-raised"
      )}
    >
      <div className="text-xs text-text-tertiary mb-2">{label}</div>
      <div
        className={cn(
          "font-display text-2xl tabular",
          accent ? "text-accent-bright" : "text-text-primary"
        )}
      >
        {value}
      </div>
    </div>
  );
}

function VendorDetail({
  vendor,
  onClose,
}: {
  vendor: Vendor;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md h-full bg-bg-raised border-l border-border overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-border-subtle flex items-start justify-between">
          <div>
            <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-1">
              {vendor.type}
            </div>
            <div className="font-display text-xl text-text-primary">
              {vendor.name}
            </div>
            <div className="flex items-center gap-1 text-xs text-status-warning mt-1">
              <Star className="h-3 w-3 fill-current" />
              <span className="tabular">{vendor.rating}</span>
              <span className="text-text-tertiary">/ 5.0</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <DetailStat label="Active jobs" value={vendor.activeJobs.toString()} />
            <DetailStat
              label="Avg response"
              value={vendor.avgResponse}
              accent
            />
          </div>

          <div>
            <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-2">
              Contact
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-text-secondary">
                <Phone className="h-3 w-3 text-text-tertiary" />
                (512) 555-{1000 + (vendor.id.length * 37) % 9000}
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <Mail className="h-3 w-3 text-text-tertiary" />
                dispatch@
                {vendor.name.toLowerCase().replace(/[^a-z]/g, "")}.com
              </div>
            </div>
          </div>

          <div>
            <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-2">
              Recent jobs
            </div>
            <div className="space-y-2 text-xs">
              <JobLine
                title="Leaking faucet repair"
                meta="4421 Maple Ave · 2d ago"
                done
              />
              <JobLine
                title="HVAC quarterly service"
                meta="9034 Cedar Ln · 5d ago"
                done
              />
              <JobLine
                title="Drain inspection"
                meta="1827 Oak Blvd · 1w ago"
                done
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border-subtle flex gap-2">
            <button
              onClick={() => alert(`Dispatching ${vendor.name} to next job…`)}
              className="flex-1 px-3 py-2 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-bright"
            >
              Dispatch
            </button>
            <button
              onClick={() => alert(`Opening ${vendor.name}'s full history`)}
              className="px-3 py-2 rounded-md border border-border bg-bg-subtle text-sm text-text-secondary hover:bg-black/[0.04]"
            >
              View history
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-md border border-border-subtle bg-bg-base p-3">
      <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-1">
        {label}
      </div>
      <div
        className={cn(
          "font-display text-lg tabular",
          accent ? "text-accent-bright" : "text-text-primary"
        )}
      >
        {value}
      </div>
    </div>
  );
}

function JobLine({
  title,
  meta,
  done,
}: {
  title: string;
  meta: string;
  done?: boolean;
}) {
  return (
    <div className="flex items-start gap-2">
      <CheckCircle2
        className={cn(
          "h-3 w-3 mt-0.5 shrink-0",
          done ? "text-status-success" : "text-text-tertiary"
        )}
      />
      <div className="flex-1">
        <div className="text-text-primary">{title}</div>
        <div className="text-text-tertiary text-2xs">{meta}</div>
      </div>
    </div>
  );
}

function AddVendorModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-bg-raised border border-border rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
          <div className="font-display text-lg text-text-primary">
            Add vendor
          </div>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <Field label="Vendor name">
            <input
              type="text"
              placeholder="Reliable Plumbing"
              className="w-full bg-bg-base border border-border rounded-md px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-dim"
            />
          </Field>
          <Field label="Type">
            <select className="w-full bg-bg-base border border-border rounded-md px-3 py-2 text-sm text-text-primary outline-none">
              <option>Plumbing</option>
              <option>HVAC</option>
              <option>Electrical</option>
              <option>Landscaping</option>
              <option>Pest Control</option>
              <option>Cleaning</option>
              <option>Roofing</option>
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone">
              <input
                type="text"
                placeholder="(512) 555-0123"
                className="w-full bg-bg-base border border-border rounded-md px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-dim"
              />
            </Field>
            <Field label="Email">
              <input
                type="text"
                placeholder="dispatch@vendor.com"
                className="w-full bg-bg-base border border-border rounded-md px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-dim"
              />
            </Field>
          </div>
        </div>
        <div className="px-5 py-3 border-t border-border-subtle flex justify-end gap-2 bg-bg-subtle/30">
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-md text-sm text-text-secondary hover:bg-black/[0.04]"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              alert("Vendor added — visible in directory.");
              onClose();
            }}
            className="px-4 py-2 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-bright"
          >
            Add vendor
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-2xs uppercase tracking-wider text-text-tertiary mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
