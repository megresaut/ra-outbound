"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Send,
  RefreshCw,
  Edit3,
  XCircle,
} from "lucide-react";

type Pain = {
  title: string;
  pattern: string;
  evidence: string;
  libraryPatternId: string | null;
};

type ProspectRow = {
  slug: string;
  company: string;
  industry: string;
  championName: string;
  championEmail: string;
  pipelineStatus: string | null;
  pipelineError: string | null;
  sentAt: string | null;
  demoUrl: string | null;
  fitScore: number;
  painCount: number;
  topPain: string | null;
  pains: Pain[];
  email: { id: number; subject: string; body: string; version: number } | null;
};

type Status = {
  campaign: {
    id: string;
    name: string;
    csvFilename: string | null;
    rowCount: number;
    createdAt: string;
  };
  counts: Record<string, number>;
  prospects: ProspectRow[];
};

const ACTIVE_STATES = new Set([
  "research_pending",
  "researching",
  "pain_mapping",
  "demo_building",
  "deploying",
  "email_drafting",
  "sending",
]);

const FAILED_STATES = new Set([
  "research_failed",
  "pain_failed",
  "demo_failed",
  "email_failed",
  "send_failed",
]);

const REVIEW_STATES = new Set(["novel_pain_review", "low_fit_review"]);

const STATUS_LABEL: Record<string, string> = {
  research_pending: "Queued",
  researching: "Researching",
  research_failed: "Research failed",
  pain_mapping: "Mapping pain",
  pain_failed: "Pain failed",
  demo_building: "Building demo",
  demo_failed: "Demo failed",
  deploying: "Deploying",
  email_drafting: "Drafting email",
  email_failed: "Draft failed",
  ready_to_send: "Ready",
  sending: "Sending",
  send_failed: "Send failed",
  sent: "Sent",
  novel_pain_review: "No demo for this pain",
  low_fit_review: "Off-ICP (low fit)",
};

export function CampaignView({ campaignId, initialName }: { campaignId: string; initialName: string }) {
  const [data, setData] = useState<Status | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSummary, setSendSummary] = useState<{ sent: number; failed: number } | null>(null);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function refresh() {
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/status`);
      if (!res.ok) return;
      const json = (await res.json()) as Status;
      setData(json);
    } catch {
      // ignore — next poll will retry
    }
  }

  useEffect(() => {
    refresh();
    function schedule() {
      pollRef.current = setTimeout(async () => {
        await refresh();
        schedule();
      }, 3000);
    }
    schedule();
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);

  const readyProspects = useMemo(
    () => (data?.prospects ?? []).filter((p) => p.pipelineStatus === "ready_to_send"),
    [data],
  );

  function toggle(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function toggleAllReady() {
    if (selected.size === readyProspects.length && readyProspects.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(readyProspects.map((p) => p.slug)));
    }
  }

  async function sendSelected() {
    if (selected.size === 0) return;
    setSending(true);
    setSendError(null);
    setSendSummary(null);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs: Array.from(selected) }),
      });
      const body = await res.json();
      if (!res.ok) {
        setSendError(body.error ?? `HTTP ${res.status}`);
      } else {
        setSendSummary({ sent: body.sent, failed: body.failed });
        setSelected(new Set());
        refresh();
      }
    } catch (e) {
      setSendError(e instanceof Error ? e.message : String(e));
    } finally {
      setSending(false);
    }
  }

  async function retry(slug: string) {
    await fetch(`/api/campaigns/${campaignId}/retry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    refresh();
  }

  const counts = data?.counts ?? {};
  const total = data?.prospects.length ?? 0;
  const ready = counts.ready_to_send ?? 0;
  const sent = counts.sent ?? 0;
  const failed = Object.entries(counts)
    .filter(([k]) => FAILED_STATES.has(k))
    .reduce((s, [, v]) => s + v, 0);
  const inFlight = Object.entries(counts)
    .filter(([k]) => ACTIVE_STATES.has(k))
    .reduce((s, [, v]) => s + v, 0);
  const novel = Object.entries(counts)
    .filter(([k]) => REVIEW_STATES.has(k))
    .reduce((s, [, v]) => s + v, 0);

  return (
    <div className="mx-auto max-w-[1200px] px-8 py-10">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-xs text-white/40 transition-colors hover:text-white/70"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to hub
      </Link>

      <header className="mb-8 flex items-end justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-white/40">Campaign</div>
          <h1 className="mt-1 font-display text-4xl font-light tracking-tight">
            {data?.campaign.name ?? initialName}
          </h1>
          <div className="mt-1 text-xs text-white/40">
            {data?.campaign.csvFilename ?? "—"} · {total} prospects
          </div>
        </div>

        <button
          onClick={sendSelected}
          disabled={sending || selected.size === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-5 py-2.5 text-sm font-medium text-emerald-950 transition-colors hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Send {selected.size > 0 ? `${selected.size} selected` : "selected"}
        </button>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-6">
        <Stat label="Total" value={total} hint="in batch" />
        <Stat label="Ready" value={ready} hint="to send" tone="emerald" />
        <Stat label="Working" value={inFlight} hint="pipeline" />
        <Stat label="Novel" value={novel} hint="no demo" tone={novel > 0 ? "amber" : "neutral"} />
        <Stat label="Failed" value={failed} hint="needs retry" tone={failed > 0 ? "amber" : "neutral"} />
        <Stat label="Sent" value={sent} hint="this batch" />
      </div>

      {sendSummary && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
          <CheckCircle2 className="h-4 w-4" />
          Sent {sendSummary.sent} email{sendSummary.sent === 1 ? "" : "s"}.
          {sendSummary.failed > 0 && ` ${sendSummary.failed} failed — check the table.`}
        </div>
      )}
      {sendError && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>{sendError}</div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="grid grid-cols-[28px_2.2fr_1.2fr_1fr_1.6fr_0.8fr] gap-3 border-b border-white/[0.06] px-4 py-3 text-[11px] uppercase tracking-wider text-white/40">
          <div>
            <input
              type="checkbox"
              checked={selected.size === readyProspects.length && readyProspects.length > 0}
              onChange={toggleAllReady}
              disabled={readyProspects.length === 0}
              className="h-3.5 w-3.5 rounded border-white/20 bg-white/5"
            />
          </div>
          <div>Company</div>
          <div>Status</div>
          <div>Demo</div>
          <div>Email subject</div>
          <div className="text-right">Actions</div>
        </div>

        {(data?.prospects ?? []).map((p) => {
          const isReady = p.pipelineStatus === "ready_to_send";
          const isFailed = FAILED_STATES.has(p.pipelineStatus ?? "");
          const isExpanded = expandedSlug === p.slug;
          return (
            <div key={p.slug} className="border-b border-white/[0.04] last:border-0">
              <div className="grid grid-cols-[28px_2.2fr_1.2fr_1fr_1.6fr_0.8fr] items-center gap-3 px-4 py-3 text-sm">
                <div>
                  <input
                    type="checkbox"
                    disabled={!isReady}
                    checked={selected.has(p.slug)}
                    onChange={() => toggle(p.slug)}
                    className="h-3.5 w-3.5 rounded border-white/20 bg-white/5"
                  />
                </div>
                <div className="min-w-0">
                  <div className="truncate font-medium text-white">{p.company}</div>
                  <div className="truncate text-xs text-white/40">
                    {p.championName} · {p.championEmail}
                  </div>
                </div>
                <div>
                  <StatusPill status={p.pipelineStatus} error={p.pipelineError} />
                </div>
                <div>
                  {p.demoUrl ? (
                    <a
                      href={p.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-white/70 hover:text-white"
                    >
                      Open
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-white/30">—</span>
                  )}
                </div>
                <div className="min-w-0">
                  {p.email ? (
                    <div className="truncate text-xs text-white/70">{p.email.subject}</div>
                  ) : p.topPain ? (
                    <div className="truncate text-xs text-amber-200/80">{p.topPain}</div>
                  ) : (
                    <span className="text-xs text-white/30">—</span>
                  )}
                </div>
                <div className="flex items-center justify-end gap-2">
                  {(p.email || REVIEW_STATES.has(p.pipelineStatus ?? "")) && (
                    <button
                      onClick={() => setExpandedSlug(isExpanded ? null : p.slug)}
                      className="rounded-md border border-white/10 bg-white/[0.03] p-1.5 text-white/60 hover:bg-white/[0.08] hover:text-white"
                      title={p.email ? "Edit email" : "View pains"}
                    >
                      <Edit3 className="h-3 w-3" />
                    </button>
                  )}
                  {isFailed && (
                    <button
                      onClick={() => retry(p.slug)}
                      className="rounded-md border border-amber-400/30 bg-amber-400/10 p-1.5 text-amber-200 hover:bg-amber-400/20"
                      title="Retry pipeline"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              {isExpanded && p.email && (
                <EmailEditor
                  slug={p.slug}
                  initialSubject={p.email.subject}
                  initialBody={p.email.body}
                  demoUrl={p.demoUrl ?? ""}
                  onSaved={() => {
                    setExpandedSlug(null);
                    refresh();
                  }}
                />
              )}

              {isExpanded && !p.email && p.pains.length > 0 && (
                <NovelPainsView pains={p.pains} error={p.pipelineError} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: number;
  hint: string;
  tone?: "neutral" | "emerald" | "amber";
}) {
  const cls =
    tone === "emerald"
      ? "text-emerald-300"
      : tone === "amber"
      ? "text-amber-300"
      : "text-white";
  return (
    <div className="card px-4 py-3">
      <div className="text-xs uppercase tracking-wider text-white/40">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className={`font-display text-2xl tabular ${cls}`}>{value}</span>
        <span className="text-[11px] text-white/30">{hint}</span>
      </div>
    </div>
  );
}

function StatusPill({ status, error }: { status: string | null; error: string | null }) {
  if (!status) return <span className="text-xs text-white/30">—</span>;
  const label = STATUS_LABEL[status] ?? status;
  const isActive = ACTIVE_STATES.has(status);
  const isFailed = FAILED_STATES.has(status);
  const isReview = REVIEW_STATES.has(status);
  const isReady = status === "ready_to_send";
  const isSent = status === "sent";

  const cls = isSent
    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
    : isReady
    ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-200"
    : isFailed
    ? "border-red-400/30 bg-red-400/10 text-red-200"
    : isReview
    ? "border-amber-400/30 bg-amber-400/10 text-amber-200"
    : isActive
    ? "border-blue-400/30 bg-blue-400/10 text-blue-200"
    : "border-white/10 bg-white/[0.03] text-white/60";

  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs ${cls}`}>
        {isActive && <Loader2 className="h-3 w-3 animate-spin" />}
        {isFailed && <AlertCircle className="h-3 w-3" />}
        {isReview && <AlertCircle className="h-3 w-3" />}
        {label}
      </span>
      {error && (
        <span className="truncate text-[10px] text-red-300/60" title={error}>
          {error.slice(0, 40)}
        </span>
      )}
    </div>
  );
}

function NovelPainsView({ pains, error }: { pains: Pain[]; error: string | null }) {
  return (
    <div className="space-y-3 border-t border-white/[0.04] bg-white/[0.01] p-4">
      <div className="text-xs text-amber-200/80">
        No buildable demo for these pains. Add a matching pattern to the library +
        template to handle this prospect, or skip them.
      </div>
      {error && (
        <div className="rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-[11px] text-amber-200/70">
          {error}
        </div>
      )}
      <div className="space-y-2">
        {pains.map((p, i) => (
          <div
            key={i}
            className="rounded-md border border-white/[0.06] bg-white/[0.02] p-3 text-sm"
          >
            <div className="mb-1 flex items-center gap-2">
              <span className="font-medium text-white">{p.title}</span>
              <span
                className={`rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${
                  p.libraryPatternId === "novel" || !p.libraryPatternId
                    ? "border-amber-400/30 bg-amber-400/10 text-amber-200"
                    : "border-white/10 bg-white/[0.03] text-white/50"
                }`}
              >
                {p.libraryPatternId ?? "untagged"}
              </span>
            </div>
            <div className="text-xs text-white/60">{p.pattern}</div>
            <div className="mt-1 text-[11px] italic text-white/40">{p.evidence}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmailEditor({
  slug,
  initialSubject,
  initialBody,
  demoUrl,
  onSaved,
}: {
  slug: string;
  initialSubject: string;
  initialBody: string;
  demoUrl: string;
  onSaved: () => void;
}) {
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [saving, setSaving] = useState(false);

  const preview = body.replace(/\{\{demo_url\}\}/g, demoUrl);

  async function save() {
    setSaving(true);
    await fetch(`/api/email-drafts/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body }),
    });
    setSaving(false);
    onSaved();
  }

  return (
    <div className="space-y-3 border-t border-white/[0.04] bg-white/[0.01] p-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="mb-1.5 text-xs uppercase tracking-wider text-white/40">Subject</div>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="h-9 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 text-sm text-white focus:border-white/30 focus:outline-none"
          />
          <div className="mt-3 mb-1.5 text-xs uppercase tracking-wider text-white/40">Body</div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={12}
            className="w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm leading-relaxed text-white focus:border-white/30 focus:outline-none"
          />
          <div className="mt-1 text-[11px] text-white/30">
            <code className="text-white/40">{"{{demo_url}}"}</code> is replaced at send time.
          </div>
        </div>
        <div>
          <div className="mb-1.5 text-xs uppercase tracking-wider text-white/40">Preview</div>
          <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-3 text-sm">
            <div className="mb-2 font-medium text-white/90">{subject}</div>
            <pre className="whitespace-pre-wrap break-words font-sans text-white/70">{preview}</pre>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.08] px-3 py-1.5 text-xs text-white hover:bg-white/[0.12] disabled:opacity-50"
        >
          {saving && <Loader2 className="h-3 w-3 animate-spin" />}
          Save
        </button>
      </div>
    </div>
  );
}
