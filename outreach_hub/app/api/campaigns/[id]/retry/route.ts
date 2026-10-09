import { retryProspect } from "@/lib/pipeline/orchestrator";
import { db, schema } from "@/db/client";
import { and, eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = (await req.json().catch(() => ({}))) as { slug?: string };
  if (!body.slug) {
    return Response.json({ error: "slug required" }, { status: 400 });
  }
  const p = db
    .select()
    .from(schema.prospects)
    .where(and(eq(schema.prospects.slug, body.slug), eq(schema.prospects.campaignId, params.id)))
    .get();
  if (!p) {
    return Response.json({ error: "prospect not found in campaign" }, { status: 404 });
  }
  retryProspect(body.slug).catch((err) => console.error("[retry] failed:", err));
  return Response.json({ ok: true });
}
