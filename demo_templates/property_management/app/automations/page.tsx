"use client";

import { useState } from "react";
import {
  Receipt,
  Wrench,
  Users,
  CreditCard,
  FileText,
  MessageSquare,
  Calendar,
  ClipboardList,
  Sparkles,
  Check,
  ArrowRight,
  X,
  Zap,
  Clock,
  TrendingUp,
  Phone,
  ShieldCheck,
  GitBranch,
  LineChart,
  ChevronDown,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { demoConfig } from "@/config/demo.config";
import { cn } from "@/lib/utils";

type Status = "active" | "available" | "beta";

interface Automation {
  key: string;
  title: string;
  tagline: string;
  description: string;
  icon: React.ElementType;
  status: Status;
  hoursPerMonth: number;
  category: "Billing" | "Maintenance" | "Tenant" | "Operations";
  triggers: string[];
  actions: string[];
}

export default function AutomationsPage() {
  const [selected, setSelected] = useState<Automation | null>(null);
  const [expanded, setExpanded] = useState(false);

  const automations = buildAutomations();

  const totalActive = automations.filter((a) => a.status === "active").length;
  const totalSaved = automations
    .filter((a) => a.status === "active")
    .reduce((s, a) => s + a.hoursPerMonth, 0);
  const potential = automations
    .filter((a) => a.status !== "active")
    .reduce((s, a) => s + a.hoursPerMonth, 0);

  return (
    <PageShell>
      <div className="mb-6">
        <div className="text-xs uppercase tracking-wider text-text-tertiary mb-2">
          Automations
        </div>
        <h1 className="font-display text-3xl text-text-primary">
          What we can take off your team's plate.
        </h1>
        <p className="text-text-secondary text-sm mt-1 max-w-2xl">
          Each one is a workflow your ops team runs by hand today. Activate any of
          them and we'll have it live in your environment within a week.
        </p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
        <Stat
          icon={Check}
          label="Active automations"
          value={totalActive.toString()}
          sub={`${automations.length} total available`}
        />
        <Stat
          icon={Clock}
          label="Hours saved / mo today"
          value={`${totalSaved}h`}
          sub="from active automations"
          accent
        />
        <Stat
          icon={TrendingUp}
          label="Additional hours available"
          value={`+${potential}h`}
          sub="if you activate the rest"
        />
      </div>

      {/* Collapsible automations list */}
      <div className="rounded-lg border border-border-subtle bg-bg-raised overflow-hidden">
        <button
          onClick={() => setExpanded((e) => !e)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-black/[0.025] transition-colors"
        >
          <div className="flex items-baseline gap-3">
            <span className="text-sm font-medium text-text-primary">
              All automations
            </span>
            <span className="text-xs text-text-tertiary tabular">
              {automations.length}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xs text-text-tertiary hidden sm:inline">
              {expanded ? "Hide" : "Show all"}
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-text-tertiary transition-transform",
                expanded && "rotate-180"
              )}
            />
          </div>
        </button>
        {expanded && (
          <div className="border-t border-border-subtle p-3 grid grid-cols-1 md:grid-cols-2 gap-3 bg-bg-base/30">
            {automations.map((a) => (
              <AutomationCard
                key={a.key}
                automation={a}
                onClick={() => setSelected(a)}
              />
            ))}
          </div>
        )}
      </div>

      {/* What we can do for you */}
      <div className="mt-12">
        <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-2">
          What we do for you
        </div>
        <h2 className="font-display text-2xl text-text-primary mb-1">
          A team, not a tool.
        </h2>
        <p className="text-text-secondary text-sm max-w-2xl mb-6">
          You don't buy software and figure it out. We sit with your ops team,
          map the workflow, build it, and keep it running. If a portal layout
          changes at 2am, that's our problem to solve.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <ValueCard
            icon={GitBranch}
            title="Built around your stack"
            body="We work with the accounting, PMS, bank feeds, and vendor portals you already use. No rip-and-replace."
          />
          <ValueCard
            icon={ShieldCheck}
            title="We monitor, you don't"
            body="If a workflow fails or a portal changes, our team is paged. You see a clean dashboard while we fix it upstream."
          />
          <ValueCard
            icon={LineChart}
            title="Measurable, every month"
            body="Hours saved, exceptions handled, revenue protected. You see the numbers in your dashboard, not in a sales deck."
          />
          <ValueCard
            icon={Phone}
            title="Real humans, on call"
            body="The same team that built your automation answers your messages. 12-hour daily coverage with median response under 30 minutes during business hours."
          />
        </div>

        {/* How we ship */}
        <div className="rounded-lg border border-border-subtle bg-bg-raised p-6 mb-6">
          <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-1">
            How we work with you
          </div>
          <h3 className="font-display text-lg text-text-primary mb-1">
            From discovery to live in 4-8 weeks · then we stay.
          </h3>
          <p className="text-text-secondary text-sm mb-6 max-w-3xl leading-relaxed">
            We're not a tool you buy and onboard. We're a small team that sits
            with your ops people, builds in phases, and stays on after launch
            to keep the platform running and grow it with you.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <ProcessStep
              step="01"
              title="Discover"
              body="We sit down with your team and outline the pain points and current manual workflows — what you actually do, end-to-end. No deck, no questionnaire."
              days="week 1-2"
            />
            <ProcessStep
              step="02"
              title="Build, phase by phase"
              body="We ship in slices, not big-bangs. Each phase gets full testing in our environment against your real data before it touches production."
              days="week 2-5"
            />
            <ProcessStep
              step="03"
              title="Onboard at your pace"
              body="Pilot runs in shadow mode alongside your existing process. Your team trains and cuts over only when ready — no forced flag day."
              days="week 5-7"
            />
            <ProcessStep
              step="04"
              title="Maintain & expand"
              body="Once live, we stay on retainer: monitor every run, patch portal changes, and build the next automation as new pain points surface."
              days="ongoing"
            />
          </div>
        </div>

        {/* Quote + CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2 rounded-lg border border-border-subtle bg-bg-raised p-6">
            <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-3">
              From the operator
            </div>
            <p className="text-base text-text-primary leading-relaxed font-display italic mb-4">
              "We tried two SaaS platforms before RA. Both required us to change
              our process to fit their software. RA learned how we work and
              built around it. The utility billing run alone gave us back a week
              every month."
            </p>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-accent-glow border border-accent-border flex items-center justify-center text-base text-accent-bright font-display leading-none">
                &ldquo;
              </div>
              <div className="text-sm text-text-primary">
                Satisfied customer
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-accent-border bg-accent-glow/30 p-6 flex flex-col">
            <Sparkles className="h-5 w-5 text-accent mb-3" />
            <div className="font-display text-lg text-text-primary mb-2">
              Don't see your workflow?
            </div>
            <p className="text-sm text-text-secondary leading-relaxed mb-4 flex-1">
              If your team does it the same way every week, we can build it.
              Most custom automations ship within 2-3 weeks of kickoff.
            </p>
            <a
              href="mailto:megha@reasonableautomations.com?subject=New%20automation%20request&body=Hi%20Megha%2C%0A%0AI%27d%20like%20to%20talk%20about%20a%20workflow%20we%20could%20automate%3A%0A%0A"
              className="px-3 py-2 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-bright flex items-center justify-center gap-2"
            >
              Tell us about it
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      {selected && (
        <AutomationDetail
          automation={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </PageShell>
  );
}

function AutomationCard({
  automation,
  onClick,
}: {
  automation: Automation;
  onClick: () => void;
}) {
  const Icon = automation.icon;
  const status = automation.status;
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-left rounded-lg border bg-bg-raised p-5 hover:border-accent-border transition-colors group",
        status === "active" ? "border-status-success/30" : "border-border-subtle"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            "h-9 w-9 rounded-md flex items-center justify-center",
            status === "active"
              ? "bg-status-success/10 text-status-success"
              : "bg-accent-glow text-accent-bright"
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <StatusBadge status={status} />
      </div>
      <div className="text-sm font-medium text-text-primary mb-1">
        {automation.title}
      </div>
      <div className="text-xs text-text-tertiary mb-4 leading-relaxed">
        {automation.tagline}
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
        <div className="text-2xs text-text-tertiary">
          <span className="text-text-secondary tabular">
            {automation.hoursPerMonth}h
          </span>{" "}
          / mo saved
        </div>
        <div className="text-2xs text-text-tertiary group-hover:text-accent flex items-center gap-1">
          {status === "active" ? "View details" : "See how it works"}
          <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </button>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const map = {
    active: {
      label: "Active",
      cls: "bg-status-success/10 text-status-success border-status-success/20",
    },
    available: {
      label: "Available",
      cls: "bg-accent-glow text-accent-bright border-accent-border",
    },
    beta: {
      label: "Beta",
      cls: "bg-status-warning/10 text-status-warning border-status-warning/20",
    },
  } as const;
  const m = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-2xs uppercase tracking-wider border",
        m.cls
      )}
    >
      {m.label}
    </span>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
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
      <div className="flex items-center justify-between mb-2">
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
          "font-display text-3xl tabular",
          accent ? "text-accent-bright" : "text-text-primary"
        )}
      >
        {value}
      </div>
      <div className="text-2xs text-text-tertiary mt-1">{sub}</div>
    </div>
  );
}

function AutomationDetail({
  automation,
  onClose,
}: {
  automation: Automation;
  onClose: () => void;
}) {
  const Icon = automation.icon;
  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg h-full bg-bg-raised border-l border-border overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-border-subtle flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "h-10 w-10 rounded-md flex items-center justify-center shrink-0",
                automation.status === "active"
                  ? "bg-status-success/10 text-status-success"
                  : "bg-accent-glow text-accent-bright"
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-0.5">
                {automation.category}
              </div>
              <div className="font-display text-xl text-text-primary leading-tight">
                {automation.title}
              </div>
              <div className="mt-1.5">
                <StatusBadge status={automation.status} />
              </div>
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
          <p className="text-sm text-text-secondary leading-relaxed">
            {automation.description}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md border border-border-subtle bg-bg-base p-3">
              <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-1">
                Hours saved / mo
              </div>
              <div className="font-display text-2xl text-accent-bright tabular">
                {automation.hoursPerMonth}h
              </div>
            </div>
            <div className="rounded-md border border-border-subtle bg-bg-base p-3">
              <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-1">
                Setup time
              </div>
              <div className="font-display text-2xl text-text-primary tabular">
                {automation.status === "active" ? "Live" : "1 wk"}
              </div>
            </div>
          </div>

          <div>
            <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-2 flex items-center gap-1.5">
              <Zap className="h-3 w-3" /> Triggered by
            </div>
            <div className="space-y-1.5">
              {automation.triggers.map((t, i) => (
                <div
                  key={i}
                  className="text-xs text-text-secondary flex items-start gap-2"
                >
                  <span className="text-text-dim mt-1">·</span>
                  {t}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-2">
              What it does
            </div>
            <ol className="space-y-2">
              {automation.actions.map((a, i) => (
                <li
                  key={i}
                  className="text-xs text-text-secondary flex items-start gap-2"
                >
                  <span className="h-4 w-4 rounded-full bg-bg-base border border-border text-2xs text-text-tertiary flex items-center justify-center shrink-0 tabular">
                    {i + 1}
                  </span>
                  {a}
                </li>
              ))}
            </ol>
          </div>

          <div className="pt-4 border-t border-border-subtle">
            {automation.status === "active" ? (
              <div className="space-y-3">
                <div className="text-xs text-status-success flex items-center gap-1.5">
                  <Check className="h-3 w-3" />
                  Currently running for {demoConfig.company.name}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      alert(`Opening ${automation.title} run history`)
                    }
                    className="flex-1 px-3 py-2 rounded-md border border-border bg-bg-subtle text-sm text-text-secondary hover:bg-black/[0.04]"
                  >
                    View runs
                  </button>
                  <button
                    onClick={() => alert(`Configure ${automation.title}`)}
                    className="flex-1 px-3 py-2 rounded-md border border-border bg-bg-subtle text-sm text-text-secondary hover:bg-black/[0.04]"
                  >
                    Configure
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs text-text-secondary leading-relaxed">
                  Activate this automation and we'll work with you to map it to
                  your specific tools and exception rules. Most ship within 1-2
                  weeks.
                </div>
                <button
                  onClick={() =>
                    alert(
                      `Request received for: ${automation.title}\n\nYour RA contact will reach out within 1 business day to scope the integration.`
                    )
                  }
                  className="w-full px-4 py-2.5 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-bright flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Request activation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ValueCard({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ElementType;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-lg border border-border-subtle bg-bg-raised p-5">
      <div className="h-8 w-8 rounded-md bg-accent-glow text-accent-bright flex items-center justify-center mb-3">
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-sm font-medium text-text-primary mb-1">{title}</div>
      <div className="text-xs text-text-tertiary leading-relaxed">{body}</div>
    </div>
  );
}

function ProcessStep({
  step,
  title,
  body,
  days,
}: {
  step: string;
  title: string;
  body: string;
  days: string;
}) {
  return (
    <div className="relative">
      <div className="font-mono text-2xs text-accent mb-1.5 tabular">{step}</div>
      <div className="text-sm font-medium text-text-primary mb-1">{title}</div>
      <div className="text-2xs text-text-tertiary leading-relaxed mb-2">{body}</div>
      <div className="text-2xs text-text-dim tabular">{days}</div>
    </div>
  );
}

function buildAutomations(): Automation[] {
  return [
    {
      key: "utility_billing",
      title: "Utility billing run",
      tagline:
        "Pull every utility statement, parse PDFs, post charges to the right unit — overnight.",
      description:
        "Replaces the first week of every billing cycle. Logs into each utility portal, downloads new statements, parses line items, matches to units, posts to your PMS. Flags exceptions for your ops team to review.",
      icon: Receipt,
      status: "active",
      hoursPerMonth: 197,
      category: "Billing",
      triggers: ["Scheduled monthly (1st @ 2:00 AM)", "Manual run from dashboard"],
      actions: [
        "Authenticate to each utility provider portal",
        "Download all new statements since last run",
        "Parse PDFs for amounts, dates, line items",
        "Match each statement to the correct unit in your PMS",
        "Post matched statements; queue exceptions for review",
      ],
    },
    {
      key: "maintenance_dispatch",
      title: "Maintenance auto-dispatch",
      tagline:
        "Route every work order to the best vendor based on type, location, and current load.",
      description:
        "When a tenant submits a request, we route it within 60 seconds to the right vendor with full context. Tenant gets a confirmation, vendor gets the work order, ops team sees it in the queue.",
      icon: Wrench,
      status: "active",
      hoursPerMonth: 34,
      category: "Maintenance",
      triggers: [
        "New work order submitted by tenant",
        "Manual ticket creation by ops",
      ],
      actions: [
        "Classify ticket by type and urgency",
        "Filter eligible vendors by trade and service area",
        "Rank by current load and historical performance",
        "Send dispatch to top 3 in parallel; first-to-accept wins",
        "Notify tenant by SMS + email with ETA",
      ],
    },
    {
      key: "rent_collection",
      title: "Rent collection & late notices",
      tagline:
        "Automated reminders, escalating notices, and a daily rent roll snapshot.",
      description:
        "Sends rent reminders 5 days before due, friendly nudges on day 1 late, formal notices on day 5, and routes serious delinquencies to your team with a complete history attached. Posts received payments to the unit ledger automatically.",
      icon: CreditCard,
      status: "available",
      hoursPerMonth: 28,
      category: "Billing",
      triggers: [
        "5 days before rent due",
        "Day rent is due",
        "Days 1, 3, 5, 10, 15 past due",
        "Payment received in bank feed",
      ],
      actions: [
        "Send templated reminder to tenant by their preferred channel",
        "Escalate tone and add late fees per lease terms",
        "Match incoming payments to the right unit ledger",
        "Generate daily rent roll for your ops lead",
        "Flag accounts >15 days late for manual escalation",
      ],
    },
    {
      key: "vendor_outreach",
      title: "Vendor outreach & confirmations",
      tagline:
        "Auto-text vendors when work is ready and confirm appointments by SMS.",
      description:
        "Stops the back-and-forth. When a work order needs a vendor, we send the request to the top 3 candidates in parallel, the first to accept gets it, and we confirm 24h before the appointment with the tenant.",
      icon: MessageSquare,
      status: "available",
      hoursPerMonth: 19,
      category: "Maintenance",
      triggers: [
        "Work order created and routed",
        "24h before scheduled appointment",
        "Vendor marks job complete",
      ],
      actions: [
        "Send dispatch SMS to top 3 vendors with full context",
        "Award job to first vendor to accept (typically <5 min)",
        "Auto-decline the others with thanks",
        "Send tenant a confirmation 24h before with vendor name",
        "Request follow-up rating after completion",
      ],
    },
    {
      key: "lease_renewals",
      title: "Lease renewal pipeline",
      tagline:
        "Surface upcoming renewals 90 days out and auto-draft renewal offers.",
      description:
        "Pulls every lease expiring in the next 90 days, ranks by retention risk (rent increase, recent tickets, payment history), and drafts a renewal offer per unit. Your team approves, we send.",
      icon: FileText,
      status: "available",
      hoursPerMonth: 22,
      category: "Tenant",
      triggers: [
        "Daily check for leases 90/60/30 days from expiry",
        "Manual renewal request",
      ],
      actions: [
        "List all leases expiring in the rolling 90-day window",
        "Score each tenant on retention risk and willingness-to-pay",
        "Draft a renewal offer with proposed rent and term",
        "Queue for ops approval (single-click send)",
        "Auto-send approved offers; track signed/declined/no-response",
      ],
    },
    {
      key: "ap_processing",
      title: "AP invoice processing",
      tagline:
        "Inbox-to-ledger in seconds — read invoices, match to POs, post for approval.",
      description:
        "Forward your vendor invoices to a dedicated inbox. We read the PDF, extract line items, match to the right work order or PO, code to the right GL account, and queue for approval based on amount thresholds.",
      icon: ClipboardList,
      status: "available",
      hoursPerMonth: 41,
      category: "Operations",
      triggers: [
        "Email received at ap@ inbox",
        "Vendor portal invoice posted",
      ],
      actions: [
        "OCR the invoice PDF and extract line items",
        "Match to the originating work order or PO",
        "Code to the correct GL account by vendor + property",
        "Auto-approve under your threshold; route others to approver",
        "Post approved invoices to your AP ledger",
      ],
    },
    {
      key: "tenant_onboarding",
      title: "Tenant onboarding",
      tagline:
        "From signed lease to keys-in-hand — utilities, welcome packet, walkthrough scheduling.",
      description:
        "When a lease is signed, we kick off everything else: utility account setup notification, welcome email with the unit's docs, move-in walkthrough scheduled, and the unit moved from 'leasing' to 'occupied' across all systems.",
      icon: Users,
      status: "beta",
      hoursPerMonth: 14,
      category: "Tenant",
      triggers: ["Lease signed in your e-sign tool"],
      actions: [
        "Notify tenant of utility setup steps",
        "Send personalized welcome email with unit docs + community info",
        "Propose 3 walkthrough times via SMS",
        "Update unit status to 'occupied' in your PMS",
        "Add tenant to community announcement list",
      ],
    },
    {
      key: "complaint_triage",
      title: "Tenant complaint triage",
      tagline:
        "Read every inbound message, route urgent ones, draft replies for the rest.",
      description:
        "Handles your shared inbox so nothing slips through. Classifies inbound emails and texts (urgent vs. informational vs. complaint), drafts a contextual reply for routine ones, and pages the right person for emergencies.",
      icon: MessageSquare,
      status: "beta",
      hoursPerMonth: 17,
      category: "Tenant",
      triggers: [
        "Inbound email to support inbox",
        "Inbound SMS to property line",
      ],
      actions: [
        "Classify message intent and urgency",
        "Page on-call for emergencies (water, fire, security)",
        "Draft a reply with relevant unit context for routine questions",
        "Auto-create a work order if a maintenance issue is described",
        "Log the interaction in the tenant's record",
      ],
    },
    {
      key: "inspections",
      title: "Inspection scheduling",
      tagline:
        "Schedule quarterly walkthroughs and annual inspections without the calendar Tetris.",
      description:
        "Generates a rolling 90-day inspection schedule across your portfolio, sends tenant notice with the legally required lead time, and creates a checklist work order for your inspector.",
      icon: Calendar,
      status: "available",
      hoursPerMonth: 9,
      category: "Operations",
      triggers: [
        "Quarterly schedule cycle",
        "Annual inspection date approaching",
      ],
      actions: [
        "Generate inspection slots across the portfolio",
        "Send tenant notice with 24/48h lead time",
        "Create checklist work order for the inspector",
        "Reschedule on tenant decline within the legal window",
        "File inspection results to the property record",
      ],
    },
  ];
}
