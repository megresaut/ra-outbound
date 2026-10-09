import { db, schema } from "@/db/client";
import { eq, desc, and, inArray } from "drizzle-orm";
import { sendGmail, isGmailConfigured } from "@/lib/gmail";
import { markSent, updatePipelineStatus } from "@/lib/repositories/campaigns";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

type SendResult = {
  slug: string;
  ok: boolean;
  messageId?: string;
  error?: string;
};

export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!isGmailConfigured()) {
    return Response.json(
      {
        error:
          "Gmail not configured. Run `npx tsx scripts/gmail-oauth-setup.ts` and add GOOGLE_REFRESH_TOKEN to .env.local.",
      },
      { status: 400 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as {
    slugs?: string[];
    from?: string;
  };
  const slugs = body.slugs ?? [];
  const from = body.from || "megha@reasonableautomations.com";
  if (slugs.length === 0) {
    return Response.json({ error: "No slugs provided" }, { status: 400 });
  }

  // Validate all slugs belong to this campaign and are ready_to_send.
  const prospects = db
    .select()
    .from(schema.prospects)
    .where(and(eq(schema.prospects.campaignId, params.id), inArray(schema.prospects.slug, slugs)))
    .all();

  if (prospects.length === 0) {
    return Response.json({ error: "No matching prospects in campaign" }, { status: 404 });
  }

  const results: SendResult[] = [];

  for (const p of prospects) {
    if (p.pipelineStatus !== "ready_to_send") {
      results.push({ slug: p.slug, ok: false, error: `not ready (status: ${p.pipelineStatus})` });
      continue;
    }
    const email = db
      .select()
      .from(schema.emailDrafts)
      .where(eq(schema.emailDrafts.prospectSlug, p.slug))
      .orderBy(desc(schema.emailDrafts.version))
      .get();
    if (!email) {
      results.push({ slug: p.slug, ok: false, error: "no email draft" });
      continue;
    }
    if (!p.championEmail || !p.championEmail.includes("@")) {
      results.push({ slug: p.slug, ok: false, error: "invalid champion email" });
      continue;
    }

    updatePipelineStatus(p.slug, "sending");
    try {
      const bodyText = email.body.replace(/\{\{demo_url\}\}/g, p.demoUrl || "");
      const sent = await sendGmail({
        from,
        to: p.championEmail,
        subject: email.subject,
        body: bodyText,
      });
      markSent(p.slug);
      results.push({ slug: p.slug, ok: true, messageId: sent.id });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      updatePipelineStatus(p.slug, "send_failed", msg);
      results.push({ slug: p.slug, ok: false, error: msg });
    }
  }

  const sentCount = results.filter((r) => r.ok).length;
  return Response.json({
    sent: sentCount,
    failed: results.length - sentCount,
    results,
  });
}
