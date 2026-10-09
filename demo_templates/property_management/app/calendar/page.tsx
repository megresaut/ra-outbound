"use client";

import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Receipt,
  Wrench,
  Users,
  Calendar as CalendarIcon,
  Plus,
  X,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import {
  generateMaintenanceTickets,
  generateProperties,
  generateVendors,
} from "@/lib/fake-data";
import { cn } from "@/lib/utils";

type EventType = "billing" | "maintenance" | "vendor" | "inspection";

interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  type: EventType;
  title: string;
  meta: string;
}

const TYPE_META: Record<
  EventType,
  { label: string; icon: typeof Receipt; color: string; dot: string }
> = {
  billing: {
    label: "Billing",
    icon: Receipt,
    color: "bg-accent-glow text-accent-bright border-accent-border",
    dot: "bg-accent",
  },
  maintenance: {
    label: "Maintenance",
    icon: Wrench,
    color: "bg-status-warning/10 text-status-warning border-status-warning/20",
    dot: "bg-status-warning",
  },
  vendor: {
    label: "Vendor visit",
    icon: Users,
    color: "bg-status-success/10 text-status-success border-status-success/20",
    dot: "bg-status-success",
  },
  inspection: {
    label: "Inspection",
    icon: CalendarIcon,
    color: "bg-bg-subtle text-text-secondary border-border",
    dot: "bg-text-tertiary",
  },
};

// Today is 2026-04-27 — show April 2026 by default.
const TODAY = new Date(2026, 3, 27);

export default function CalendarPage() {
  const [viewYear, setViewYear] = useState(TODAY.getFullYear());
  const [viewMonth, setViewMonth] = useState(TODAY.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(
    fmt(TODAY)
  );
  const [filter, setFilter] = useState<EventType | "all">("all");

  const events = useMemo(() => buildEvents(viewYear, viewMonth), [viewYear, viewMonth]);

  const filteredEvents = useMemo(
    () => (filter === "all" ? events : events.filter((e) => e.type === filter)),
    [events, filter]
  );

  const eventsByDay = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const e of filteredEvents) {
      (map[e.date] ??= []).push(e);
    }
    return map;
  }, [filteredEvents]);

  const days = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const monthName = new Date(viewYear, viewMonth, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const prevMonth = () => {
    const d = new Date(viewYear, viewMonth - 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };
  const nextMonth = () => {
    const d = new Date(viewYear, viewMonth + 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };
  const goToday = () => {
    setViewYear(TODAY.getFullYear());
    setViewMonth(TODAY.getMonth());
    setSelectedDay(fmt(TODAY));
  };

  const selectedEvents = selectedDay ? eventsByDay[selectedDay] ?? [] : [];

  return (
    <PageShell>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-text-tertiary mb-2">
            Calendar
          </div>
          <h1 className="font-display text-3xl text-text-primary">
            Everything, in one place
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Billing runs, maintenance, vendor visits, inspections.
          </p>
        </div>
        <button
          onClick={() => alert("Schedule event — opens an event composer in production.")}
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-bright"
        >
          <Plus className="h-4 w-4" />
          Schedule event
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="h-8 w-8 rounded-md border border-border bg-bg-raised text-text-secondary hover:text-text-primary flex items-center justify-center"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={nextMonth}
            className="h-8 w-8 rounded-md border border-border bg-bg-raised text-text-secondary hover:text-text-primary flex items-center justify-center"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={goToday}
            className="ml-1 px-2.5 py-1.5 rounded-md border border-border bg-bg-raised text-xs text-text-secondary hover:text-text-primary"
          >
            Today
          </button>
        </div>
        <div className="font-display text-xl text-text-primary">{monthName}</div>

        <div className="ml-auto flex items-center gap-1.5 flex-wrap">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            All
          </FilterChip>
          {(["billing", "maintenance", "vendor", "inspection"] as EventType[]).map(
            (t) => (
              <FilterChip
                key={t}
                active={filter === t}
                onClick={() => setFilter(t)}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", TYPE_META[t].dot)} />
                {TYPE_META[t].label}
              </FilterChip>
            )
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        {/* Calendar grid */}
        <div className="rounded-lg border border-border-subtle bg-bg-raised overflow-hidden">
          <div className="grid grid-cols-7 border-b border-border-subtle bg-bg-subtle/40">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div
                key={d}
                className="px-3 py-2 text-2xs uppercase tracking-wider text-text-tertiary text-center"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((d, i) => {
              const dayEvents = eventsByDay[d.iso] ?? [];
              const isToday = d.iso === fmt(TODAY);
              const isSelected = d.iso === selectedDay;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(d.iso)}
                  className={cn(
                    "min-h-[96px] border-b border-r border-border-subtle p-2 text-left transition-colors flex flex-col gap-1 group",
                    !d.inMonth && "bg-bg-base/30",
                    isSelected
                      ? "bg-accent-glow"
                      : "hover:bg-black/[0.025]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-xs tabular",
                        !d.inMonth
                          ? "text-text-dim"
                          : isToday
                          ? "h-5 w-5 rounded-full bg-accent text-white flex items-center justify-center font-semibold"
                          : "text-text-secondary"
                      )}
                    >
                      {d.day}
                    </span>
                    {dayEvents.length > 3 && (
                      <span className="text-2xs text-text-tertiary tabular">
                        +{dayEvents.length - 3}
                      </span>
                    )}
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    {dayEvents.slice(0, 3).map((e) => {
                      const meta = TYPE_META[e.type];
                      return (
                        <div
                          key={e.id}
                          className={cn(
                            "text-2xs px-1.5 py-0.5 rounded border truncate",
                            meta.color
                          )}
                        >
                          {e.title}
                        </div>
                      );
                    })}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Day detail rail */}
        <div className="rounded-lg border border-border-subtle bg-bg-raised overflow-hidden h-fit">
          <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
            <div>
              <div className="text-2xs uppercase tracking-wider text-text-tertiary">
                {selectedDay ? formatDay(selectedDay) : "Select a day"}
              </div>
              <div className="text-sm text-text-primary mt-0.5">
                {selectedEvents.length} event
                {selectedEvents.length === 1 ? "" : "s"}
              </div>
            </div>
            {selectedDay && (
              <button
                onClick={() => setSelectedDay(null)}
                className="text-text-tertiary hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="divide-y divide-border-subtle max-h-[600px] overflow-y-auto">
            {selectedEvents.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-text-tertiary">
                Nothing scheduled for this day.
              </div>
            ) : (
              selectedEvents.map((e) => {
                const meta = TYPE_META[e.type];
                const Icon = meta.icon;
                return (
                  <div
                    key={e.id}
                    className="px-4 py-3 hover:bg-black/[0.025] cursor-pointer"
                    onClick={() => alert(`${e.title}\n\n${e.meta}`)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "h-7 w-7 rounded-md flex items-center justify-center shrink-0 border",
                          meta.color
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm text-text-primary leading-tight">
                          {e.title}
                        </div>
                        <div className="text-2xs text-text-tertiary mt-0.5">
                          {meta.label} · {e.meta}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Legend / scheduled summary */}
      <div className="mt-6 rounded-lg border border-border-subtle bg-bg-raised p-5">
        <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-3">
          This month at a glance
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(["billing", "maintenance", "vendor", "inspection"] as EventType[]).map(
            (t) => {
              const count = events.filter((e) => e.type === t).length;
              return (
                <div key={t} className="flex items-start gap-2">
                  <span
                    className={cn("h-1.5 w-1.5 rounded-full mt-1.5", TYPE_META[t].dot)}
                  />
                  <div>
                    <div className="text-2xs text-text-tertiary">
                      {TYPE_META[t].label}
                    </div>
                    <div className="font-display text-xl text-text-primary tabular">
                      {count}
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
    </PageShell>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border transition-colors",
        active
          ? "border-accent-border bg-accent-glow text-text-primary"
          : "border-border bg-bg-raised text-text-secondary hover:text-text-primary"
      )}
    >
      {children}
    </button>
  );
}

function fmt(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatDay(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function buildMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startDay = first.getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ iso: string; day: number; inMonth: boolean }> = [];

  // Previous month tail
  const prevDays = new Date(year, month, 0).getDate();
  for (let i = startDay - 1; i >= 0; i--) {
    const day = prevDays - i;
    const d = new Date(year, month - 1, day);
    cells.push({ iso: fmt(d), day, inMonth: false });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ iso: fmt(new Date(year, month, d)), day: d, inMonth: true });
  }

  // Next month head — fill to 42 cells (6 weeks)
  let nextDay = 1;
  while (cells.length < 42) {
    const d = new Date(year, month + 1, nextDay++);
    cells.push({ iso: fmt(d), day: d.getDate(), inMonth: false });
  }

  return cells;
}

function buildEvents(year: number, month: number): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const props = generateProperties();
  const tickets = generateMaintenanceTickets();
  const vendors = generateVendors();

  // Monthly utility billing run on the 1st
  events.push({
    id: `bill_${year}_${month}_1`,
    date: fmt(new Date(year, month, 1)),
    type: "billing",
    title: "Utility billing run",
    meta: `~312 statements · scheduled 2:00 AM`,
  });

  // Mid-month catch-up
  events.push({
    id: `bill_${year}_${month}_15`,
    date: fmt(new Date(year, month, 15)),
    type: "billing",
    title: "Mid-cycle billing review",
    meta: "Flagged statements + reposts",
  });

  // Quarterly inspection
  events.push({
    id: `insp_${year}_${month}_18`,
    date: fmt(new Date(year, month, 18)),
    type: "inspection",
    title: "Quarterly walkthrough",
    meta: `${props[0]?.address ?? "Property A"}`,
  });
  events.push({
    id: `insp_${year}_${month}_24`,
    date: fmt(new Date(year, month, 24)),
    type: "inspection",
    title: "Annual inspection",
    meta: `${props[3]?.address ?? "Property D"}`,
  });

  // Sprinkle maintenance tickets across the month
  tickets.slice(0, 14).forEach((t, i) => {
    const day = ((i * 3) % 27) + 2;
    events.push({
      id: `mnt_${year}_${month}_${i}`,
      date: fmt(new Date(year, month, day)),
      type: "maintenance",
      title: `${t.ticketNumber} · ${t.issue}`,
      meta: `${t.property} · ${t.priority} priority`,
    });
  });

  // Vendor visits
  vendors.slice(0, 10).forEach((v, i) => {
    const day = ((i * 2) % 25) + 3;
    events.push({
      id: `vnd_${year}_${month}_${i}`,
      date: fmt(new Date(year, month, day)),
      type: "vendor",
      title: `${v.name}`,
      meta: `${v.type} · ${props[i % props.length]?.address ?? "scheduled visit"}`,
    });
  });

  return events;
}
