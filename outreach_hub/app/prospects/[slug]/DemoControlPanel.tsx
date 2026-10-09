"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Loader2,
  Play,
  Rocket,
  Save,
  Square,
  XCircle,
  Pencil,
} from "lucide-react";

type DemoConfig = {
  company: { name: string; logo: string | null; primaryColor: string; location: string };
  details: {
    painNarrative?: string;
    howItWorks?: string[];
    [k: string]: unknown;
  };
  [k: string]: unknown;
};

type PreviewState = {
  status: "stopped" | "starting" | "ready" | "error";
  port?: number;
  url?: string;
  errorMessage?: string;
};

export function DemoControlPanel({
  slug,
  initialDemoUrl,
}: {
  slug: string;
  initialDemoUrl: string | null;
}) {
  const [demoUrl, setDemoUrl] = useState<string | null>(initialDemoUrl);
  const [preview, setPreview] = useState<PreviewState>({ status: "stopped" });
  const [previewBusy, setPreviewBusy] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deployBusy, setDeployBusy] = useState(false);
  const [deployLog, setDeployLog] = useState<string[]>([]);
  const [deployError, setDeployError] = useState<string | null>(null);

  // Probe preview state on mount in case the dev server is already running
  // from an earlier visit.
  useEffect(() => {
    fetch(`/api/demo/${slug}/preview`)
      .then((r) => r.json())
      .then(setPreview)
      .catch(() => {});
  }, [slug]);

  async function startPreview() {
    setPreviewBusy(true);
    setPreview({ status: "starting" });
    try {
      const res = await fetch(`/api/demo/${slug}/preview`, { method: "POST" });
      const data: PreviewState = await res.json();
      setPreview(data);
    } catch (e) {
      setPreview({
        status: "error",
        errorMessage: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setPreviewBusy(false);
    }
  }

  async function stopPreview() {
    setPreviewBusy(true);
    try {
      await fetch(`/api/demo/${slug}/preview`, { method: "DELETE" });
      setPreview({ status: "stopped" });
    } finally {
      setPreviewBusy(false);
    }
  }

  async function deploy() {
    setDeployBusy(true);
    setDeployLog([]);
    setDeployError(null);
    try {
      const res = await fetch(`/api/demo/${slug}/deploy`, { method: "POST" });
      if (!res.body) throw new Error("No deploy stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const chunks = buf.split("\n\n");
        buf = chunks.pop() ?? "";
        for (const c of chunks) {
          if (!c.startsWith("data: ")) continue;
          const msg = JSON.parse(c.slice(6));
          if (msg.type === "step") {
            setDeployLog((l) => [...l, msg.data.label]);
          } else if (msg.type === "done") {
            setDemoUrl(msg.data.url);
          } else if (msg.type === "error") {
            setDeployError(msg.data.message);
          }
        }
      }
    } catch (e) {
      setDeployError(e instanceof Error ? e.message : String(e));
    } finally {
      setDeployBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <PreviewPanel
        slug={slug}
        preview={preview}
        busy={previewBusy}
        onStart={startPreview}
        onStop={stopPreview}
      />

      <EditPanel slug={slug} open={editOpen} onToggle={() => setEditOpen((v) => !v)} />

      <DeployPanel
        deployed={!!demoUrl}
        url={demoUrl}
        busy={deployBusy}
        log={deployLog}
        error={deployError}
        onDeploy={deploy}
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Preview panel
// ──────────────────────────────────────────────────────────────────

function PreviewPanel({
  slug: _slug,
  preview,
  busy,
  onStart,
  onStop,
}: {
  slug: string;
  preview: PreviewState;
  busy: boolean;
  onStart: () => void;
  onStop: () => void;
}) {
  const running = preview.status === "ready";
  const starting = preview.status === "starting";

  return (
    <section className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-white/40">Local preview</div>
          <div className="mt-0.5 text-sm text-white/80">
            {running ? `Running on port ${preview.port}` : "Spawns a dev server for this demo"}
          </div>
        </div>
        <StatusPill status={preview.status} />
      </div>

      {running ? (
        <div className="aspect-[16/10] overflow-hidden bg-[#0a0a0b]">
          <iframe
            src={preview.url}
            title="Demo preview"
            className="h-full w-full border-0"
          />
        </div>
      ) : (
        <div className="grid place-items-center bg-black/40 px-5 py-12 text-center">
          <div className="max-w-xs space-y-2">
            <div className="text-sm text-white/70">
              {starting
                ? "Starting Next.js dev server… first launch installs deps (~30s)."
                : preview.status === "error"
                ? "Preview failed to start"
                : "No preview running yet."}
            </div>
            {preview.status === "error" && (
              <div className="text-xs text-rose-300">{preview.errorMessage}</div>
            )}
            <div className="text-xs text-white/40">
              Edits to the config below hot-reload here.
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 border-t border-white/[0.06] px-5 py-3">
        {running ? (
          <>
            <a
              href={preview.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-emerald-300/30 bg-emerald-300/10 px-3 py-1.5 text-xs font-medium text-emerald-200 transition-colors hover:border-emerald-300/50"
            >
              Open in new tab <ExternalLink className="h-3 w-3" />
            </a>
            <button
              onClick={onStop}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-white/60 transition-colors hover:border-rose-300/30 hover:text-rose-200 disabled:opacity-50"
            >
              <Square className="h-3 w-3" />
              Stop
            </button>
          </>
        ) : (
          <button
            onClick={onStart}
            disabled={busy || starting}
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-400 px-3 py-1.5 text-xs font-medium text-emerald-950 transition-colors hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy || starting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Play className="h-3 w-3" />
            )}
            {starting ? "Starting…" : "Start preview"}
          </button>
        )}
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────
// Edit panel
// ──────────────────────────────────────────────────────────────────

function EditPanel({
  slug,
  open,
  onToggle,
}: {
  slug: string;
  open: boolean;
  onToggle: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<DemoConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || loaded || loading) return;
    setLoading(true);
    fetch(`/api/demo/${slug}/config`)
      .then((r) => r.json())
      .then((c: DemoConfig) => {
        setConfig(c);
        setLoaded(true);
        setError(null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [open, loaded, loading, slug]);

  function updateCompany<K extends keyof DemoConfig["company"]>(
    key: K,
    value: DemoConfig["company"][K],
  ) {
    setConfig((c) => (c ? { ...c, company: { ...c.company, [key]: value } } : c));
  }
  function updateDetails<K extends keyof DemoConfig["details"]>(
    key: K,
    value: DemoConfig["details"][K],
  ) {
    setConfig((c) => (c ? { ...c, details: { ...c.details, [key]: value } } : c));
  }

  async function save() {
    if (!config) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/demo/${slug}/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: {
            name: config.company.name,
            primaryColor: config.company.primaryColor,
            location: config.company.location,
          },
          details: {
            painNarrative: config.details.painNarrative ?? "",
            howItWorks: config.details.howItWorks ?? [],
          },
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      setSavedAt(Date.now());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-5 py-3 text-left transition-colors hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-2">
          <Pencil className="h-3.5 w-3.5 text-white/40" />
          <div>
            <div className="text-xs uppercase tracking-wider text-white/40">Edit content</div>
            <div className="mt-0.5 text-sm text-white/80">
              Hero paragraph · how-it-works · basics
            </div>
          </div>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-white/40 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="border-t border-white/[0.06] px-5 py-5">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-white/50">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Loading config…
            </div>
          )}
          {error && !loading && (
            <div className="rounded-md border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-xs text-rose-200">
              {error}
            </div>
          )}
          {config && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <EditField label="Company name">
                  <input
                    value={config.company.name}
                    onChange={(e) => updateCompany("name", e.target.value)}
                    className={inputCls}
                  />
                </EditField>
                <EditField label="Brand color">
                  <input
                    value={config.company.primaryColor}
                    onChange={(e) => updateCompany("primaryColor", e.target.value)}
                    className={inputCls}
                  />
                </EditField>
              </div>
              <EditField label="Location">
                <input
                  value={config.company.location}
                  onChange={(e) => updateCompany("location", e.target.value)}
                  className={inputCls}
                />
              </EditField>

              <EditField label="Hero paragraph (painNarrative)">
                <textarea
                  rows={4}
                  value={config.details.painNarrative ?? ""}
                  onChange={(e) => updateDetails("painNarrative", e.target.value)}
                  className={textareaCls}
                />
              </EditField>

              <HowItWorksEditor
                paragraphs={config.details.howItWorks ?? ["", "", ""]}
                onChange={(v) => updateDetails("howItWorks", v)}
              />

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={save}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-md bg-emerald-400 px-3 py-1.5 text-xs font-medium text-emerald-950 transition-colors hover:bg-emerald-300 disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Save className="h-3 w-3" />
                  )}
                  {saving ? "Saving…" : "Save"}
                </button>
                {savedAt && (
                  <span className="text-xs text-emerald-300">
                    Saved · preview will hot-reload
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function HowItWorksEditor({
  paragraphs,
  onChange,
}: {
  paragraphs: string[];
  onChange: (v: string[]) => void;
}) {
  const padded = paragraphs.length < 3 ? [...paragraphs, ...Array(3 - paragraphs.length).fill("")] : paragraphs;
  return (
    <EditField label="How it works (3 paragraphs)">
      <div className="space-y-2">
        {padded.slice(0, 3).map((p, i) => (
          <textarea
            key={i}
            rows={3}
            value={p}
            onChange={(e) => {
              const next = [...padded];
              next[i] = e.target.value;
              onChange(next.slice(0, 3));
            }}
            placeholder={
              i === 0
                ? "Happy-path flow"
                : i === 1
                ? "Edge cases (flagged statements, layout changes)"
                : "Visibility and rollback"
            }
            className={textareaCls}
          />
        ))}
      </div>
    </EditField>
  );
}

function EditField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs text-white/50">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "h-9 w-full rounded-md border border-white/10 bg-white/[0.02] px-3 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none";
const textareaCls =
  "w-full rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 text-sm leading-relaxed text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none";

// ──────────────────────────────────────────────────────────────────
// Deploy panel
// ──────────────────────────────────────────────────────────────────

function DeployPanel({
  deployed,
  url,
  busy,
  log,
  error,
  onDeploy,
}: {
  deployed: boolean;
  url: string | null;
  busy: boolean;
  log: string[];
  error: string | null;
  onDeploy: () => void;
}) {
  const logEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log]);

  return (
    <section className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-white/40">
            Deploy to Vercel
          </div>
          <div className="mt-0.5 text-sm text-white/80">
            {deployed ? "Live — push edits any time" : "Not deployed yet"}
          </div>
        </div>
        {deployed ? (
          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-300/30 bg-emerald-300/10 px-2 py-0.5 text-2xs text-emerald-200">
            <CheckCircle2 className="h-3 w-3" />
            Live
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.02] px-2 py-0.5 text-2xs text-white/50">
            Local only
          </span>
        )}
      </div>

      {url && (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="block border-b border-white/[0.06] px-5 py-3 font-mono text-xs text-emerald-300 transition-colors hover:text-emerald-200"
        >
          {url}
          <ExternalLink className="ml-1 inline h-3 w-3" />
        </a>
      )}

      <div className="px-5 py-4">
        <button
          onClick={onDeploy}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-md bg-emerald-400 px-3 py-1.5 text-xs font-medium text-emerald-950 transition-colors hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Rocket className="h-3 w-3" />}
          {busy ? "Deploying…" : deployed ? "Re-deploy" : "Deploy to Vercel"}
        </button>

        {(log.length > 0 || error) && (
          <div className="mt-3 max-h-32 space-y-1 overflow-y-auto rounded-md border border-white/[0.06] bg-black/40 p-3 text-xs">
            {log.map((line, i) => (
              <div key={i} className="flex items-start gap-2 text-white/70">
                <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400/80" />
                {line}
              </div>
            ))}
            {error && (
              <div className="flex items-start gap-2 text-rose-300">
                <XCircle className="mt-0.5 h-3 w-3 shrink-0" />
                {error}
              </div>
            )}
            <div ref={logEndRef} />
          </div>
        )}
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: PreviewState["status"] }) {
  const map = {
    stopped: { tone: "border-white/10 bg-white/[0.02] text-white/50", label: "Stopped" },
    starting: {
      tone: "border-amber-300/30 bg-amber-300/10 text-amber-200",
      label: "Starting…",
    },
    ready: {
      tone: "border-emerald-300/30 bg-emerald-300/10 text-emerald-200",
      label: "Running",
    },
    error: { tone: "border-rose-400/30 bg-rose-400/10 text-rose-200", label: "Error" },
  } as const;
  const m = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-2xs ${m.tone}`}
    >
      {m.label}
    </span>
  );
}
