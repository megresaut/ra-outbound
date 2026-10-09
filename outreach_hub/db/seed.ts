import { db, schema } from "./client";
import { PROSPECTS, STAGE_LABEL } from "../lib/prospects";

const TODAY_ISO = new Date().toISOString();

function eventKindFor(label: string): string {
  // map UI-facing event labels to canonical kinds
  const k = label.toLowerCase().replace(/\s+/g, "_");
  if (k === "researched") return "researched";
  if (k === "pain_mapped") return "pain_mapped";
  if (k === "demo_built") return "demo_built";
  if (k === "email_drafted") return "email_drafted";
  if (k === "email_sent") return "email_sent";
  if (k === "replied") return "replied";
  if (k === "meeting_booked") return "meeting_booked";
  if (k === "closed_lost") return "closed_lost";
  return "note";
}

function seed() {
  console.log(`Seeding ${PROSPECTS.length} prospects...`);

  // Idempotent: clear and re-insert. Cascade takes care of children.
  db.delete(schema.prospects).run();

  for (const p of PROSPECTS) {
    db.insert(schema.prospects)
      .values({
        slug: p.slug,
        company: p.company,
        industry: p.industry,
        template: p.template,
        pack: p.pack ?? null,
        employees: p.employees,
        location: p.location,
        website: p.website,
        championName: p.champion.name,
        championTitle: p.champion.title,
        championEmail: p.champion.email,
        currentStage: p.stage,
        fitScore: p.fitScore,
        demoUrl: p.demoUrl,
        addedAt: p.addedAt,
        lastTouch: p.lastTouch,
      })
      .run();

    if (p.research) {
      db.insert(schema.research)
        .values({
          prospectSlug: p.slug,
          fundingStatus: p.research.fundingStatus,
          yearsOperating: p.research.yearsOperating,
          techProfile: p.research.techProfile,
          developerHeadcount: p.research.developerHeadcount,
        })
        .run();

      p.research.workflowSignals.forEach((s, i) => {
        db.insert(schema.researchSignals)
          .values({
            prospectSlug: p.slug,
            source: s.source,
            quote: s.quote,
            ord: i,
          })
          .run();
      });
    }

    p.pains.forEach((pain, i) => {
      db.insert(schema.pains)
        .values({
          prospectSlug: p.slug,
          title: pain.title,
          pattern: pain.pattern,
          evidence: pain.evidence,
          ord: i,
        })
        .run();
    });

    if (p.emailDraft.subject) {
      db.insert(schema.emailDrafts)
        .values({
          prospectSlug: p.slug,
          version: 1,
          subject: p.emailDraft.subject,
          body: p.emailDraft.body,
          createdAt: p.addedAt,
        })
        .run();
    }

    p.timeline.forEach((evt) => {
      db.insert(schema.events)
        .values({
          prospectSlug: p.slug,
          ts: evt.date,
          kind: eventKindFor(evt.event),
          note: evt.note ?? null,
        })
        .run();
    });
  }

  const counts = {
    prospects: db.select().from(schema.prospects).all().length,
    research: db.select().from(schema.research).all().length,
    signals: db.select().from(schema.researchSignals).all().length,
    pains: db.select().from(schema.pains).all().length,
    emails: db.select().from(schema.emailDrafts).all().length,
    events: db.select().from(schema.events).all().length,
  };
  console.log("Seeded:", counts);
}

seed();
