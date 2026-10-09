"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, Loader2, Upload, XCircle } from "lucide-react";

type Step = { label: string; stage: string; url?: string; details?: unknown };

export default function NewDemoPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function onLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setLogoPreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setSteps([]);
    setError(null);

    const formData = new FormData(e.currentTarget);

    let res: Response;
    try {
      res = await fetch("/api/demo/build", { method: "POST", body: formData });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
      setSubmitting(false);
      return;
    }

    if (!res.ok && res.headers.get("content-type")?.includes("application/json")) {
      const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      setError(body.error ?? `HTTP ${res.status}`);
      setSubmitting(false);
      return;
    }

    if (!res.body) {
      setError("No response stream");
      setSubmitting(false);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const chunks = buffer.split("\n\n");
      buffer = chunks.pop() ?? "";
      for (const chunk of chunks) {
        if (!chunk.startsWith("data: ")) continue;
        let msg: { type: string; data: Record<string, unknown> };
        try {
          msg = JSON.parse(chunk.slice(6));
        } catch {
          continue;
        }
        if (msg.type === "step") {
          setSteps((prev) => [...prev, msg.data as unknown as Step]);
        } else if (msg.type === "done") {
          router.push(`/prospects/${msg.data.slug as string}`);
          return;
        } else if (msg.type === "error") {
          setError(msg.data.message as string);
        }
      }
    }

    setSubmitting(false);
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

      <header className="mb-10">
        <h1 className="font-display text-4xl font-light tracking-tight">New demo</h1>
        <p className="mt-2 text-sm text-white/50">
          Drop in what you know about the firm and your notes on their pain. We extract the demo
          config with an LLM call and build it locally — you preview, edit, and deploy from the
          prospect page when it&apos;s ready.
        </p>
      </header>

      <form ref={formRef} onSubmit={onSubmit} className="space-y-6">
          <div className="card p-6 space-y-4">
            <Field label="Company name" required>
              <input
                name="companyName"
                required
                disabled={submitting}
                className={inputClass}
                placeholder="Sunrise Property Management"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Website">
                <input
                  name="website"
                  disabled={submitting}
                  className={inputClass}
                  placeholder="sunrisepm.com"
                />
              </Field>
              <Field label="Location">
                <input
                  name="location"
                  disabled={submitting}
                  className={inputClass}
                  placeholder="Portland, OR"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Brand color (optional — LLM picks one if blank)">
                <input
                  name="primaryColor"
                  type="text"
                  disabled={submitting}
                  className={inputClass}
                  placeholder="#2563eb"
                  pattern="^#[0-9a-fA-F]{6}$"
                />
              </Field>
              <Field label="Logo (optional)">
                <label className="flex h-9 cursor-pointer items-center gap-2 rounded-md border border-white/10 bg-white/[0.02] px-3 text-sm text-white/60 transition-colors hover:border-white/20 hover:text-white/80">
                  <Upload className="h-3.5 w-3.5" />
                  <span className="truncate">
                    {logoPreview ? "Replace logo" : "Upload PNG/SVG"}
                  </span>
                  <input
                    name="logo"
                    type="file"
                    accept="image/*"
                    disabled={submitting}
                    onChange={onLogoChange}
                    className="hidden"
                  />
                  {logoPreview && (
                    <img
                      src={logoPreview}
                      alt=""
                      className="ml-auto h-6 w-6 rounded object-contain"
                    />
                  )}
                </label>
              </Field>
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <div className="text-xs uppercase tracking-wider text-white/40">Champion (optional)</div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Name">
                <input
                  name="championName"
                  disabled={submitting}
                  className={inputClass}
                  placeholder="Jamie Reyes"
                />
              </Field>
              <Field label="Title">
                <input
                  name="championTitle"
                  disabled={submitting}
                  className={inputClass}
                  placeholder="Director of Operations"
                />
              </Field>
            </div>
            <Field label="Email">
              <input
                name="championEmail"
                type="email"
                disabled={submitting}
                className={inputClass}
                placeholder="jamie@sunrisepm.com"
              />
            </Field>
          </div>

          <div className="card p-6 space-y-3">
            <Field label="Your research & pain-point notes">
              <textarea
                name="notes"
                rows={10}
                disabled={submitting}
                className={`${inputClass} h-auto py-3 leading-relaxed`}
                placeholder={`Anything you've learned. Examples:\n\n- Manages ~800 units across 47 properties in Portland metro\n- Uses Buildium. Office manager spends 2-3 days/month on utility billbacks\n- Job posting names PGE + NW Natural as the painful portals\n- Founder mentioned wanting to handle 30% more units without hiring`}
              />
            </Field>
            <p className="text-xs text-white/40">
              The LLM extracts: unit count, properties, monthly hours, real utility providers for
              the location, PMS, and a quoted pain phrase. If you leave it blank, defaults are used.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <div className="font-medium">Build failed</div>
                <div className="mt-1 text-red-200/80">{error}</div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-5 py-2.5 text-sm font-medium text-emerald-950 transition-colors hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Building…
              </>
            ) : (
              "Build locally"
            )}
          </button>
      </form>

      {(submitting || steps.length > 0) && (
        <div className="card mt-6 p-6">
          <div className="mb-3 text-xs uppercase tracking-wider text-white/40">Progress</div>
          <ol className="space-y-2 text-sm">
            {steps.map((step, i) => {
              const isLast = i === steps.length - 1;
              const showSpinner = submitting && isLast && !error;
              return (
                <li key={i} className="flex items-start gap-3">
                  {showSpinner ? (
                    <Loader2 className="mt-0.5 h-3.5 w-3.5 shrink-0 animate-spin text-white/40" />
                  ) : (
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400/80" />
                  )}
                  <div>
                    <div className="text-white/80">{step.label}</div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}

const inputClass =
  "h-9 w-full rounded-md border border-white/10 bg-white/[0.02] px-3 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none disabled:opacity-50";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs text-white/50">
        {label}
        {required && <span className="ml-1 text-emerald-300/70">*</span>}
      </span>
      {children}
    </label>
  );
}
