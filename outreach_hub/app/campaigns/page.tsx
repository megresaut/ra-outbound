import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Upload } from "lucide-react";
import { listCampaigns } from "@/lib/repositories/campaigns";
import { db, schema } from "@/db/client";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default function CampaignsIndex() {
  const campaigns = listCampaigns();

  const enriched = campaigns.map((c) => {
    const prospects = db
      .select()
      .from(schema.prospects)
      .where(eq(schema.prospects.campaignId, c.id))
      .all();
    const ready = prospects.filter((p) => p.pipelineStatus === "ready_to_send").length;
    const sent = prospects.filter((p) => p.pipelineStatus === "sent").length;
    const failed = prospects.filter((p) =>
      ["research_failed", "pain_failed", "demo_failed", "email_failed", "send_failed"].includes(
        p.pipelineStatus ?? "",
      ),
    ).length;
    return { ...c, prospects: prospects.length, ready, sent, failed };
  });

  return (
    <div className="mx-auto max-w-[1000px] px-8 py-10">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-xs text-white/40 transition-colors hover:text-white/70"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to hub
      </Link>

      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-display text-4xl font-light tracking-tight">Campaigns</h1>
          <p className="mt-2 text-sm text-white/50">
            CSV batches in the autonomous pipeline.
          </p>
        </div>
        <Link
          href="/campaigns/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-400 px-4 py-2 text-sm font-medium text-emerald-950 transition-colors hover:bg-emerald-300"
        >
          <Upload className="h-3.5 w-3.5" />
          Upload CSV
        </Link>
      </header>

      {enriched.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 p-12 text-center text-white/50">
          <Upload className="h-6 w-6 text-white/30" />
          <div className="text-sm">No campaigns yet — upload a CSV to start.</div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="grid grid-cols-[2fr_0.8fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-3 border-b border-white/[0.06] px-5 py-3 text-[11px] uppercase tracking-wider text-white/40">
            <div>Campaign</div>
            <div>Prospects</div>
            <div>Ready</div>
            <div>Sent</div>
            <div>Failed</div>
            <div className="text-right">Created</div>
          </div>
          {enriched.map((c) => (
            <Link
              key={c.id}
              href={`/campaigns/${c.id}`}
              className="group grid grid-cols-[2fr_0.8fr_0.8fr_0.8fr_0.8fr_0.8fr] items-center gap-3 border-b border-white/[0.04] px-5 py-4 transition-colors last:border-0 hover:bg-white/[0.02]"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 truncate text-sm font-medium text-white">
                  {c.name}
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-50" />
                </div>
                <div className="truncate text-xs text-white/40">{c.csvFilename ?? "—"}</div>
              </div>
              <div className="text-sm text-white/70 tabular">{c.prospects}</div>
              <div className="text-sm tabular">
                <span className={c.ready > 0 ? "text-emerald-300" : "text-white/40"}>
                  {c.ready}
                </span>
              </div>
              <div className="text-sm tabular text-white/70">{c.sent}</div>
              <div className="text-sm tabular">
                <span className={c.failed > 0 ? "text-red-300" : "text-white/40"}>{c.failed}</span>
              </div>
              <div className="text-right text-xs text-white/40">
                {c.createdAt.slice(0, 10)}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
