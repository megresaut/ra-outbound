"use client";

import Link from "next/link";
import { useTransition } from "react";
import {
  ArrowLeft,
  ExternalLink,
  Mail,
  MapPin,
  Users,
  CheckCircle2,
  CheckCircle,
  XCircle,
  Circle,
  Globe,
  Building2,
  Briefcase,
  Cpu,
  CalendarDays,
  Quote,
  Clock,
  MessageSquare,
  CalendarCheck,
  Loader2,
} from "lucide-react";
import type { Prospect, Stage } from "@/lib/prospects";
import { StagePill } from "@/components/StagePill";
import { StageProgress } from "@/components/StageProgress";
import { formatDate, formatRelative, cn } from "@/lib/utils";
import { transitionAction } from "./actions";
import { DemoControlPanel } from "./DemoControlPanel";

type TimelineEvent = { date: string; event: string; note?: string };

export function ProspectView({ prospect: p }: { prospect: Prospect }) {
  const stage = p.stage;
  const timeline = p.timeline;
  const [isPending, startTransition] = useTransition();

  function transition(next: Stage, _eventLabel: string, note?: string) {
    startTransition(async () => {
      await transitionAction(p.slug, next, note);
    });
  }

  return (
    <div className="mx-auto max-w-[1200px] px-8 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-white/50 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to outreach
      </Link>

      <header className="mt-6 flex items-start justify-between gap-8">
        <div className="flex items-start gap-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] font-display text-2xl text-white/90">
            {p.company.charAt(0)}
          </div>
          <div>
            <div className="mb-1.5 flex items-center gap-3">
              <span className="text-xs uppercase tracking-[0.18em] text-white/40">
                {p.industry}
              </span>
              <StagePill stage={stage} size="md" />
            </div>
            <h1 className="font-display text-4xl font-light tracking-tight">
              {p.company}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-white/50">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {p.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {p.employees} employees
              </span>
              <a
                href={`https://${p.website}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
              >
                <Globe className="h-3.5 w-3.5" />
                {p.website}
              </a>
            </div>
          </div>
        </div>

        <ProspectActions
          stage={stage}
          email={p.champion.email}
          onTransition={transition}
          pending={isPending}
        />
      </header>

      {stage !== "email_drafted" && (
        <StatusCard stage={stage} events={timeline} />
      )}

      <div className="card mt-8 px-6 py-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-xs uppercase tracking-wider text-white/40">
            Pipeline
          </div>
          <div className="text-xs text-white/40">
            Last touch ·{" "}
            <span className="text-white/70">
              {formatRelative(timeline[timeline.length - 1]?.date ?? p.lastTouch)}
            </span>
          </div>
        </div>
        <StageProgress current={stage} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <section className="card px-6 py-5">
            <h2 className="mb-4 text-xs uppercase tracking-wider text-white/40">
              Champion
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-base font-medium text-white">
                  {p.champion.name}
                </div>
                <div className="text-sm text-white/50">{p.champion.title}</div>
              </div>
              <a
                href={`mailto:${p.champion.email}`}
                className="font-mono text-xs text-white/60 transition-colors hover:text-emerald-300"
              >
                {p.champion.email}
              </a>
            </div>
          </section>

          {p.research && (
            <section id="research" className="card px-6 py-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xs uppercase tracking-wider text-white/40">
                  Research findings
                </h2>
                <span className="text-[11px] text-white/40">Agent 1 · Researcher</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <ResearchFact
                  icon={<Briefcase className="h-3.5 w-3.5" />}
                  label="Funding"
                  value={p.research.fundingStatus}
                />
                <ResearchFact
                  icon={<CalendarDays className="h-3.5 w-3.5" />}
                  label="Operating"
                  value={`${p.research.yearsOperating} years`}
                />
                <ResearchFact
                  icon={<Cpu className="h-3.5 w-3.5" />}
                  label="Tech profile"
                  value={p.research.techProfile}
                  sub={`${p.research.developerHeadcount} internal dev${p.research.developerHeadcount === 1 ? "" : "s"}`}
                />
              </div>
              <div className="mt-5">
                <div className="mb-2 text-[11px] uppercase tracking-wider text-white/40">
                  Workflow signals
                </div>
                <ul className="space-y-2">
                  {p.research.workflowSignals.map((s, i) => (
                    <li
                      key={i}
                      className="rounded-lg border border-white/[0.06] bg-white/[0.015] px-4 py-3"
                    >
                      <div className="mb-1 text-[11px] uppercase tracking-wider text-white/40">
                        {s.source}
                      </div>
                      <div className="flex gap-2 text-sm text-white/80">
                        <Quote className="h-3 w-3 shrink-0 text-white/30 mt-1" />
                        <span className="italic">{s.quote}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          <section id="pain" className="card px-6 py-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xs uppercase tracking-wider text-white/40">
                Pain mapping
              </h2>
              <span className="text-xs text-white/40">
                Fit score · <span className="text-emerald-300">{p.fitScore}</span>
              </span>
            </div>
            <ul className="space-y-4">
              {p.pains.map((pain, i) => (
                <li
                  key={i}
                  className="rounded-lg border border-white/[0.06] bg-white/[0.015] p-4"
                >
                  <div className="text-sm font-medium text-white">{pain.title}</div>
                  <div className="mt-1.5 text-xs text-white/50">
                    Pattern · <span className="text-white/70">{pain.pattern}</span>
                  </div>
                  <div className="mt-1 text-xs text-white/50">
                    Evidence · <span className="text-white/70">{pain.evidence}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {p.emailDraft.subject && (
            <section id="email" className="card overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
                <h2 className="text-xs uppercase tracking-wider text-white/40">
                  Email draft
                </h2>
                <button className="text-xs text-white/40 transition-colors hover:text-white">
                  Regenerate
                </button>
              </div>
              <div className="px-6 py-5">
                <div className="mb-4 flex gap-2 text-sm">
                  <span className="w-16 text-white/40">To</span>
                  <span className="text-white/80">{p.champion.email}</span>
                </div>
                <div className="mb-4 flex gap-2 text-sm">
                  <span className="w-16 text-white/40">Subject</span>
                  <span className="font-medium text-white">
                    {p.emailDraft.subject}
                  </span>
                </div>
                <div className="divider mb-4" />
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-white/80">
                  {p.emailDraft.body}
                </pre>
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <DemoControlPanel slug={p.slug} initialDemoUrl={p.demoUrl || null} />

          <section className="card px-6 py-5">
            <h2 className="mb-4 text-xs uppercase tracking-wider text-white/40">
              Timeline
            </h2>
            <ol className="relative space-y-4">
              {timeline.map((evt, i) => {
                const last = i === timeline.length - 1;
                return (
                  <li key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      {last ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                      ) : (
                        <Circle className="h-4 w-4 text-white/30" />
                      )}
                      {i < timeline.length - 1 && (
                        <div className="my-1 w-px flex-1 bg-white/[0.08]" />
                      )}
                    </div>
                    <div className="flex-1 pb-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-white/90">{evt.event}</span>
                        <span className="font-mono text-[11px] text-white/40">
                          {formatDate(evt.date)}
                        </span>
                      </div>
                      {evt.note && (
                        <div className="mt-0.5 text-xs text-white/50">{evt.note}</div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          <section className="card px-6 py-5">
            <h2 className="mb-4 text-xs uppercase tracking-wider text-white/40">
              Meta
            </h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-white/40">Added</div>
                <div className="text-white/80">{formatDate(p.addedAt)}</div>
              </div>
              <div>
                <div className="text-xs text-white/40">Slug</div>
                <div className="font-mono text-xs text-white/80">{p.slug}</div>
              </div>
              <div className="col-span-2">
                <div className="text-xs text-white/40">Template</div>
                <div className="inline-flex items-center gap-1.5 text-white/80">
                  <Building2 className="h-3.5 w-3.5 text-white/40" />
                  {p.template}{p.pack ? ` · ${p.pack}` : ""}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ProspectActions({
  stage,
  email,
  onTransition,
  pending,
}: {
  stage: Stage;
  email: string;
  onTransition: (next: Stage, eventLabel: string, note?: string) => void;
  pending: boolean;
}) {
  const primaryCls = cn(
    "inline-flex items-center gap-1.5 rounded-lg bg-emerald-400 px-4 py-2 text-sm font-medium text-emerald-950 transition-colors hover:bg-emerald-300",
    pending && "cursor-not-allowed opacity-60"
  );
  const secondaryCls = cn(
    "inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white/60 transition-colors hover:border-rose-300/30 hover:text-rose-200",
    pending && "cursor-not-allowed opacity-60"
  );
  const PendingIcon = () => (pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null);

  if (stage === "email_drafted") {
    return (
      <div className="flex items-center gap-2">
        <a
          href={`https://mail.google.com/mail/?view=cm&to=${email}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white/70 transition-colors hover:border-white/20 hover:text-white"
        >
          <Mail className="h-3.5 w-3.5" />
          Open in Gmail
        </a>
        <button
          onClick={() => onTransition("email_sent", "Email sent")}
          disabled={pending}
          className={primaryCls}
        >
          {pending ? <PendingIcon /> : <CheckCircle className="h-3.5 w-3.5" />}
          Mark as sent
        </button>
      </div>
    );
  }
  if (stage === "email_sent") {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => onTransition("closed_lost", "Closed lost", "No reply")}
          disabled={pending}
          className={secondaryCls}
        >
          <XCircle className="h-3.5 w-3.5" />
          Closed lost
        </button>
        <button
          onClick={() => onTransition("replied", "Replied")}
          disabled={pending}
          className={primaryCls}
        >
          {pending ? <PendingIcon /> : <MessageSquare className="h-3.5 w-3.5" />}
          Mark replied
        </button>
      </div>
    );
  }
  if (stage === "replied") {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => onTransition("closed_lost", "Closed lost", "Reply did not lead to meeting")}
          disabled={pending}
          className={secondaryCls}
        >
          <XCircle className="h-3.5 w-3.5" />
          Closed lost
        </button>
        <button
          onClick={() => onTransition("meeting_booked", "Meeting booked")}
          disabled={pending}
          className={primaryCls}
        >
          {pending ? <PendingIcon /> : <CalendarCheck className="h-3.5 w-3.5" />}
          Meeting booked
        </button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-white/40">
        {stage === "meeting_booked" ? "Won — handoff to Megha" : "Closed"}
      </span>
    </div>
  );
}

function StatusCard({
  stage,
  events,
}: {
  stage: Stage;
  events: TimelineEvent[];
}) {
  const meta = statusMeta(stage, events);
  return (
    <div className={cn("mt-6 flex items-center justify-between rounded-xl border px-5 py-4", meta.tone)}>
      <div className="flex items-center gap-3">
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg border", meta.iconTone)}>
          {meta.icon}
        </div>
        <div>
          <div className="text-sm font-medium text-white">{meta.title}</div>
          <div className="text-xs text-white/50">{meta.sub}</div>
        </div>
      </div>
      <div className="text-[11px] text-white/40">{meta.hint}</div>
    </div>
  );
}

function statusMeta(stage: Stage, events: TimelineEvent[]) {
  const find = (label: string) => [...events].reverse().find((e) => e.event === label);
  if (stage === "email_sent") {
    const sent = find("Email sent");
    return {
      tone: "border-amber-300/20 bg-amber-300/[0.04]",
      iconTone: "border-amber-300/30 bg-amber-300/10 text-amber-200",
      icon: <Clock className="h-4 w-4" />,
      title: "Awaiting reply",
      sub: sent ? `Sent ${formatRelative(sent.date)}` : "Sent",
      hint: "Watching your inbox manually · mark replied when they respond",
    };
  }
  if (stage === "replied") {
    const replied = find("Replied");
    return {
      tone: "border-emerald-300/30 bg-emerald-400/[0.06]",
      iconTone: "border-emerald-300/40 bg-emerald-300/15 text-emerald-200",
      icon: <MessageSquare className="h-4 w-4" />,
      title: "Reply received",
      sub: replied ? `Replied ${formatRelative(replied.date)}` : "Replied",
      hint: "Respond in Gmail · mark meeting booked when scheduled",
    };
  }
  if (stage === "meeting_booked") {
    const booked = find("Meeting booked");
    return {
      tone: "border-emerald-300/40 bg-emerald-400/[0.10]",
      iconTone: "border-emerald-300/50 bg-emerald-300/20 text-emerald-100",
      icon: <CalendarCheck className="h-4 w-4" />,
      title: "Meeting booked",
      sub: booked ? `Booked ${formatRelative(booked.date)}` : "Meeting booked",
      hint: "Pipeline value realized · close in CRM after the call",
    };
  }
  const closed = find("Closed lost");
  return {
    tone: "border-white/[0.06] bg-white/[0.02]",
    iconTone: "border-white/10 bg-white/[0.04] text-white/50",
    icon: <XCircle className="h-4 w-4" />,
    title: "Closed lost",
    sub: closed?.note ?? "No reply",
    hint: closed ? `Closed ${formatRelative(closed.date)}` : "",
  };
}

function ResearchFact({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.015] px-3 py-3">
      <div className="mb-1.5 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-white/40">
        {icon}
        {label}
      </div>
      <div className="text-sm text-white/85">{value}</div>
      {sub && <div className="mt-1 text-[11px] text-white/40">{sub}</div>}
    </div>
  );
}

