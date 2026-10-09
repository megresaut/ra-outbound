import { db, schema } from "@/db/client";
import { eq } from "drizzle-orm";
// research-deep + pain-mapping bypassed in this flow (Phase 2 restructure).
// Files are intentionally left in place; only the invocation is removed.
import { buildAndDeployDemo } from "./demo";
import { draftEmailForProspect } from "./email-draft";
import { listCampaignProspects, updatePipelineStatus } from "@/lib/repositories/campaigns";

const CONCURRENCY = 2;

// In-process guard so a re-entrant call doesn't double-run the same prospect.
const inFlight = new Set<string>();

type StepResult = { stage: string; ok: boolean; error?: string };

async function runOne(slug: string): Promise<StepResult[]> {
  if (inFlight.has(slug)) return [];
  inFlight.add(slug);
  const steps: StepResult[] = [];

  try {
    const prospect = db
      .select()
      .from(schema.prospects)
      .where(eq(schema.prospects.slug, slug))
      .get();
    if (!prospect) return [{ stage: "load", ok: false, error: "prospect not found" }];

    // ── Bypass: research + pain stages are skipped in the Phase 2 restructure.
    // research_pending / demo_failed / email_failed all advance straight to
    // demo build. The status strings "researching", "research_failed",
    // "pain_mapping", "pain_failed", "novel_pain_review", "low_fit_review",
    // and "deploying" are preserved verbatim in the UI (STATUS_LABEL,
    // ACTIVE_STATES, FAILED_STATES, REVIEW_STATES) so historical rows still
    // render correctly. This run path simply never writes those new statuses.
    const template = prospect.template as "property_management" | "service_dispatch";
    const pack = (prospect.pack as "hvac" | "plumbing" | "electrical" | null) ?? null;

    // ── Demo build (Phase 3 selects a fixed URL; no per-prospect deploy) ──
    updatePipelineStatus(slug, "demo_building");
    let demoUrl: string;
    try {
      demoUrl = await buildAndDeployDemo({
        slug,
        company: prospect.company,
        template,
        pack,
        website: prospect.website,
        location: prospect.location,
        employees: prospect.employees,
      });
      steps.push({ stage: "demo", ok: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      updatePipelineStatus(slug, "demo_failed", msg);
      steps.push({ stage: "demo", ok: false, error: msg });
      return steps;
    }

    // ── Email draft (Phase 2: drafts from prospect row + products.md) ──
    updatePipelineStatus(slug, "email_drafting");
    try {
      await draftEmailForProspect({
        slug,
        company: prospect.company,
        championName: prospect.championName,
        championTitle: prospect.championTitle,
        industry: prospect.industry,
        template,
        location: prospect.location,
        pack,
        demoUrl,
      });
      steps.push({ stage: "email", ok: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      updatePipelineStatus(slug, "email_failed", msg);
      steps.push({ stage: "email", ok: false, error: msg });
      return steps;
    }

    updatePipelineStatus(slug, "ready_to_send", null);
    return steps;
  } finally {
    inFlight.delete(slug);
  }
}

async function processBatch(slugs: string[]) {
  const queue = [...slugs];
  const workers: Promise<void>[] = [];
  for (let i = 0; i < Math.min(CONCURRENCY, queue.length); i++) {
    workers.push(
      (async function worker() {
        while (queue.length > 0) {
          const slug = queue.shift();
          if (!slug) return;
          try {
            await runOne(slug);
          } catch (e) {
            console.error(`[orchestrator] unhandled for ${slug}:`, e);
          }
        }
      })(),
    );
  }
  await Promise.all(workers);
}

export async function runPipelineForCampaign(campaignId: string): Promise<void> {
  const prospects = listCampaignProspects(campaignId);
  const todo = prospects
    .filter((p) =>
      [
        "research_pending",
        "research_failed",
        "pain_failed",
        "demo_failed",
        "email_failed",
      ].includes(p.pipelineStatus ?? ""),
    )
    .map((p) => p.slug);
  if (todo.length === 0) return;
  await processBatch(todo);
}

export async function retryProspect(slug: string): Promise<void> {
  // Reset to research_pending on retry regardless of where it failed. The
  // failed-state strings ("research_failed", "pain_failed", "demo_failed",
  // "email_failed") are preserved on the read side; in this flow most of
  // them only appear on historical rows.
  const p = db.select().from(schema.prospects).where(eq(schema.prospects.slug, slug)).get();
  if (!p) return;
  const status = p.pipelineStatus;
  if (
    status === "research_failed" ||
    status === "pain_failed" ||
    status === "demo_failed" ||
    status === "email_failed"
  ) {
    updatePipelineStatus(slug, "research_pending", null);
  } else {
    return;
  }
  await runOne(slug);
}
