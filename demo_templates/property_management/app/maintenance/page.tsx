"use client";

import { useState, useMemo } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { generateMaintenanceTickets } from "@/lib/fake-data";
import {
  Filter,
  Search,
  Plus,
  Wrench,
  X,
  MapPin,
  User,
  Clock,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Ticket = ReturnType<typeof generateMaintenanceTickets>[number];

const PRIORITY_STYLES = {
  urgent: "bg-status-error/10 text-status-error border-status-error/20",
  high: "bg-status-warning/10 text-status-warning border-status-warning/20",
  medium: "bg-accent-glow text-accent-bright border-accent-border",
  low: "bg-bg-subtle text-text-tertiary border-border",
} as const;

const STATUS_STYLES = {
  new: "text-text-primary",
  assigned: "text-text-secondary",
  in_progress: "text-accent-bright",
  completed: "text-status-success",
} as const;

type StatusFilter = "all" | Ticket["status"];

export default function MaintenancePage() {
  const tickets = useMemo(() => generateMaintenanceTickets(), []);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [showNewTicket, setShowNewTicket] = useState(false);

  const counts = useMemo(
    () =>
      tickets.reduce(
        (acc, t) => {
          acc[t.status] = (acc[t.status] ?? 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
    [tickets]
  );

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      const matchesFilter = filter === "all" || t.status === filter;
      const q = query.toLowerCase();
      const matchesQuery =
        q.length === 0 ||
        t.issue.toLowerCase().includes(q) ||
        t.tenant.toLowerCase().includes(q) ||
        t.property.toLowerCase().includes(q) ||
        t.ticketNumber.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [tickets, filter, query]);

  return (
    <PageShell>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-text-tertiary mb-2">
            Maintenance
          </div>
          <h1 className="font-display text-3xl text-text-primary">Work orders</h1>
          <p className="text-text-secondary text-sm mt-1">
            {tickets.length} tickets · auto-assigned by vendor type and priority
          </p>
        </div>
        <button
          onClick={() => setShowNewTicket(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-bright"
        >
          <Plus className="h-4 w-4" />
          New ticket
        </button>
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Chip
          label="All"
          count={tickets.length}
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        <Chip
          label="New"
          count={counts.new ?? 0}
          active={filter === "new"}
          onClick={() => setFilter("new")}
        />
        <Chip
          label="Assigned"
          count={counts.assigned ?? 0}
          active={filter === "assigned"}
          onClick={() => setFilter("assigned")}
        />
        <Chip
          label="In progress"
          count={counts.in_progress ?? 0}
          active={filter === "in_progress"}
          onClick={() => setFilter("in_progress")}
        />
        <Chip
          label="Completed"
          count={counts.completed ?? 0}
          active={filter === "completed"}
          onClick={() => setFilter("completed")}
        />
        <div className="ml-auto flex gap-2">
          {showSearch ? (
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-accent-border bg-bg-raised">
              <Search className="h-3 w-3 text-accent" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tickets…"
                className="bg-transparent text-xs text-text-primary placeholder:text-text-dim outline-none w-48"
              />
              <button
                onClick={() => {
                  setShowSearch(false);
                  setQuery("");
                }}
                className="text-text-tertiary hover:text-text-primary"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-border bg-bg-raised text-xs text-text-secondary hover:bg-black/[0.04]"
            >
              <Search className="h-3 w-3" />
              Search
            </button>
          )}
          <button
            onClick={() =>
              alert("Advanced filters: priority, property, vendor, age. Coming in production.")
            }
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-border bg-bg-raised text-xs text-text-secondary hover:bg-black/[0.04]"
          >
            <Filter className="h-3 w-3" />
            Filter
          </button>
        </div>
      </div>

      {/* Tickets table */}
      <div className="rounded-lg border border-border-subtle bg-bg-raised overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg-subtle/50">
            <tr className="text-2xs uppercase tracking-wider text-text-tertiary">
              <th className="text-left px-5 py-2.5 font-normal">Ticket</th>
              <th className="text-left px-5 py-2.5 font-normal">Issue</th>
              <th className="text-left px-5 py-2.5 font-normal">Property</th>
              <th className="text-left px-5 py-2.5 font-normal">Tenant</th>
              <th className="text-left px-5 py-2.5 font-normal">Priority</th>
              <th className="text-left px-5 py-2.5 font-normal">Status</th>
              <th className="text-right px-5 py-2.5 font-normal">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {filtered.map((t) => (
              <tr
                key={t.id}
                onClick={() => setSelected(t)}
                className="hover:bg-black/[0.025] cursor-pointer"
              >
                <td className="px-5 py-3 font-mono text-xs text-text-tertiary">
                  {t.ticketNumber}
                </td>
                <td className="px-5 py-3 text-text-primary">{t.issue}</td>
                <td className="px-5 py-3 text-text-secondary">
                  {t.property}{" "}
                  <span className="text-text-tertiary">· {t.unit}</span>
                </td>
                <td className="px-5 py-3 text-text-secondary">{t.tenant}</td>
                <td className="px-5 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-md text-2xs uppercase tracking-wider border",
                      PRIORITY_STYLES[t.priority]
                    )}
                  >
                    {t.priority}
                  </span>
                </td>
                <td
                  className={cn(
                    "px-5 py-3 text-xs",
                    STATUS_STYLES[t.status]
                  )}
                >
                  {t.status.replace("_", " ")}
                </td>
                <td className="px-5 py-3 text-right text-2xs text-text-tertiary tabular">
                  {t.created}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-8 text-center text-sm text-text-tertiary"
                >
                  No tickets match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded-lg border border-accent-border bg-accent-glow/30 p-5 flex items-start gap-3">
        <Wrench className="h-4 w-4 text-accent shrink-0 mt-0.5" />
        <div className="text-sm text-text-secondary leading-relaxed">
          <span className="text-text-primary font-medium">
            Maintenance auto-routing
          </span>{" "}
          assigns each ticket to the right vendor based on issue type, property
          location, and current vendor load. Pair this with the{" "}
          <span className="text-accent-bright">Vendors</span> module for full
          dispatch automation.
        </div>
      </div>

      {selected && (
        <TicketDetail ticket={selected} onClose={() => setSelected(null)} />
      )}

      {showNewTicket && (
        <NewTicketModal onClose={() => setShowNewTicket(false)} />
      )}
    </PageShell>
  );
}

function Chip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs border transition-colors",
        active
          ? "border-accent-border bg-accent-glow text-text-primary"
          : "border-border bg-bg-raised text-text-secondary hover:text-text-primary"
      )}
    >
      {label}
      <span
        className={cn(
          "tabular text-2xs",
          active ? "text-accent-bright" : "text-text-tertiary"
        )}
      >
        {count}
      </span>
    </button>
  );
}

function TicketDetail({
  ticket,
  onClose,
}: {
  ticket: Ticket;
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
            <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-1 font-mono">
              {ticket.ticketNumber}
            </div>
            <div className="font-display text-xl text-text-primary leading-tight">
              {ticket.issue}
            </div>
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-md text-2xs uppercase tracking-wider border mt-2",
                PRIORITY_STYLES[ticket.priority]
              )}
            >
              {ticket.priority} priority
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-1 flex items-center gap-1.5">
              <MapPin className="h-3 w-3" /> Property
            </div>
            <div className="text-sm text-text-primary">
              {ticket.property}{" "}
              <span className="text-text-tertiary">· {ticket.unit}</span>
            </div>
          </div>

          <div>
            <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-1 flex items-center gap-1.5">
              <User className="h-3 w-3" /> Tenant
            </div>
            <div className="text-sm text-text-primary">{ticket.tenant}</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md border border-border-subtle bg-bg-base p-3">
              <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-1">
                Status
              </div>
              <div
                className={cn(
                  "text-sm capitalize",
                  STATUS_STYLES[ticket.status]
                )}
              >
                {ticket.status.replace("_", " ")}
              </div>
            </div>
            <div className="rounded-md border border-border-subtle bg-bg-base p-3">
              <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-1 flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" /> Created
              </div>
              <div className="text-sm text-text-primary tabular">
                {ticket.created}
              </div>
            </div>
          </div>

          <div>
            <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-2">
              Activity
            </div>
            <div className="space-y-2 text-xs">
              <ActivityLine
                icon={Wrench}
                title="Auto-routed to Plumbing vendor"
                time="2h ago"
              />
              <ActivityLine
                icon={CheckCircle2}
                title="Tenant notified via SMS + email"
                time="2h ago"
              />
              <ActivityLine
                icon={Clock}
                title="Awaiting vendor confirmation"
                time="now"
                pending
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border-subtle flex gap-2">
            <button
              onClick={() => alert(`Reassigning ${ticket.ticketNumber}`)}
              className="flex-1 px-3 py-2 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-bright"
            >
              Reassign
            </button>
            <button
              onClick={() => alert(`${ticket.ticketNumber} marked complete`)}
              className="px-3 py-2 rounded-md border border-border bg-bg-subtle text-sm text-text-secondary hover:bg-black/[0.04]"
            >
              Mark complete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityLine({
  icon: Icon,
  title,
  time,
  pending,
}: {
  icon: React.ElementType;
  title: string;
  time: string;
  pending?: boolean;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon
        className={cn(
          "h-3 w-3 mt-0.5 shrink-0",
          pending ? "text-text-tertiary" : "text-status-success"
        )}
      />
      <div className="flex-1 flex items-baseline justify-between gap-2">
        <span
          className={cn(
            pending ? "text-text-tertiary italic" : "text-text-primary"
          )}
        >
          {title}
        </span>
        <span className="text-text-tertiary tabular text-2xs">{time}</span>
      </div>
    </div>
  );
}

type QuotePhase = "form" | "requesting" | "review" | "approved";

interface VendorQuote {
  name: string;
  distanceMi: number;
  rating: number;
  status: "queued" | "sent" | "quoted" | "passed";
  price?: number;
  eta?: string;
  note?: string;
}

const VENDOR_POOL: Omit<VendorQuote, "status">[] = [
  {
    name: "Reliable Plumbing",
    distanceMi: 1.2,
    rating: 4.8,
    price: 185,
    eta: "Tomorrow, 10am–12pm",
    note: "Available next-day. Flat rate for faucet replacement.",
  },
  {
    name: "AAA Plumbing & Drain",
    distanceMi: 2.4,
    rating: 4.6,
    price: 220,
    eta: "Tomorrow, 2pm–4pm",
    note: "Includes parts. Will assess for leak source under sink.",
  },
  {
    name: "QuickFix Plumbing",
    distanceMi: 3.8,
    rating: 4.4,
    price: 165,
    eta: "Day after, 9am–11am",
    note: "Lowest quote. Two-day lead time.",
  },
];

function NewTicketModal({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<QuotePhase>("form");
  const [vendors, setVendors] = useState<VendorQuote[]>([]);
  const [chosen, setChosen] = useState<string | null>(null);

  const startQuoteRequest = () => {
    const initial: VendorQuote[] = VENDOR_POOL.map((v) => ({
      ...v,
      status: "queued",
      price: undefined,
      eta: undefined,
      note: undefined,
    }));
    setVendors(initial);
    setPhase("requesting");

    setTimeout(() => {
      setVendors((vs) => vs.map((v) => ({ ...v, status: "sent" })));
    }, 400);

    // Quotes trickle in
    VENDOR_POOL.forEach((v, i) => {
      setTimeout(() => {
        setVendors((vs) =>
          vs.map((row) =>
            row.name === v.name
              ? {
                  ...row,
                  status: "quoted",
                  price: v.price,
                  eta: v.eta,
                  note: v.note,
                }
              : row
          )
        );
        if (i === VENDOR_POOL.length - 1) setPhase("review");
      }, 1200 + i * 800);
    });
  };

  const approveVendor = (name: string) => {
    setChosen(name);
    setPhase("approved");
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[90vh] bg-bg-raised border border-border rounded-lg overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between shrink-0">
          <div className="font-display text-lg text-text-primary">
            {phase === "form" && "New work order"}
            {phase === "requesting" && "Requesting quotes…"}
            {phase === "review" && "Quotes received · awaiting your choice"}
            {phase === "approved" && "Vendor approved"}
          </div>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {phase === "form" ? (
          <>
            <div className="p-5 space-y-4 overflow-y-auto">
              <Field label="Property">
                <select className="w-full bg-bg-base border border-border rounded-md px-3 py-2 text-sm text-text-primary outline-none">
                  <option>Select a property…</option>
                  <option>4421 Maple Ave · Unit 02</option>
                  <option>1827 Oak Blvd · Unit 14</option>
                  <option>9034 Cedar Ln · Unit 08</option>
                </select>
              </Field>
              <Field label="Issue">
                <input
                  type="text"
                  defaultValue="Leaking faucet in kitchen"
                  className="w-full bg-bg-base border border-border rounded-md px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-dim"
                />
              </Field>
              <Field label="Priority">
                <div className="flex gap-2">
                  {(["low", "medium", "high", "urgent"] as const).map((p) => (
                    <button
                      key={p}
                      className="flex-1 px-2 py-1.5 rounded-md border border-border bg-bg-base text-xs text-text-secondary hover:border-accent-border hover:text-text-primary capitalize"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Vendor pool">
                <div className="flex gap-2">
                  <button className="flex-1 px-2 py-1.5 rounded-md border border-accent-border bg-accent-glow text-xs text-text-primary">
                    Nearby (auto)
                  </button>
                  <button className="flex-1 px-2 py-1.5 rounded-md border border-border bg-bg-base text-xs text-text-secondary hover:border-accent-border hover:text-text-primary">
                    Choose vendors…
                  </button>
                </div>
              </Field>
              <Field label="Description">
                <textarea
                  rows={3}
                  placeholder="Add details…"
                  className="w-full bg-bg-base border border-border rounded-md px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-dim resize-none"
                />
              </Field>

              <div className="rounded-md border border-accent-border bg-accent-glow/40 p-3 flex items-start gap-2">
                <Sparkles className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                <div className="text-2xs text-text-secondary leading-relaxed">
                  On submit, we'll request quotes from nearby plumbers (or your
                  selected vendors) and bring back prices and availability.
                  Nothing is dispatched until you approve a quote.
                </div>
              </div>
            </div>
            <div className="px-5 py-3 border-t border-border-subtle flex justify-end gap-2 bg-bg-subtle/30 shrink-0">
              <button
                onClick={onClose}
                className="px-3 py-2 rounded-md text-sm text-text-secondary hover:bg-black/[0.04]"
              >
                Cancel
              </button>
              <button
                onClick={startQuoteRequest}
                className="px-4 py-2 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-bright"
              >
                Request quotes
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="rounded-md border border-border-subtle bg-bg-base p-3">
                <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-1">
                  Ticket created
                </div>
                <div className="font-mono text-xs text-text-secondary">
                  WO-2026025 · Leaking faucet in kitchen
                </div>
                <div className="text-2xs text-text-tertiary mt-1">
                  4421 Maple Ave · Unit 02
                </div>
              </div>

              <div>
                <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-2 flex items-center gap-1.5">
                  <MessageSquare className="h-3 w-3" />
                  {phase === "requesting"
                    ? "Reaching out to nearby plumbers"
                    : phase === "review"
                    ? "Quotes received"
                    : "Quotes"}
                </div>
                <div className="space-y-2">
                  {vendors.map((v) => (
                    <VendorQuoteRow
                      key={v.name}
                      vendor={v}
                      chosen={chosen === v.name}
                      canApprove={phase === "review"}
                      onApprove={() => approveVendor(v.name)}
                    />
                  ))}
                </div>
              </div>

              {phase === "review" && (
                <div className="rounded-md border border-accent-border bg-accent-glow/30 p-3 flex items-start gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                  <div className="text-2xs text-text-secondary leading-relaxed">
                    All 3 quotes are in. <span className="text-text-primary">Approve a vendor</span>{" "}
                    to dispatch — we won't send the work order or notify the tenant
                    without your go-ahead.
                  </div>
                </div>
              )}

              {phase === "approved" && (
                <div className="rounded-md border border-status-success/30 bg-status-success/10 p-3">
                  <div className="text-2xs uppercase tracking-wider text-status-success mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3" />
                    Dispatched with your approval
                  </div>
                  <div className="text-xs text-text-primary">
                    {chosen} confirmed · {vendors.find((v) => v.name === chosen)?.eta}
                  </div>
                  <div className="text-2xs text-text-tertiary mt-1">
                    Tenant notified by SMS + email · other vendors thanked & declined
                  </div>
                </div>
              )}
            </div>
            <div className="px-5 py-3 border-t border-border-subtle flex justify-end gap-2 bg-bg-subtle/30 shrink-0">
              {phase === "review" && (
                <button
                  onClick={onClose}
                  className="px-3 py-2 rounded-md text-sm text-text-secondary hover:bg-black/[0.04]"
                >
                  Decide later
                </button>
              )}
              <button
                onClick={onClose}
                disabled={phase === "requesting"}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium",
                  phase === "approved"
                    ? "bg-accent text-white hover:bg-accent-bright"
                    : phase === "review"
                    ? "bg-bg-subtle text-text-secondary hover:bg-black/[0.04] border border-border"
                    : "bg-bg-subtle text-text-tertiary cursor-not-allowed"
                )}
              >
                {phase === "requesting" && "Waiting for quotes…"}
                {phase === "review" && "Close (queue stays open)"}
                {phase === "approved" && "Done"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function VendorQuoteRow({
  vendor,
  chosen,
  canApprove,
  onApprove,
}: {
  vendor: VendorQuote;
  chosen: boolean;
  canApprove: boolean;
  onApprove: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-md border px-3 py-2.5 transition-colors",
        chosen
          ? "border-status-success/40 bg-status-success/5"
          : vendor.status === "quoted"
          ? "border-border-subtle bg-bg-base"
          : "border-border-subtle bg-bg-base"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "h-6 w-6 rounded-md flex items-center justify-center shrink-0 mt-0.5",
            chosen
              ? "bg-status-success/10 text-status-success"
              : vendor.status === "quoted"
              ? "bg-accent-glow text-accent-bright"
              : vendor.status === "sent"
              ? "bg-accent-glow text-accent-bright"
              : "bg-bg-subtle text-text-tertiary"
          )}
        >
          {chosen ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : vendor.status === "quoted" ? (
            <MessageSquare className="h-3.5 w-3.5" />
          ) : vendor.status === "sent" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <MessageSquare className="h-3.5 w-3.5" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <div className="text-xs text-text-primary truncate">{vendor.name}</div>
            {vendor.status === "quoted" && vendor.price !== undefined && (
              <div className="font-display text-base text-text-primary tabular shrink-0">
                ${vendor.price}
              </div>
            )}
          </div>
          <div className="text-2xs text-text-tertiary mt-0.5 flex items-center gap-2 flex-wrap">
            <span className="tabular">{vendor.distanceMi} mi</span>
            <span>·</span>
            <span className="tabular">★ {vendor.rating}</span>
            {vendor.status === "queued" && (
              <>
                <span>·</span>
                <span>queued</span>
              </>
            )}
            {vendor.status === "sent" && (
              <>
                <span>·</span>
                <span>request sent · awaiting reply</span>
              </>
            )}
            {vendor.status === "quoted" && vendor.eta && (
              <>
                <span>·</span>
                <span>{vendor.eta}</span>
              </>
            )}
          </div>
          {vendor.status === "quoted" && vendor.note && (
            <div className="text-2xs text-text-secondary mt-1.5 leading-relaxed">
              {vendor.note}
            </div>
          )}
          {canApprove && vendor.status === "quoted" && (
            <div className="flex gap-1.5 mt-2">
              <button
                onClick={onApprove}
                className="px-2.5 py-1 rounded-md bg-accent text-white text-2xs font-medium hover:bg-accent-bright"
              >
                Approve & dispatch
              </button>
              <button className="px-2.5 py-1 rounded-md border border-border bg-bg-raised text-2xs text-text-secondary hover:bg-black/[0.04]">
                Message
              </button>
            </div>
          )}
          {chosen && (
            <div className="text-2xs text-status-success mt-1.5">
              Approved by you · dispatched
            </div>
          )}
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
