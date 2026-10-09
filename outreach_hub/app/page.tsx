import Link from "next/link";
import { ArrowUpRight, Search, Sparkles } from "lucide-react";
import { Stage } from "@/lib/prospects";
import { listProspects } from "@/lib/repositories/prospects";
import { StagePill } from "@/components/StagePill";
import { HomeActions } from "@/components/HomeActions";
import { formatRelative } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function Home() {
  const sorted = listProspects(); // already ordered by lastTouch desc

  const statCount = (filter: (s: Stage) => boolean) =>
    sorted.filter((p) => filter(p.stage)).length;

  const STATS = [
    { label: "Prospects", value: sorted.length, hint: "all-time" },
    {
      label: "In review queue",
      value: statCount((s) => s === "email_drafted" || s === "demo_built"),
      hint: "awaiting send",
    },
    {
      label: "Sent",
      value: statCount((s) => s === "email_sent" || s === "replied" || s === "meeting_booked"),
      hint: "this period",
    },
    {
      label: "Replies",
      value: statCount((s) => s === "replied" || s === "meeting_booked"),
      hint: "engaged",
    },
    {
      label: "Meetings",
      value: statCount((s) => s === "meeting_booked"),
      hint: "booked",
    },
  ];

  return (
    <div className="mx-auto max-w-[1200px] px-8 py-10">
      {/* Header */}
      <header className="mb-12 flex items-end justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/40">
            <Sparkles className="h-3 w-3" />
            Reasonable Automations
          </div>
          <h1 className="font-display text-5xl font-light tracking-tight">
            Outreach hub
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/50">
            Every prospect we&apos;ve touched. Click any row to see the research, the
            pain mapping, the email draft, and the demo we built for them.
          </p>
        </div>
        <HomeActions />
      </header>

      {/* Stat row */}
      <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-5">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="card px-5 py-4"
          >
            <div className="text-xs uppercase tracking-wider text-white/40">
              {stat.label}
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-3xl tabular text-white">
                {stat.value}
              </span>
              <span className="text-[11px] text-white/30">{stat.hint}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.02] p-1">
          {["All", "Active", "In queue", "Sent", "Replied", "Closed"].map((label, i) => (
            <button
              key={label}
              className={
                i === 0
                  ? "rounded-md bg-white/[0.08] px-3 py-1.5 text-xs font-medium text-white"
                  : "rounded-md px-3 py-1.5 text-xs text-white/50 hover:text-white/80"
              }
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-sm text-white/40">
          <Search className="h-3.5 w-3.5" />
          <input
            placeholder="Search company, champion, location…"
            className="w-72 bg-transparent placeholder:text-white/30 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-[2.4fr_1fr_1.6fr_0.8fr_1.2fr_0.8fr] gap-4 border-b border-white/[0.06] px-6 py-3 text-[11px] uppercase tracking-wider text-white/40">
          <div>Company</div>
          <div>Industry</div>
          <div>Champion</div>
          <div>Fit</div>
          <div>Stage</div>
          <div className="text-right">Last touch</div>
        </div>

        {sorted.map((p) => (
          <Link
            href={`/prospects/${p.slug}`}
            key={p.slug}
            className="group grid grid-cols-[2.4fr_1fr_1.6fr_0.8fr_1.2fr_0.8fr] gap-4 border-b border-white/[0.04] px-6 py-4 transition-colors last:border-0 hover:bg-white/[0.02]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] font-display text-sm text-white/80">
                {p.company.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 truncate text-sm font-medium text-white">
                  {p.company}
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-50" />
                </div>
                <div className="truncate text-xs text-white/40">
                  {p.location} · {p.employees} employees
                </div>
              </div>
            </div>

            <div className="flex items-center text-sm text-white/60">
              {p.industry}
            </div>

            <div className="flex flex-col justify-center">
              <div className="truncate text-sm text-white/80">{p.champion.name}</div>
              <div className="truncate text-xs text-white/40">{p.champion.title}</div>
            </div>

            <div className="flex items-center">
              <FitDot score={p.fitScore} />
            </div>

            <div className="flex items-center">
              <StagePill stage={p.stage} />
            </div>

            <div className="flex items-center justify-end text-xs text-white/50">
              {formatRelative(p.lastTouch)}
            </div>
          </Link>
        ))}
      </div>

      <footer className="mt-10 flex items-center justify-between text-xs text-white/30">
        <div>Showing {sorted.length} prospects · cold outbound v0.1</div>
        <div className="font-mono">2026-05-03</div>
      </footer>
    </div>
  );
}

function FitDot({ score }: { score: number }) {
  const tone =
    score >= 90
      ? "text-emerald-300 border-emerald-300/30 bg-emerald-300/10"
      : score >= 80
      ? "text-emerald-200/90 border-emerald-200/20 bg-emerald-200/5"
      : score >= 70
      ? "text-amber-200/90 border-amber-200/20 bg-amber-200/5"
      : "text-white/50 border-white/10 bg-white/[0.03]";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium tabular ${tone}`}
    >
      {score}
    </span>
  );
}
