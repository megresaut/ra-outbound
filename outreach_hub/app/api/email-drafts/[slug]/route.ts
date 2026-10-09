import { db, schema } from "@/db/client";
import { desc, eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function PATCH(req: Request, { params }: { params: { slug: string } }) {
  const body = (await req.json().catch(() => ({}))) as { subject?: string; body?: string };
  const latest = db
    .select()
    .from(schema.emailDrafts)
    .where(eq(schema.emailDrafts.prospectSlug, params.slug))
    .orderBy(desc(schema.emailDrafts.version))
    .get();
  if (!latest) return Response.json({ error: "no draft to update" }, { status: 404 });
  db.update(schema.emailDrafts)
    .set({
      subject: body.subject ?? latest.subject,
      body: body.body ?? latest.body,
    })
    .where(eq(schema.emailDrafts.id, latest.id))
    .run();
  return Response.json({ ok: true, version: latest.version });
}
