import { db, schema } from "@/db/client";
import { and, desc, eq } from "drizzle-orm";

export type CampaignRow = typeof schema.campaigns.$inferSelect;
export type CampaignProspect = typeof schema.prospects.$inferSelect;

export function createCampaign(input: {
  id: string;
  name: string;
  csvFilename: string | null;
  rowCount: number;
}): CampaignRow {
  const now = new Date().toISOString();
  db.insert(schema.campaigns)
    .values({
      id: input.id,
      name: input.name,
      csvFilename: input.csvFilename,
      rowCount: input.rowCount,
      createdAt: now,
    })
    .run();
  return getCampaign(input.id)!;
}

export function getCampaign(id: string): CampaignRow | undefined {
  return db
    .select()
    .from(schema.campaigns)
    .where(eq(schema.campaigns.id, id))
    .get();
}

export function listCampaigns(): CampaignRow[] {
  return db
    .select()
    .from(schema.campaigns)
    .orderBy(desc(schema.campaigns.createdAt))
    .all();
}

export function listCampaignProspects(campaignId: string): CampaignProspect[] {
  return db
    .select()
    .from(schema.prospects)
    .where(eq(schema.prospects.campaignId, campaignId))
    .all();
}

export function updatePipelineStatus(
  slug: string,
  status: string,
  error: string | null = null,
) {
  db.update(schema.prospects)
    .set({
      pipelineStatus: status,
      pipelineError: error,
      lastTouch: new Date().toISOString().slice(0, 10),
    })
    .where(eq(schema.prospects.slug, slug))
    .run();
}

export function markSent(slug: string) {
  const now = new Date().toISOString();
  db.update(schema.prospects)
    .set({
      pipelineStatus: "sent",
      sentAt: now,
      currentStage: "email_sent",
      lastTouch: now.slice(0, 10),
    })
    .where(eq(schema.prospects.slug, slug))
    .run();
  db.insert(schema.events)
    .values({
      prospectSlug: slug,
      ts: now,
      kind: "email_sent",
      note: "Autonomous send via Gmail API",
    })
    .run();
}

export function findReadyProspects(campaignId?: string): CampaignProspect[] {
  if (campaignId) {
    return db
      .select()
      .from(schema.prospects)
      .where(
        and(
          eq(schema.prospects.campaignId, campaignId),
          eq(schema.prospects.pipelineStatus, "ready_to_send"),
        ),
      )
      .all();
  }
  return db
    .select()
    .from(schema.prospects)
    .where(eq(schema.prospects.pipelineStatus, "ready_to_send"))
    .all();
}
