import { PageShell } from "@/components/layout/page-shell";
import { generateTickets } from "@/lib/fake-data";
import { verticalPacks } from "@/config/verticals";
import { demoConfig } from "@/config/demo.config";
import { Phone, Mail, FileText, Server, Filter, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const SOURCE_ICONS = {
  phone: Phone,
  form: FileText,
  email: Mail,
  platform: Server,
  sms: Phone,
} as const;

const PRIORITY_STYLES = {
  urgent: "bg-status-error/10 text-status-error border-status-error/20",
  high: "bg-status-warning/10 text-status-warning border-status-warning/20",
  medium: "bg-accent-glow text-accent-bright border-accent-border",
  low: "bg-white/5 text-text-tertiary border-border",
} as const;

export default function BoardPage() {
  const pack = verticalPacks[demoConfig.vertical];
  const tickets = generateTickets(20);

  // Distribute across statuses
  const lanes = [
    { key: "new", label: "New", tickets: tickets.slice(0, 5) },
    { key: "assigned", label: "Assigned", tickets: tickets.slice(5, 11) },
    { key: "scheduled", label: "Scheduled", tickets: tickets.slice(11, 17) },
    { key: "completed", label: "Completed today", tickets: tickets.slice(17) },
  ];

  return (
    <PageShell>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-text-tertiary mb-2">
            Board
          </div>
          <h1 className="font-display text-3xl text-text-primary">
            {pack.jobNoun.plural[0].toUpperCase() + pack.jobNoun.plural.slice(1)} board
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            {tickets.length} active · auto-organized by dispatch state
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-border bg-bg-raised text-xs text-text-secondary hover:bg-white/[0.04]">
            <Search className="h-3 w-3" />
            Search
          </button>
          <button className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-border bg-bg-raised text-xs text-text-secondary hover:bg-white/[0.04]">
            <Filter className="h-3 w-3" />
            Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {lanes.map((lane) => (
          <div
            key={lane.key}
            className="rounded-lg border border-border-subtle bg-bg-raised flex flex-col min-h-[400px]"
          >
            <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
              <h2 className="text-sm font-medium text-text-primary">
                {lane.label}
              </h2>
              <span className="text-2xs tabular text-text-tertiary">
                {lane.tickets.length}
              </span>
            </div>
            <div className="p-3 space-y-2 flex-1">
              {lane.tickets.map((t) => {
                const Icon = SOURCE_ICONS[t.source];
                return (
                  <div
                    key={t.id}
                    className="rounded-md border border-border-subtle bg-bg-base p-3 hover:border-border-strong cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-mono text-2xs text-text-tertiary">
                        {t.ticketNumber}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center px-1.5 py-0.5 rounded text-2xs uppercase tracking-wider border",
                          PRIORITY_STYLES[t.priority]
                        )}
                      >
                        {t.priority}
                      </span>
                    </div>
                    <div className="text-sm text-text-primary mb-1.5">
                      {t.issue}
                    </div>
                    <div className="text-2xs text-text-tertiary mb-2 truncate">
                      {t.address}
                    </div>
                    <div className="flex items-center justify-between text-2xs">
                      <span className="flex items-center gap-1 text-text-tertiary">
                        <Icon className="h-3 w-3" />
                        {t.createdAt}
                      </span>
                      {t.assignedTech && (
                        <span className="text-text-secondary truncate ml-2">
                          {t.assignedTech.split(" ")[0]} {t.assignedTech.split(" ")[1]?.[0]}.
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
