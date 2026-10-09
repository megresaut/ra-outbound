import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Inbox,
  Users,
  TrendingDown,
  Zap,
  CheckCircle2,
  AlertCircle,
  Phone,
  Calendar,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { demoConfig } from "@/config/demo.config";
import { verticalPacks } from "@/config/verticals";
import { generateTickets, generateTechs } from "@/lib/fake-data";

export default function DashboardPage() {
  const { company, scale } = demoConfig;
  const pack = verticalPacks[demoConfig.vertical];
  const tickets = generateTickets();
  const techs = generateTechs();

  const onJob = techs.filter((t) => t.status === "on_job").length;
  const urgentToday = tickets.filter((t) => t.category === "emergency").length;

  return (
    <PageShell>
      <div className="mb-8">
        <div className="text-xs uppercase tracking-wider text-text-tertiary mb-2">
          Overview
        </div>
        <h1 className="font-display text-4xl text-text-primary mb-1">
          Good morning.
        </h1>
        <p className="text-text-secondary text-sm">
          Here's what's on the board across your{" "}
          {company.location.split(",")[0]} operation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        <KpiCard
          icon={Users}
          label={pack.workerNoun.plural[0].toUpperCase() + pack.workerNoun.plural.slice(1) + " on roster"}
          value={scale.workers.toString()}
          delta={`${onJob} on a job now`}
          deltaPositive
        />
        <KpiCard
          icon={Inbox}
          label="Tickets this week"
          value={scale.weeklyTickets.toString()}
          delta="Across 4 sources"
          deltaPositive
        />
        <KpiCard
          icon={TrendingDown}
          label="Dispatch hours saved / wk"
          value={scale.weeklyDispatchHoursBefore.toString() + "h"}
          delta="vs. pre-automation"
          accent
        />
        <KpiCard
          icon={CheckCircle2}
          label="Avg time to dispatch"
          value="<1m"
          delta="from intake"
          deltaPositive
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Hero CTA */}
          <Link
            href="/dispatch"
            className="group block relative overflow-hidden rounded-lg border border-accent-border bg-gradient-to-br from-accent-glow via-transparent to-transparent p-8 hover:border-accent transition-colors"
          >
            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <div className="text-2xs uppercase tracking-wider text-accent mb-2">
                    Featured automation
                  </div>
                  <h2 className="font-display text-2xl text-text-primary mb-2">
                    Multi-source dispatch
                  </h2>
                  <p className="text-text-secondary text-sm max-w-md">
                    {scale.weeklyTickets} weekly tickets from {pack.ticketSources.length} sources.
                    Classified, matched, scheduled, and notified in seconds —
                    not hours.
                  </p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-text-tertiary group-hover:text-accent group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
              <div className="flex items-end gap-8">
                <BeforeAfter before={scale.weeklyDispatchHoursBefore} />
                <div className="text-text-secondary text-xs leading-relaxed flex-1">
                  Click through to see how it runs.
                </div>
              </div>
            </div>
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(var(--accent) 1px, transparent 1px), linear-gradient(90deg, var(--accent) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
          </Link>

          {/* Recent activity */}
          <div className="rounded-lg border border-border-subtle bg-bg-raised">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-subtle">
              <h3 className="text-sm font-medium text-text-primary">
                Recent activity
              </h3>
              <Link
                href="#"
                className="text-xs text-text-tertiary hover:text-text-secondary flex items-center gap-1"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-border-subtle">
              <ActivityRow
                icon={Zap}
                title={`${tickets.length} ${pack.jobNoun.plural} dispatched`}
                meta="Automation · 6:00 AM run"
                accent
              />
              <ActivityRow
                icon={AlertCircle}
                title={`${tickets[0]?.issue} · urgent`}
                meta={`${tickets[0]?.address} · ${tickets[0]?.assignedTech ?? "auto-assigned"} · 7 min ago`}
                warning
              />
              <ActivityRow
                icon={Phone}
                title="Voicemail transcribed and routed"
                meta={`${tickets[2]?.customer} · ${tickets[2]?.issue} · 23 min ago`}
              />
              <ActivityRow
                icon={Calendar}
                title="Customer rescheduled — automation rebooked"
                meta={`${tickets[5]?.customer} · slot rotated to ${techs[2]?.name} · 1h ago`}
              />
              <ActivityRow
                icon={CheckCircle2}
                title={`${tickets[1]?.issue} · job complete`}
                meta={`${tickets[1]?.assignedTech ?? techs[0]?.name} · ${tickets[1]?.address} · 2h ago`}
              />
            </div>
          </div>
        </div>

        {/* Right rail */}
        <div className="space-y-6">
          <SidePanel title="Today">
            <PanelRow label="Open tickets" value={tickets.length.toString()} href="/board" />
            <PanelRow
              label="Urgent"
              value={urgentToday.toString()}
              href="/dispatch"
              urgent={urgentToday > 0}
            />
            <PanelRow label={`${pack.workerNoun.plural[0].toUpperCase() + pack.workerNoun.plural.slice(1)} active`} value={onJob.toString()} href="/technicians" />
          </SidePanel>

          <SidePanel title="This week">
            <div className="px-5 py-4 space-y-3">
              <Stat label={`${pack.jobNoun.plural} dispatched`} value={scale.weeklyTickets.toString()} />
              <Stat label="Avg dispatch time" value="48s" />
              <Stat label="Manual interventions" value="4" sub="2.2% rate" />
              <Stat
                label="Dispatcher hours returned"
                value={`${scale.weeklyDispatchHoursBefore - 2}h`}
                sub="this week"
                accent
              />
            </div>
          </SidePanel>

          <div className="rounded-lg border border-border-subtle bg-bg-raised p-5">
            <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-2">
              From the operator
            </div>
            <p className="text-sm text-text-secondary leading-relaxed font-display italic">
              "Mornings used to mean two hours of triage before any wrench
              turned. Now my dispatcher walks in and the day's already routed.
              We took on 30% more {pack.jobNoun.plural} without hiring."
            </p>
            <div className="text-xs text-text-tertiary mt-3">
              — Operations lead, RA reference customer
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  delta,
  deltaPositive,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  delta: string;
  deltaPositive?: boolean;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border bg-bg-raised p-4 ${
        accent ? "border-accent-border" : "border-border-subtle"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs text-text-tertiary">{label}</div>
        <Icon
          className={`h-3.5 w-3.5 ${
            accent ? "text-accent" : "text-text-tertiary"
          }`}
        />
      </div>
      <div
        className={`font-display text-3xl tabular ${
          accent ? "text-accent-bright" : "text-text-primary"
        }`}
      >
        {value}
      </div>
      <div
        className={`text-2xs mt-2 ${
          deltaPositive
            ? "text-status-success"
            : accent
            ? "text-accent"
            : "text-text-tertiary"
        }`}
      >
        {delta}
      </div>
    </div>
  );
}

function BeforeAfter({ before }: { before: number }) {
  return (
    <div className="flex items-center gap-3 font-mono">
      <div>
        <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-1">
          Before
        </div>
        <div className="text-text-secondary line-through tabular">
          {before}h/wk
        </div>
      </div>
      <ArrowRight className="h-4 w-4 text-text-tertiary mb-0.5" />
      <div>
        <div className="text-2xs uppercase tracking-wider text-accent mb-1">
          After
        </div>
        <div className="text-accent-bright text-lg tabular font-semibold">
          ~2h
        </div>
      </div>
    </div>
  );
}

function ActivityRow({
  icon: Icon,
  title,
  meta,
  accent,
  warning,
}: {
  icon: React.ElementType;
  title: string;
  meta: string;
  accent?: boolean;
  warning?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02]">
      <div
        className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 ${
          accent
            ? "bg-accent-glow text-accent-bright"
            : warning
            ? "bg-status-warning/10 text-status-warning"
            : "bg-white/5 text-text-tertiary"
        }`}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm text-text-primary truncate">{title}</div>
        <div className="text-2xs text-text-tertiary">{meta}</div>
      </div>
    </div>
  );
}

function SidePanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border-subtle bg-bg-raised">
      <div className="px-5 py-3 border-b border-border-subtle">
        <h3 className="text-xs uppercase tracking-wider text-text-tertiary">
          {title}
        </h3>
      </div>
      <div className="divide-y divide-border-subtle">{children}</div>
    </div>
  );
}

function PanelRow({
  label,
  value,
  href,
  urgent,
}: {
  label: string;
  value: string;
  href: string;
  urgent?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between px-5 py-2.5 hover:bg-white/[0.02] group"
    >
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="flex items-center gap-2">
        <span
          className={`tabular text-sm ${
            urgent ? "text-status-warning" : "text-text-primary"
          }`}
        >
          {value}
        </span>
        <ArrowRight className="h-3 w-3 text-text-dim group-hover:text-text-tertiary group-hover:translate-x-0.5 transition-all" />
      </span>
    </Link>
  );
}

function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-xs text-text-tertiary">{label}</span>
      <span className="text-right">
        <span
          className={`tabular text-sm ${
            accent ? "text-accent-bright font-semibold" : "text-text-primary"
          }`}
        >
          {value}
        </span>
        {sub && <span className="block text-2xs text-text-dim">{sub}</span>}
      </span>
    </div>
  );
}
