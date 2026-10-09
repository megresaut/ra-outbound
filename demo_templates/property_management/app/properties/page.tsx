"use client";

import { useState, useMemo } from "react";
import {
  Building2,
  Home,
  TrendingUp,
  DollarSign,
  Search,
  Filter,
  Plus,
  MapPin,
  Calendar,
  User,
  X,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { generateProperties, type Property } from "@/lib/fake-data";
import { demoConfig } from "@/config/demo.config";
import { cn } from "@/lib/utils";

const TYPE_STYLES: Record<Property["type"], string> = {
  Multifamily: "bg-accent-glow text-accent-bright border-accent-border",
  Townhomes: "bg-status-success/10 text-status-success border-status-success/20",
  "Single-family": "bg-bg-subtle text-text-secondary border-border",
  "Mixed-use": "bg-status-warning/10 text-status-warning border-status-warning/20",
};

export default function PropertiesPage() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<Property["type"] | "All">("All");
  const [selected, setSelected] = useState<Property | null>(null);

  const properties = useMemo(() => generateProperties(), []);

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      const matchesQuery =
        query.length === 0 ||
        p.address.toLowerCase().includes(query.toLowerCase()) ||
        p.manager.toLowerCase().includes(query.toLowerCase());
      const matchesType = typeFilter === "All" || p.type === typeFilter;
      return matchesQuery && matchesType;
    });
  }, [properties, query, typeFilter]);

  const totalUnits = properties.reduce((s, p) => s + p.units, 0);
  const avgOccupancy =
    properties.reduce((s, p) => s + p.occupancy, 0) / properties.length;
  const totalRevenue = properties.reduce((s, p) => s + p.monthlyRevenue, 0);

  const types: Array<Property["type"] | "All"> = [
    "All",
    "Multifamily",
    "Townhomes",
    "Single-family",
    "Mixed-use",
  ];

  return (
    <PageShell>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-text-tertiary mb-2">
            Portfolio
          </div>
          <h1 className="font-display text-3xl text-text-primary">Properties</h1>
          <p className="text-text-secondary text-sm mt-1">
            {properties.length} properties · {totalUnits.toLocaleString()} units
            · {demoConfig.company.location}
          </p>
        </div>
        <button
          onClick={() => alert("Add property — connects to your PMS in production.")}
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-bright"
        >
          <Plus className="h-4 w-4" />
          Add property
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <Kpi
          icon={Building2}
          label="Properties"
          value={properties.length.toString()}
        />
        <Kpi icon={Home} label="Total units" value={totalUnits.toLocaleString()} />
        <Kpi
          icon={TrendingUp}
          label="Avg occupancy"
          value={`${avgOccupancy.toFixed(1)}%`}
          accent
        />
        <Kpi
          icon={DollarSign}
          label="Monthly revenue"
          value={`$${(totalRevenue / 1000).toFixed(0)}k`}
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs border transition-colors",
              typeFilter === t
                ? "border-accent-border bg-accent-glow text-text-primary"
                : "border-border bg-bg-raised text-text-secondary hover:text-text-primary"
            )}
          >
            {t}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-border bg-bg-raised">
            <Search className="h-3 w-3 text-text-tertiary" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search address or manager…"
              className="bg-transparent text-xs text-text-primary placeholder:text-text-dim outline-none w-56"
            />
          </div>
          <button
            onClick={() => alert("Advanced filter panel coming in production.")}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-border bg-bg-raised text-xs text-text-secondary hover:bg-black/[0.04]"
          >
            <Filter className="h-3 w-3" />
            Filter
          </button>
        </div>
      </div>

      {/* Properties table */}
      <div className="rounded-lg border border-border-subtle bg-bg-raised overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg-subtle/50">
            <tr className="text-2xs uppercase tracking-wider text-text-tertiary">
              <th className="text-left px-5 py-2.5 font-normal">Address</th>
              <th className="text-left px-5 py-2.5 font-normal">Type</th>
              <th className="text-right px-5 py-2.5 font-normal">Units</th>
              <th className="text-right px-5 py-2.5 font-normal">Occupancy</th>
              <th className="text-right px-5 py-2.5 font-normal">Revenue / mo</th>
              <th className="text-left px-5 py-2.5 font-normal">Manager</th>
              <th className="text-right px-5 py-2.5 font-normal">Built</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {filtered.map((p) => (
              <tr
                key={p.id}
                onClick={() => setSelected(p)}
                className="hover:bg-black/[0.025] cursor-pointer"
              >
                <td className="px-5 py-3 text-text-primary">
                  {p.address}{" "}
                  <span className="text-text-tertiary">· {p.city}</span>
                </td>
                <td className="px-5 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-md text-2xs uppercase tracking-wider border",
                      TYPE_STYLES[p.type]
                    )}
                  >
                    {p.type}
                  </span>
                </td>
                <td className="px-5 py-3 text-right text-text-primary tabular">
                  {p.units}
                </td>
                <td className="px-5 py-3 text-right tabular">
                  <span
                    className={cn(
                      p.occupancy >= 95
                        ? "text-status-success"
                        : p.occupancy >= 90
                        ? "text-text-primary"
                        : "text-status-warning"
                    )}
                  >
                    {p.occupancy.toFixed(1)}%
                  </span>
                </td>
                <td className="px-5 py-3 text-right text-text-primary tabular">
                  ${p.monthlyRevenue.toLocaleString()}
                </td>
                <td className="px-5 py-3 text-text-secondary">{p.manager}</td>
                <td className="px-5 py-3 text-right text-2xs text-text-tertiary tabular">
                  {p.yearBuilt}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-8 text-center text-sm text-text-tertiary"
                >
                  No properties match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail side-panel */}
      {selected && (
        <PropertyDetail
          property={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </PageShell>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
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
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs text-text-tertiary">{label}</div>
        <Icon
          className={cn(
            "h-3.5 w-3.5",
            accent ? "text-accent" : "text-text-tertiary"
          )}
        />
      </div>
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

function PropertyDetail({
  property,
  onClose,
}: {
  property: Property;
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
              Property
            </div>
            <div className="font-display text-xl text-text-primary">
              {property.address}
            </div>
            <div className="text-xs text-text-tertiary flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {property.city}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <DetailStat label="Units" value={property.units.toString()} />
            <DetailStat
              label="Occupancy"
              value={`${property.occupancy.toFixed(1)}%`}
              accent={property.occupancy >= 95}
            />
            <DetailStat
              label="Monthly revenue"
              value={`$${property.monthlyRevenue.toLocaleString()}`}
            />
            <DetailStat label="Year built" value={property.yearBuilt.toString()} />
          </div>

          <div>
            <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-2">
              Type
            </div>
            <div className="text-sm text-text-primary">{property.type}</div>
          </div>

          <div>
            <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-2 flex items-center gap-1.5">
              <User className="h-3 w-3" />
              Property manager
            </div>
            <div className="text-sm text-text-primary">{property.manager}</div>
          </div>

          <div>
            <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-2 flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              Recent activity
            </div>
            <div className="space-y-2 text-xs text-text-secondary">
              <div className="flex justify-between">
                <span>Last utility billing run</span>
                <span className="tabular text-text-tertiary">Apr 1</span>
              </div>
              <div className="flex justify-between">
                <span>Open work orders</span>
                <span className="tabular text-text-primary">2</span>
              </div>
              <div className="flex justify-between">
                <span>Vendor visits this month</span>
                <span className="tabular text-text-primary">5</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border-subtle flex gap-2">
            <button
              onClick={() => alert(`Opening ${property.address} in your PMS`)}
              className="flex-1 px-3 py-2 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-bright"
            >
              Open in PMS
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-md border border-border bg-bg-subtle text-sm text-text-secondary hover:bg-black/[0.04]"
            >
              Close
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
