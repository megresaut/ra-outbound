import { db, schema } from "@/db/client";
import { asc, desc, eq } from "drizzle-orm";
import type { Prospect, Stage } from "@/lib/prospects";

// kind <-> UI label
const KIND_TO_LABEL: Record<string, string> = {
  researched: "Researched",
  pain_mapped: "Pain mapped",
  demo_built: "Demo built",
  email_drafted: "Email drafted",
  email_sent: "Email sent",
  replied: "Replied",
  meeting_booked: "Meeting booked",
  closed_lost: "Closed lost",
};

function eventLabel(kind: string): string {
  return KIND_TO_LABEL[kind] ?? kind;
}

// ── Thin row → Prospect (for table list) ───────────────────────────────────
function rowToThinProspect(row: typeof schema.prospects.$inferSelect): Prospect {
  return {
    slug: row.slug,
    company: row.company,
    industry: row.industry as Prospect["industry"],
    template: row.template as Prospect["template"],
    pack: (row.pack ?? undefined) as Prospect["pack"],
    employees: row.employees,
    location: row.location,
    website: row.website,
    champion: {
      name: row.championName,
      title: row.championTitle,
      email: row.championEmail,
    },
    stage: row.currentStage as Stage,
    fitScore: row.fitScore,
    pains: [],
    demoUrl: row.demoUrl ?? "",
    emailDraft: { subject: "", body: "" },
    timeline: [],
    addedAt: row.addedAt,
    lastTouch: row.lastTouch,
  };
}

export function listProspects(): Prospect[] {
  const rows = db
    .select()
    .from(schema.prospects)
    .orderBy(desc(schema.prospects.lastTouch))
    .all();
  return rows.map(rowToThinProspect);
}

// ── Full nested prospect (for detail page) ─────────────────────────────────
export function getProspect(slug: string): Prospect | undefined {
  const row = db
    .select()
    .from(schema.prospects)
    .where(eq(schema.prospects.slug, slug))
    .get();
  if (!row) return undefined;

  const research = db
    .select()
    .from(schema.research)
    .where(eq(schema.research.prospectSlug, slug))
    .get();
  const signals = db
    .select()
    .from(schema.researchSignals)
    .where(eq(schema.researchSignals.prospectSlug, slug))
    .orderBy(asc(schema.researchSignals.ord))
    .all();
  const pains = db
    .select()
    .from(schema.pains)
    .where(eq(schema.pains.prospectSlug, slug))
    .orderBy(asc(schema.pains.ord))
    .all();
  const emails = db
    .select()
    .from(schema.emailDrafts)
    .where(eq(schema.emailDrafts.prospectSlug, slug))
    .orderBy(desc(schema.emailDrafts.version))
    .all();
  const events = db
    .select()
    .from(schema.events)
    .where(eq(schema.events.prospectSlug, slug))
    .orderBy(asc(schema.events.id))
    .all();

  const latestEmail = emails[0];

  return {
    slug: row.slug,
    company: row.company,
    industry: row.industry as Prospect["industry"],
    template: row.template as Prospect["template"],
    pack: (row.pack ?? undefined) as Prospect["pack"],
    employees: row.employees,
    location: row.location,
    website: row.website,
    champion: {
      name: row.championName,
      title: row.championTitle,
      email: row.championEmail,
    },
    stage: row.currentStage as Stage,
    fitScore: row.fitScore,
    research: research
      ? {
          fundingStatus: research.fundingStatus,
          yearsOperating: research.yearsOperating,
          techProfile: research.techProfile,
          developerHeadcount: research.developerHeadcount,
          workflowSignals: signals.map((s) => ({
            source: s.source,
            quote: s.quote,
          })),
        }
      : undefined,
    pains: pains.map((p) => ({
      title: p.title,
      pattern: p.pattern,
      evidence: p.evidence,
    })),
    demoUrl: row.demoUrl ?? "",
    emailDraft: latestEmail
      ? { subject: latestEmail.subject, body: latestEmail.body }
      : { subject: "", body: "" },
    timeline: events.map((e) => ({
      date: e.ts,
      event: eventLabel(e.kind),
      note: e.note ?? undefined,
    })),
    addedAt: row.addedAt,
    lastTouch: row.lastTouch,
  };
}
