import { db, schema } from "@/db/client";
import { eq, desc, asc } from "drizzle-orm";
import { getCampaign, listCampaignProspects } from "@/lib/repositories/campaigns";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const campaign = getCampaign(params.id);
  if (!campaign) {
    return Response.json({ error: "campaign not found" }, { status: 404 });
  }

  const prospects = listCampaignProspects(params.id);
  const rows = prospects.map((p) => {
    const latestEmail = db
      .select()
      .from(schema.emailDrafts)
      .where(eq(schema.emailDrafts.prospectSlug, p.slug))
      .orderBy(desc(schema.emailDrafts.version))
      .get();
    const pains = db
      .select()
      .from(schema.pains)
      .where(eq(schema.pains.prospectSlug, p.slug))
      .orderBy(asc(schema.pains.ord))
      .all();
    return {
      slug: p.slug,
      company: p.company,
      industry: p.industry,
      championName: p.championName,
      championEmail: p.championEmail,
      pipelineStatus: p.pipelineStatus,
      pipelineError: p.pipelineError,
      sentAt: p.sentAt,
      demoUrl: p.demoUrl,
      fitScore: p.fitScore,
      painCount: pains.length,
      topPain: pains[0]?.title ?? null,
      pains: pains.map((pn) => ({
        title: pn.title,
        pattern: pn.pattern,
        evidence: pn.evidence,
        libraryPatternId: pn.libraryPatternId,
      })),
      email: latestEmail
        ? { id: latestEmail.id, subject: latestEmail.subject, body: latestEmail.body, version: latestEmail.version }
        : null,
    };
  });

  const counts = rows.reduce(
    (acc, r) => {
      const s = r.pipelineStatus ?? "unknown";
      acc[s] = (acc[s] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return Response.json({
    campaign: {
      id: campaign.id,
      name: campaign.name,
      csvFilename: campaign.csvFilename,
      rowCount: campaign.rowCount,
      createdAt: campaign.createdAt,
    },
    counts,
    prospects: rows,
  });
}
