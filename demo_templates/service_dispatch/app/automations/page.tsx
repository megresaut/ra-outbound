"use client";

import { useState } from "react";
import {
  Inbox,
  Zap,
  Receipt,
  MessageSquare,
  Calendar,
  Truck,
  ClipboardList,
  Star,
  Phone,
  Sparkles,
  Check,
  ArrowRight,
  X,
  Clock,
  TrendingUp,
  GitBranch,
  ShieldCheck,
  LineChart,
  ChevronDown,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { demoConfig } from "@/config/demo.config";
import { verticalPacks } from "@/config/verticals";
import { cn } from "@/lib/utils";

type Status = "active" | "available" | "beta";

interface Automation {
  key: string;
  title: string;
  tagline: string;
  description: string;
  icon: React.ElementType;
  status: Status;
  hoursPerWeek: number;
  category: "Intake" | "Dispatch" | "Field" | "Billing" | "Customer";
  triggers: string[];
  actions: string[];
}

export default function AutomationsPage() {
  const [selected, setSelected] = useState<Automation | null>(null);
  const [expanded, setExpanded] = useState(false);

  const pack = verticalPacks[demoConfig.vertical];
  const automations = buildAutomations(pack.workerNoun.singular, pack.jobNoun.plural);

  const totalActive = automations.filter((a) => a.status === "active").length;
  const totalSaved = automations
    .filter((a) => a.status === "active")
    .reduce((s, a) => s + a.hoursPerWeek, 0);
  const potential = automations
    .filter((a) => a.status !== "active")
    .reduce((s, a) => s + a.hoursPerWeek, 0);

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
          Each one is a workflow your dispatcher, office staff, or owner runs by
          hand today. Activate any of them and we'll have it live in your
          environment within a few weeks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
        <Stat
          icon={Check}
          label="Active automations"
          value={totalActive.toString()}
          sub={`${automations.length} total available`}
        />
        <Stat
          icon={Clock}
          label="Hours saved / wk today"
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

      <div className="rounded-lg border border-border-subtle bg-bg-raised overflow-hidden">
        <button
          onClick={() => setExpanded((e) => !e)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
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

      {/* What we do for you */}
      <div className="mt-12">
        <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-2">
          What we do for you
        </div>
        <h2 className="font-display text-2xl text-text-primary mb-1">
          A team, not a tool.
        </h2>
        <p className="text-text-secondary text-sm max-w-2xl mb-6">
          You don't buy software and figure it out. We sit with your dispatcher
          and ops team, map the workflow, build it, and stay on after launch to
          keep it running and grow it with you.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <ValueCard
            icon={GitBranch}
            title="Built around your stack"
            body="We work with the field service system, accounting, phone provider, and tools you already use. No rip-and-replace."
          />
          <ValueCard
            icon={ShieldCheck}
            title="We monitor, you don't"
            body="If a workflow fails or a portal changes, our team is paged. You see a clean dashboard while we fix it upstream."
          />
          <ValueCard
            icon={LineChart}
            title="Measurable, every week"
            body="Hours saved, urgents caught, revenue captured. You see the numbers in your dashboard, not in a sales deck."
          />
          <ValueCard
            icon={Phone}
            title="Real humans, on call"
            body="The same team that built your automation answers your messages. 12-hour daily coverage with median response under 30 minutes during business hours."
          />
        </div>

        {/* How we work */}
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
              "We tried two SaaS dispatch platforms before RA. Both wanted us to
              change our process to fit their software. RA learned how we
              actually work and built around it. Our dispatcher got her
              afternoons back — and we stopped missing emergency calls that
              came in by email."
            </p>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-accent-glow border border-accent-border flex items-center justify-center text-base text-accent-bright font-display leading-none">
                &ldquo;
              </div>
              <div className="text-sm text-text-primary">Satisfied customer</div>
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
            {automation.hoursPerWeek}h
          </span>{" "}
          / wk saved
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
      <div className="text-2xs text-text-tertiary leading-relaxed mb-2">
        {body}
      </div>
      <div className="text-2xs text-text-dim tabular">{days}</div>
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
                Hours saved / wk
              </div>
              <div className="font-display text-2xl text-accent-bright tabular">
                {automation.hoursPerWeek}h
              </div>
            </div>
            <div className="rounded-md border border-border-subtle bg-bg-base p-3">
              <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-1">
                Setup time
              </div>
              <div className="font-display text-2xl text-text-primary tabular">
                {automation.status === "active" ? "Live" : "1-2 wk"}
              </div>
            </div>
          </div>

          <div>
            <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-2">
              Triggered by
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
                    onClick={() => alert(`Opening ${automation.title} run history`)}
                    className="flex-1 px-3 py-2 rounded-md border border-border bg-bg-subtle text-sm text-text-secondary hover:bg-white/[0.04]"
                  >
                    View runs
                  </button>
                  <button
                    onClick={() => alert(`Configure ${automation.title}`)}
                    className="flex-1 px-3 py-2 rounded-md border border-border bg-bg-subtle text-sm text-text-secondary hover:bg-white/[0.04]"
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
                <a
                  href={`mailto:megha@reasonableautomations.com?subject=${encodeURIComponent(
                    `Activate: ${automation.title}`
                  )}&body=${encodeURIComponent(
                    `Hi Megha,\n\nWe'd like to activate the "${automation.title}" automation. Let's chat about scope.\n\n`
                  )}`}
                  className="w-full px-4 py-2.5 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-bright flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Request activation
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function buildAutomations(workerSingular: string, jobPlural: string): Automation[] {
  return [
    {
      key: "intake",
      title: "Lead intake sweep",
      tagline: `Pull from every inbox + scrape public sources for new ${jobPlural}.`,
      description:
        "Sweeps your shared inboxes (email, voicemail, SMS, web form) plus public sources (Nextdoor, Yelp inbox, Google Q&A, local subreddits, Craigslist gigs) every 15 minutes. Classifies intent, dedupes, drafts replies, and queues everything for your team to triage.",
      icon: Inbox,
      status: "active",
      hoursPerWeek: 8,
      category: "Intake",
      triggers: [
        "Every 15 minutes (configurable)",
        "On demand from this dashboard",
      ],
      actions: [
        "Pull from each shared inbox + transcribe voicemails",
        "Scrape public sources (Nextdoor, Yelp, Google Q&A, Reddit, Craigslist)",
        "Classify intent with LLM (service / question / spam / urgent)",
        "Page on-call for urgents · filter spam before it reaches your team",
        "De-dupe against last 30 days of tickets",
        "Draft personalized replies and queue for human approval",
      ],
    },
    {
      key: "dispatch",
      title: "Morning dispatch run",
      tagline: `Classify, route, book, and notify all overnight ${jobPlural} in one job.`,
      description:
        "Every morning at 6 AM (and on every new urgent ticket): pull all new requests, classify urgency, match to the right tech by skills/calendar/location, book on calendars, and send confirmations to customers and techs.",
      icon: Zap,
      status: "active",
      hoursPerWeek: 14,
      category: "Dispatch",
      triggers: [
        "Daily at 6:00 AM",
        "Immediately when an urgent ticket comes in",
      ],
      actions: [
        "Pull all new requests since last run",
        "Classify urgency (LLM-assisted)",
        `Match to the right ${workerSingular} by skills, calendar, and proximity`,
        "Book on calendars (Google Calendar + your field service system)",
        "Notify customers by SMS + tech by push notification",
      ],
    },
    {
      key: "billing",
      title: "Daily billing & collections",
      tagline: `Auto-invoice completed ${jobPlural}, charge cards on file, reconcile to accounting.`,
      description:
        "Pulls completed jobs at 7 PM, drafts invoices with labor + parts + tax, sends by email or SMS, charges cards on file for autopay accounts, and reconciles everything to your accounting. Disputes and large charges always wait for human approval.",
      icon: Receipt,
      status: "active",
      hoursPerWeek: 6,
      category: "Billing",
      triggers: ["Daily at 7:00 PM", "On demand"],
      actions: [
        "Pull completed jobs from your field service system",
        "Draft invoices with labor (from GPS), parts (from scan-out), and tax",
        "Send by email or SMS based on customer preference",
        "Auto-charge cards on file (autopay accounts only)",
        "Hold large charges or disputes for human approval",
        "Reconcile invoices and payments to QuickBooks / Xero",
      ],
    },
    {
      key: "estimates",
      title: "Quote follow-up",
      tagline: "Auto-follow-up on outstanding estimates so they don't go cold.",
      description:
        "When a quote sits for 3 days without acceptance, we send a friendly nudge. After 7 days, we send a more substantive follow-up with FAQ. After 14, we surface to your team for a personal call. Recovers ~12% of dormant quotes.",
      icon: ClipboardList,
      status: "available",
      hoursPerWeek: 4,
      category: "Customer",
      triggers: [
        "3 days after quote sent (no response)",
        "7 days after quote sent (no response)",
        "14 days after quote sent (no response) — surfaces for human follow-up",
      ],
      actions: [
        "Day 3: friendly check-in by SMS or email (customer preference)",
        "Day 7: substantive follow-up with FAQ + financing options",
        "Day 14: surface to your team with full quote history attached",
        "Stop follow-up immediately if customer replies or accepts",
      ],
    },
    {
      key: "reviews",
      title: "Review request flow",
      tagline: "Ask happy customers for Google reviews — at the right moment.",
      description:
        "After a job marked complete + a positive customer survey response, we send a one-tap Google review request 24h later. Negative survey responses are routed to your team for personal follow-up instead. Lifts review velocity ~3x without spamming.",
      icon: Star,
      status: "available",
      hoursPerWeek: 2,
      category: "Customer",
      triggers: [
        "24h after job complete + positive survey rating (4-5 stars)",
      ],
      actions: [
        "Send post-job survey by SMS (1-5 stars + optional comment)",
        "Wait 24h after positive response, then request Google review",
        "Route negative responses to your team for personal callback (no public ask)",
        "Track review acceptance rate per technician",
      ],
    },
    {
      key: "missed-calls",
      title: "Missed-call rescue",
      tagline: "Text every missed call back within 60 seconds.",
      description:
        "When your line rings and no one picks up, we text the caller within 60 seconds offering a callback time and a link to book online. Captures ~38% of missed calls that would otherwise go to a competitor.",
      icon: Phone,
      status: "available",
      hoursPerWeek: 3,
      category: "Intake",
      triggers: ["Inbound call rings + goes unanswered (no voicemail required)"],
      actions: [
        "Auto-text the caller within 60 seconds with a polite acknowledgment",
        "Offer a callback window or a one-tap link to self-book",
        "If they self-book, the lead enters your dispatch flow normally",
        "If they reply by text, route to your dispatcher's queue",
      ],
    },
    {
      key: "service-agreements",
      title: "Service agreement renewals",
      tagline: "Surface upcoming maintenance contract renewals 60 days out.",
      description:
        "Pulls every active service agreement, identifies ones expiring in the next 60 days, drafts renewal offers with proposed pricing, and queues them for your approval. Renewal letters go out only after sign-off.",
      icon: Calendar,
      status: "available",
      hoursPerWeek: 2,
      category: "Customer",
      triggers: [
        "Daily check for agreements expiring in next 60 days",
      ],
      actions: [
        "List agreements expiring in the rolling 60-day window",
        "Score retention risk based on tickets, payment history, response patterns",
        "Draft renewal offer with proposed pricing and term length",
        "Queue for your approval (single-click send)",
        "Auto-send approved offers; track signed/declined/no-response",
      ],
    },
    {
      key: "route-opt",
      title: "Daily route optimization",
      tagline: "Re-sequence tech routes overnight to cut drive time 18-25%.",
      description:
        "Every night, pulls tomorrow's confirmed jobs and re-sequences each tech's route to minimize drive time while honoring time windows and tech skills. Updates calendars before techs wake up.",
      icon: Truck,
      status: "beta",
      hoursPerWeek: 5,
      category: "Field",
      triggers: ["Nightly at 11 PM (after final dispatch confirmations)"],
      actions: [
        "Pull tomorrow's confirmed jobs per technician",
        "Compute optimal sequence honoring time windows + skills",
        "Account for traffic patterns by time of day",
        "Update calendars and notify each tech of changes by push",
        "Surface any conflicts that can't be resolved",
      ],
    },
    {
      key: "ops-triage",
      title: "Customer message triage",
      tagline: "Read every customer text and route urgent ones, draft replies for the rest.",
      description:
        "Handles your shared SMS inbox so nothing slips through. Classifies inbound texts (urgent vs. routine vs. spam), pages on-call for emergencies, drafts contextual replies for routine questions.",
      icon: MessageSquare,
      status: "beta",
      hoursPerWeek: 4,
      category: "Customer",
      triggers: [
        "Inbound SMS to the business line",
      ],
      actions: [
        "Classify message intent and urgency",
        "Page on-call for emergencies (gas smell, no heat winter, etc.)",
        "Draft a reply with relevant ticket / customer context",
        "Auto-create a service ticket if a service issue is described",
        "Log every interaction in the customer's record",
      ],
    },
  ];
}
