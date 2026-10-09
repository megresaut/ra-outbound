import { db, schema } from "@/db/client";
import { eq } from "drizzle-orm";
import type { Stage } from "@/lib/prospects";

// Pair each manual transition with the event-kind that gets written.
// Server-driven events from the orchestrator (researched, pain_mapped, ...)
// are appended directly by the orchestrator, not here.
const STAGE_TO_KIND: Record<Stage, string> = {
  researched: "researched",
  pain_mapped: "pain_mapped",
  demo_built: "demo_built",
  email_drafted: "email_drafted",
  email_sent: "email_sent",
  replied: "replied",
  meeting_booked: "meeting_booked",
  closed_lost: "closed_lost",
};

export function transitionStage(
  slug: string,
  newStage: Stage,
  note?: string
): { ok: true } | { ok: false; reason: string } {
  const ts = new Date().toISOString();

  return db.transaction((tx) => {
    const exists = tx
      .select({ slug: schema.prospects.slug })
      .from(schema.prospects)
      .where(eq(schema.prospects.slug, slug))
      .get();
    if (!exists) return { ok: false, reason: "prospect not found" };

    tx.insert(schema.events)
      .values({
        prospectSlug: slug,
        ts,
        kind: STAGE_TO_KIND[newStage],
        note: note ?? null,
      })
      .run();

    tx.update(schema.prospects)
      .set({ currentStage: newStage, lastTouch: ts })
      .where(eq(schema.prospects.slug, slug))
      .run();

    return { ok: true };
  });
}
