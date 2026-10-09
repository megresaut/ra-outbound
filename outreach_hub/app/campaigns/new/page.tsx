"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Loader2, Upload, XCircle, AlertTriangle } from "lucide-react";

type IntakeError = { row: number; reason: string };
type IntakeResult = {
  campaignId: string;
  inserted: number;
  skipped: number;
  errors: IntakeError[];
};

export default function NewCampaignPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<IntakeResult | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) {
      setError("Pick a CSV file first.");
      return;
    }
    setSubmitting(true);
    setError(null);
    setResult(null);

    const fd = new FormData();
    fd.append("csv", file);
    if (name) fd.append("name", name);

    let res: Response;
    try {
      res = await fetch("/api/campaigns/intake", { method: "POST", body: fd });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
      setSubmitting(false);
      return;
    }

    const body = await res.json().catch(() => null);
    if (!res.ok) {
      setError(body?.error ?? `HTTP ${res.status}`);
      if (body?.details) setResult({ campaignId: "", inserted: 0, skipped: body.details.length, errors: body.details });
      setSubmitting(false);
      return;
    }

    const data = body as IntakeResult;
    setResult(data);
    setSubmitting(false);
    // Wait a beat so the user sees the summary, then jump to the campaign view.
    setTimeout(() => router.push(`/campaigns/${data.campaignId}`), 800);
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 text-xs text-white/40 transition-colors hover:text-white/70"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to hub
      </Link>

      <header className="mb-8">
        <h1 className="font-display text-4xl font-light tracking-tight">New campaign</h1>
        <p className="mt-2 text-sm text-white/50">
          Upload a CSV. We&apos;ll research each row, map pain, build a personalized demo,
          deploy it, and draft an email. You review the batch on one screen and send.
        </p>
      </header>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="card p-6 space-y-4">
          <label className="block space-y-1.5">
            <span className="text-xs text-white/50">Campaign name (optional)</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
              placeholder="May PM batch"
              className="h-9 w-full rounded-md border border-white/10 bg-white/[0.02] px-3 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none disabled:opacity-50"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs text-white/50">CSV file</span>
            <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-white/15 bg-white/[0.02] text-sm text-white/60 transition-colors hover:border-white/30 hover:text-white/80">
              <Upload className="h-4 w-4" />
              {file ? (
                <span className="font-medium text-white/90">{file.name}</span>
              ) : (
                <span>Click to upload CSV</span>
              )}
              <input
                type="file"
                accept=".csv,text/csv"
                disabled={submitting}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
            </label>
          </label>

          <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-3 text-xs text-white/50">
            <div className="mb-1 font-medium text-white/70">Expected columns</div>
            <code className="text-white/60">company, industry, contact name, contact email</code>
            <div className="mt-2 text-white/40">
              Industry can be free text — we map &quot;property management / HVAC / plumbing /
              electrical&quot;. Website &amp; location columns are optional; we derive them when
              missing.
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>{error}</div>
          </div>
        )}

        {result && result.errors.length > 0 && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
            <div className="mb-2 flex items-center gap-2 font-medium">
              <AlertTriangle className="h-4 w-4" />
              {result.inserted} accepted · {result.skipped} skipped
            </div>
            <ul className="ml-1 space-y-0.5 text-amber-200/80">
              {result.errors.slice(0, 10).map((er, i) => (
                <li key={i}>
                  row {er.row}: {er.reason}
                </li>
              ))}
              {result.errors.length > 10 && <li>… and {result.errors.length - 10} more</li>}
            </ul>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !file}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-5 py-2.5 text-sm font-medium text-emerald-950 transition-colors hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading…
            </>
          ) : (
            "Start campaign"
          )}
        </button>
      </form>
    </div>
  );
}
