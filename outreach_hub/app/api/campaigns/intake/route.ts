import { parse } from "csv-parse/sync";
import { db, schema } from "@/db/client";
import { eq } from "drizzle-orm";
import { createCampaign } from "@/lib/repositories/campaigns";
import {
  classifyIndustry,
  deriveWebsite,
  slugify,
  uniqueSlug,
} from "@/lib/pipeline/intake";
import { runPipelineForCampaign } from "@/lib/pipeline/orchestrator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// CSV column aliases — we look up these names case-insensitively.
const COL_ALIASES = {
  company: ["company", "company name", "organization", "account"],
  industry: ["industry", "vertical", "category", "sector"],
  contactName: ["contact name", "contact", "name", "full name", "first name"],
  contactEmail: ["contact email", "email", "work email"],
  website: ["website", "domain", "company website", "url"],
  location: ["location", "city", "hq", "address"],
  championTitle: ["title", "job title", "role", "position"],
  championLinkedin: ["person linkedin url", "person linkedin", "linkedin url", "linkedin"],
  companyLinkedin: ["company linkedin url", "company linkedin"],
  technologies: ["technologies", "tech stack", "technology stack", "tech"],
  employees: ["# employees", "employees", "employee count", "headcount", "company size"],
  annualRevenue: ["annual revenue", "revenue", "company revenue"],
};

function parseEmployees(s: string): number {
  if (!s) return 0;
  // Apollo formats: "25", "1,200", "11-50", "11 to 50". Take a midpoint for ranges.
  const cleaned = s.replace(/,/g, "");
  const range = cleaned.match(/(\d+)\s*[-–to]+\s*(\d+)/i);
  if (range) return Math.round((Number(range[1]) + Number(range[2])) / 2);
  const single = cleaned.match(/\d+/);
  return single ? Number(single[0]) : 0;
}

function pickCol(record: Record<string, string>, candidates: string[]): string {
  const keys = Object.keys(record);
  for (const c of candidates) {
    const k = keys.find((x) => x.trim().toLowerCase() === c.toLowerCase());
    if (k && record[k]?.trim()) return record[k].trim();
  }
  return "";
}

type ParseError = { row: number; reason: string };

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("csv") as File | null;
  const name = String(form.get("name") ?? "").trim() || `Batch ${new Date().toISOString().slice(0, 10)}`;

  if (!file) {
    return Response.json({ error: "csv file required" }, { status: 400 });
  }

  const text = await file.text();
  let records: Record<string, string>[];
  try {
    records = parse(text, {
      columns: (header: string[]) => header.map((h) => h.trim()),
      skip_empty_lines: true,
      trim: true,
    });
  } catch (e) {
    return Response.json(
      { error: `CSV parse failed: ${e instanceof Error ? e.message : String(e)}` },
      { status: 400 },
    );
  }

  if (records.length === 0) {
    return Response.json({ error: "CSV had no data rows" }, { status: 400 });
  }

  const campaignId = `cmp_${Date.now().toString(36)}`;
  const errors: ParseError[] = [];
  const existingSlugs = new Set(
    db.select({ slug: schema.prospects.slug }).from(schema.prospects).all().map((r) => r.slug),
  );

  const today = new Date().toISOString().slice(0, 10);
  const toInsert: Array<typeof schema.prospects.$inferInsert> = [];

  records.forEach((rec, idx) => {
    const rowNum = idx + 2; // header is row 1
    const company = pickCol(rec, COL_ALIASES.company);
    const industryRaw = pickCol(rec, COL_ALIASES.industry);
    const contactName = pickCol(rec, COL_ALIASES.contactName);
    const contactEmail = pickCol(rec, COL_ALIASES.contactEmail);

    if (!company) {
      errors.push({ row: rowNum, reason: "missing company name" });
      return;
    }
    if (!contactEmail || !contactEmail.includes("@")) {
      errors.push({ row: rowNum, reason: "missing or invalid email" });
      return;
    }
    const classified = classifyIndustry(industryRaw, company);
    if (!classified) {
      errors.push({
        row: rowNum,
        reason: `unknown industry "${industryRaw || "(blank)"}" — need property/HVAC/plumbing/electrical`,
      });
      return;
    }

    const baseSlug = slugify(company);
    if (!baseSlug) {
      errors.push({ row: rowNum, reason: "could not derive slug from company name" });
      return;
    }
    const slug = uniqueSlug(baseSlug, existingSlugs);
    existingSlugs.add(slug);

    const championTitle = pickCol(rec, COL_ALIASES.championTitle) || "—";
    const championLinkedinUrl = pickCol(rec, COL_ALIASES.championLinkedin) || null;
    const companyLinkedinUrl = pickCol(rec, COL_ALIASES.companyLinkedin) || null;
    const technologies = pickCol(rec, COL_ALIASES.technologies) || null;
    const annualRevenue = pickCol(rec, COL_ALIASES.annualRevenue) || null;
    const employees = parseEmployees(pickCol(rec, COL_ALIASES.employees));

    toInsert.push({
      slug,
      company,
      industry: classified.industry,
      template: classified.template,
      pack: classified.pack,
      employees,
      location: pickCol(rec, COL_ALIASES.location) || "—",
      website: deriveWebsite(contactEmail, pickCol(rec, COL_ALIASES.website)),
      championName: contactName || "—",
      championTitle,
      championEmail: contactEmail,
      championLinkedinUrl,
      companyLinkedinUrl,
      technologies,
      annualRevenue,
      currentStage: "researched",
      fitScore: 50,
      demoUrl: null,
      addedAt: today,
      lastTouch: today,
      campaignId,
      pipelineStatus: "research_pending",
      pipelineError: null,
      sentAt: null,
    });
  });

  if (toInsert.length === 0) {
    return Response.json(
      { error: "no valid rows in CSV", details: errors },
      { status: 400 },
    );
  }

  createCampaign({
    id: campaignId,
    name,
    csvFilename: file.name || null,
    rowCount: toInsert.length,
  });

  for (const p of toInsert) {
    db.insert(schema.prospects).values(p).run();
  }

  // Kick off orchestrator in the background. Don't await — we want a fast response.
  runPipelineForCampaign(campaignId).catch((err: unknown) => {
    console.error("[orchestrator] failed:", err);
  });

  return Response.json({
    campaignId,
    inserted: toInsert.length,
    skipped: errors.length,
    errors,
  });
}
