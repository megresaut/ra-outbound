import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// ── Campaigns (CSV-driven autonomous batches) ──────────────────────────────
export const campaigns = sqliteTable("campaigns", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  csvFilename: text("csv_filename"),
  rowCount: integer("row_count").notNull(),
  createdAt: text("created_at").notNull(),
});

// ── Prospects ──────────────────────────────────────────────────────────────
export const prospects = sqliteTable("prospects", {
  slug: text("slug").primaryKey(),
  company: text("company").notNull(),
  industry: text("industry").notNull(),
  template: text("template").notNull(),
  pack: text("pack"),
  employees: integer("employees").notNull(),
  location: text("location").notNull(),
  website: text("website").notNull(),
  championName: text("champion_name").notNull(),
  championTitle: text("champion_title").notNull(),
  championEmail: text("champion_email").notNull(),
  championLinkedinUrl: text("champion_linkedin_url"),
  companyLinkedinUrl: text("company_linkedin_url"),
  technologies: text("technologies"),
  annualRevenue: text("annual_revenue"),
  currentStage: text("current_stage").notNull(),
  fitScore: integer("fit_score").notNull(),
  demoUrl: text("demo_url"),
  addedAt: text("added_at").notNull(),
  lastTouch: text("last_touch").notNull(),
  // Autonomous-pipeline fields (null for manually-created prospects)
  campaignId: text("campaign_id").references(() => campaigns.id, { onDelete: "set null" }),
  pipelineStatus: text("pipeline_status"),
  pipelineError: text("pipeline_error"),
  sentAt: text("sent_at"),
});

// ── Researcher output ──────────────────────────────────────────────────────
export const research = sqliteTable("research", {
  prospectSlug: text("prospect_slug")
    .primaryKey()
    .references(() => prospects.slug, { onDelete: "cascade" }),
  fundingStatus: text("funding_status").notNull(),
  yearsOperating: integer("years_operating").notNull(),
  techProfile: text("tech_profile").notNull(),
  developerHeadcount: integer("developer_headcount").notNull(),
});

export const researchSignals = sqliteTable("research_signals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  prospectSlug: text("prospect_slug")
    .notNull()
    .references(() => prospects.slug, { onDelete: "cascade" }),
  source: text("source").notNull(),
  quote: text("quote").notNull(),
  ord: integer("ord").notNull(),
});

// ── Pain Mapper output ─────────────────────────────────────────────────────
export const pains = sqliteTable("pains", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  prospectSlug: text("prospect_slug")
    .notNull()
    .references(() => prospects.slug, { onDelete: "cascade" }),
  title: text("title").notNull(),
  pattern: text("pattern").notNull(),
  evidence: text("evidence").notNull(),
  ord: integer("ord").notNull(),
  // Library pattern this pain maps to (e.g. "multi_portal_extraction"), or null
  // for novel pains not yet in the library.
  libraryPatternId: text("library_pattern_id"),
});

// ── Email Drafter output (versioned for regenerations) ─────────────────────
export const emailDrafts = sqliteTable("email_drafts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  prospectSlug: text("prospect_slug")
    .notNull()
    .references(() => prospects.slug, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  createdAt: text("created_at").notNull(),
});

// ── Timeline / audit trail ─────────────────────────────────────────────────
// kinds: researched, pain_mapped, demo_built, email_drafted,
//        email_sent, replied, meeting_booked, closed_lost, note
export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  prospectSlug: text("prospect_slug")
    .notNull()
    .references(() => prospects.slug, { onDelete: "cascade" }),
  ts: text("ts").notNull(),
  kind: text("kind").notNull(),
  note: text("note"),
});

