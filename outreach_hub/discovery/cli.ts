// Standalone discovery CLI.
//
//   tsx outreach_hub/discovery/cli.ts [--limit N] [--dry-run] [--metros "Portland, OR;Seattle, WA"]
//   tsx outreach_hub/discovery/cli.ts --from-staged discovery/staged/staged-2026-05-20.json
//
// This file is NEVER imported by the Next.js server path. It opens the same
// ra.db that the server uses, BUT only in live mode. In --dry-run mode it
// makes zero DB writes and never opens ra.db.
//
// Pipeline mirrors `outreach_hub/app/api/campaigns/intake/route.ts`:
//   - reuse `slugify`, `uniqueSlug`, `deriveWebsite`, `classifyIndustry`
//   - shape the prospects insert row identically
//   - call `createCampaign(...)` and `runPipelineForCampaign(...)` exactly as intake does
//
// Two discovery front-ends, same back-end:
//   A. --from-staged <path>  — ingest a staging JSON file produced by the
//      `discover-pm-firms` Claude Code skill. Zero Anthropic API calls in the
//      CLI: the skill already did web-search + classification. Path may be a
//      file or a directory of *.json files.
//   B. (default)             — WebSearchDiscoverySource + classifyCandidate
//      run here, consuming Anthropic API credits.
//
// Shared back-end for every candidate that passes the rubric gate:
//   - passesIcpGate() drops anything below confidence 0.8 or wrong operating_model
//   - EmailEnrichmentProvider.findPersonEmail() (Anymailfinder live, Mock in dry-run)
//     with hard guards: name+domain required, per-valid-result credit counter
//   - If valid email → insert prospect + create campaign + kick orchestrator

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { Candidate, ClassificationResult, DiscoveryConfig, DiscoverySource, EmailEnrichmentProvider } from "./types";
import { WebSearchDiscoverySource } from "./sources/web-search";
import { DirectoryDiscoverySource } from "./sources/directory";
import { classifyCandidate, passesIcpGate } from "./icp-classifier";
import { AnymailfinderProvider, MockEnrichmentProvider } from "./enrichment";
import { recordRejection, REJECTED_DB_PATH_FOR_REPORT } from "./rejected-store";

// ─── Env loading ─────────────────────────────────────────────────────────────
// The Next.js server loads .env.local automatically; this standalone CLI does
// not get that for free. Load outreach_hub/.env.local then .env into
// process.env for any key not already set. Values are never logged.
function loadEnvFiles(): void {
  const root = path.join(__dirname, "..");
  for (const name of [".env.local", ".env"]) {
    const file = path.join(root, name);
    let text: string;
    try {
      text = fs.readFileSync(file, "utf8");
    } catch {
      continue; // file absent — fine
    }
    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq < 0) continue;
      const key = line.slice(0, eq).trim();
      if (!key || process.env[key] !== undefined) continue;
      let value = line.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_METROS = [
  "Portland, OR",
  "Seattle, WA",
  "Sacramento, CA",
  "Denver, CO",
  "Asheville, NC",
];

const DEFAULT_TOTAL_LIMIT = 15;
const DEFAULT_CREDIT_CAP = 100;

// ─── Flag parsing ────────────────────────────────────────────────────────────

function parseFlags(
  argv: string[],
): DiscoveryConfig & { mockLlm: boolean; stagedPath: string | null } {
  let limit = DEFAULT_TOTAL_LIMIT;
  let dryRun = false;
  let mockLlm = false;
  let metros: string[] = DEFAULT_METROS.slice();
  let creditCap = DEFAULT_CREDIT_CAP;
  let stagedPath: string | null = null;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") {
      dryRun = true;
    } else if (a === "--mock-llm") {
      mockLlm = true;
    } else if (a === "--from-staged") {
      stagedPath = argv[++i] ?? null;
    } else if (a.startsWith("--from-staged=")) {
      stagedPath = a.slice("--from-staged=".length);
    } else if (a === "--limit") {
      const v = Number(argv[++i]);
      if (Number.isFinite(v) && v > 0) limit = Math.floor(v);
    } else if (a.startsWith("--limit=")) {
      const v = Number(a.slice("--limit=".length));
      if (Number.isFinite(v) && v > 0) limit = Math.floor(v);
    } else if (a === "--metros") {
      const v = argv[++i];
      if (v) metros = v.split(/;|\|/).map((s) => s.trim()).filter((s) => s.length > 0);
    } else if (a.startsWith("--metros=")) {
      const v = a.slice("--metros=".length);
      metros = v.split(/;|\|/).map((s) => s.trim()).filter((s) => s.length > 0);
    } else if (a === "--credit-cap") {
      const v = Number(argv[++i]);
      if (Number.isFinite(v) && v > 0) creditCap = Math.floor(v);
    } else if (a.startsWith("--credit-cap=")) {
      const v = Number(a.slice("--credit-cap=".length));
      if (Number.isFinite(v) && v > 0) creditCap = Math.floor(v);
    }
  }

  return { metros, totalLimit: limit, dryRun, enrichmentCreditCap: creditCap, mockLlm, stagedPath };
}

// ─── Staged ingestion (consumes discover-pm-firms skill output) ──────────────

// A unit of work for the shared back-end: a candidate plus an optional
// pre-computed classification. Staged items arrive already classified by the
// skill; web-search items arrive with classification = null and get classified
// in the loop.
type WorkItem = { candidate: Candidate; classification: ClassificationResult | null };

const VALID_OPERATING_MODELS: ClassificationResult["operating_model"][] = [
  "operates-residences",
  "invests-in-RE",
  "brokerage",
  "concierge-only",
  "unclear",
];

function coerceChampion(raw: unknown): Candidate["champion"] {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  if (typeof o.fullName !== "string" || !o.fullName.trim()) return undefined;
  return {
    fullName: o.fullName.trim(),
    title: typeof o.title === "string" && o.title.trim() ? o.title.trim() : undefined,
    linkedinUrl:
      typeof o.linkedinUrl === "string" && o.linkedinUrl.trim()
        ? o.linkedinUrl.trim()
        : undefined,
  };
}

function coerceClassification(
  raw: unknown,
  fallbackChampion: Candidate["champion"],
  fallbackDomain?: string,
): ClassificationResult | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const operating_model =
    typeof o.operating_model === "string" &&
    (VALID_OPERATING_MODELS as string[]).includes(o.operating_model)
      ? (o.operating_model as ClassificationResult["operating_model"])
      : "unclear";
  const confidence = Math.max(
    0,
    Math.min(1, typeof o.confidence === "number" ? o.confidence : 0),
  );
  return {
    is_icp: o.is_icp === true,
    operating_model,
    firm_size_estimate: typeof o.firm_size_estimate === "number" ? o.firm_size_estimate : 0,
    confidence,
    reasoning: typeof o.reasoning === "string" ? o.reasoning : "(staged — no reasoning)",
    champion: coerceChampion(o.champion) ?? fallbackChampion,
    domain: typeof o.domain === "string" && o.domain.trim() ? o.domain.trim() : fallbackDomain,
  };
}

type StagedFile = {
  rubric_unsigned?: boolean;
  candidates?: Array<Record<string, unknown>>;
};

function loadStagedWorkItems(stagedPath: string): WorkItem[] {
  const resolved = path.resolve(stagedPath);
  const stat = fs.statSync(resolved); // throws loudly if the path is missing
  const files: string[] = stat.isDirectory()
    ? fs
        .readdirSync(resolved)
        .filter((f) => f.endsWith(".json"))
        .sort()
        .map((f) => path.join(resolved, f))
    : [resolved];

  if (files.length === 0) {
    throw new Error(`--from-staged: no .json files found at ${resolved}`);
  }

  const items: WorkItem[] = [];
  for (const file of files) {
    let parsed: StagedFile;
    try {
      parsed = JSON.parse(fs.readFileSync(file, "utf8")) as StagedFile;
    } catch (e) {
      throw new Error(`--from-staged: ${path.basename(file)} is not valid JSON: ${(e as Error).message}`);
    }
    if (parsed.rubric_unsigned) {
      console.warn(
        `[discovery] staged file ${path.basename(file)} reports rubric_unsigned=true — batch is scaffolded, not human-signed.`,
      );
    }
    const cands = Array.isArray(parsed.candidates) ? parsed.candidates : [];
    for (const c of cands) {
      const company = typeof c.company === "string" ? c.company.trim() : "";
      if (!company) continue;
      const website =
        typeof c.website === "string"
          ? c.website.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "")
          : undefined;
      const location =
        typeof c.location === "string" && c.location.trim() ? c.location.trim() : "—";
      const champion = coerceChampion(c.champion);
      const candidate: Candidate = {
        company,
        website,
        location,
        champion,
        notes: "staged",
        source: "skill:discover-pm-firms",
      };
      items.push({
        candidate,
        classification: coerceClassification(c.classification, champion, website),
      });
    }
  }
  return items;
}

// ─── Mock LLM helpers (fixture set for offline gate verification) ────────────

class FixtureDiscoverySource implements DiscoverySource {
  readonly name = "fixture";
  async search(metro: string, limit: number): Promise<Candidate[]> {
    // Deterministic fixture: synthesizes plausible-looking candidates from the
    // metro name so dry-run --mock-llm can exercise the full pipeline without
    // hitting Claude or the network.
    const stem = metro.split(",")[0].replace(/\s+/g, "");
    const base: Candidate[] = [
      {
        company: `${stem} Residential Partners`,
        website: `${stem.toLowerCase()}residential.com`,
        location: metro,
        champion: { fullName: "Avery Marin", title: "Director of Operations" },
        notes: "fixture",
        source: this.name,
      },
      {
        company: `Northwall PM ${stem}`,
        website: `northwallpm-${stem.toLowerCase()}.com`,
        location: metro,
        champion: { fullName: "Jordan Lee", title: "Head of Operations" },
        notes: "fixture",
        source: this.name,
      },
      {
        company: `${stem} Estate Group`,
        website: `${stem.toLowerCase()}estategroup.com`,
        location: metro,
        champion: { fullName: "Sam Patel", title: "Office Manager" },
        notes: "fixture",
        source: this.name,
      },
    ];
    return base.slice(0, Math.min(limit, base.length));
  }
}

function fixtureClassify(c: Candidate): ClassificationResult {
  // Deterministic mock classification — passes the gate.
  return {
    is_icp: true,
    operating_model: "operates-residences",
    firm_size_estimate: 30,
    confidence: 0.9,
    reasoning: "fixture pass",
    champion: c.champion,
    domain: c.website,
  };
}

// ─── Aggregation ─────────────────────────────────────────────────────────────

async function gatherCandidates(
  cfg: DiscoveryConfig & { mockLlm: boolean },
): Promise<Candidate[]> {
  const webSource: DiscoverySource = cfg.mockLlm
    ? new FixtureDiscoverySource()
    : new WebSearchDiscoverySource();
  const directorySource = new DirectoryDiscoverySource();

  const perMetro = Math.max(3, Math.ceil(cfg.totalLimit / Math.max(1, cfg.metros.length)) + 2);
  const all: Candidate[] = [];

  for (const metro of cfg.metros) {
    if (all.length >= cfg.totalLimit) break;
    const remaining = cfg.totalLimit - all.length;
    const askFor = Math.min(perMetro, remaining + 5);
    console.log(`[discovery] metro=${metro} requesting=${askFor}`);
    try {
      const cs = await webSource.search(metro, askFor);
      console.log(`[discovery] metro=${metro} web-search returned=${cs.length}`);
      all.push(...cs);
    } catch (e) {
      console.error(`[discovery] metro=${metro} web-search failed:`, e instanceof Error ? e.message : e);
    }
    try {
      // Stubbed source — wired into the loop intentionally so the interface is exercised.
      const stub = await directorySource.search(metro, 5);
      if (stub.length > 0) all.push(...stub);
    } catch (e) {
      console.error(`[discovery] directory stub failed:`, e instanceof Error ? e.message : e);
    }
  }

  // De-dupe by company+location (case-insensitive).
  const seen = new Set<string>();
  const deduped: Candidate[] = [];
  for (const c of all) {
    const key = `${c.company.toLowerCase()}|${c.location.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(c);
    if (deduped.length >= cfg.totalLimit) break;
  }
  return deduped;
}

// ─── Insert path (mirrors app/api/campaigns/intake/route.ts) ─────────────────

type IntakeHelpers = {
  classifyIndustry: typeof import("../lib/pipeline/intake").classifyIndustry;
  deriveWebsite: typeof import("../lib/pipeline/intake").deriveWebsite;
  slugify: typeof import("../lib/pipeline/intake").slugify;
  uniqueSlug: typeof import("../lib/pipeline/intake").uniqueSlug;
};

type Persistence = {
  helpers: IntakeHelpers;
  createCampaign: typeof import("../lib/repositories/campaigns").createCampaign;
  runPipelineForCampaign: typeof import("../lib/pipeline/orchestrator").runPipelineForCampaign;
  insertProspect: (row: typeof import("../db/schema").prospects.$inferInsert) => void;
  existingSlugs: Set<string>;
};

async function loadPersistence(): Promise<Persistence> {
  // Lazy-load — keeps ra.db closed during --dry-run.
  const intake = await import("../lib/pipeline/intake");
  const campaigns = await import("../lib/repositories/campaigns");
  const orchestrator = await import("../lib/pipeline/orchestrator");
  const dbModule = await import("../db/client");

  const existingSlugs = new Set(
    dbModule.db
      .select({ slug: dbModule.schema.prospects.slug })
      .from(dbModule.schema.prospects)
      .all()
      .map((r: { slug: string }) => r.slug),
  );

  return {
    helpers: {
      classifyIndustry: intake.classifyIndustry,
      deriveWebsite: intake.deriveWebsite,
      slugify: intake.slugify,
      uniqueSlug: intake.uniqueSlug,
    },
    createCampaign: campaigns.createCampaign,
    runPipelineForCampaign: orchestrator.runPipelineForCampaign,
    insertProspect: (row) => {
      dbModule.db.insert(dbModule.schema.prospects).values(row).run();
    },
    existingSlugs,
  };
}

async function importDryRunHelpers(): Promise<IntakeHelpers> {
  // Even in dry-run we exercise the same intake helpers so the gate proves
  // they are wired correctly — they are pure and don't touch ra.db.
  const intake = await import("../lib/pipeline/intake");
  return {
    classifyIndustry: intake.classifyIndustry,
    deriveWebsite: intake.deriveWebsite,
    slugify: intake.slugify,
    uniqueSlug: intake.uniqueSlug,
  };
}

// ─── Main ────────────────────────────────────────────────────────────────────

type Summary = {
  candidates: number;
  passed: number;
  enriched: number;
  inserted: number;
  rejected: number;
  creditsUsed: number;
  campaignId: string | null;
};

async function main(): Promise<Summary> {
  loadEnvFiles();
  const cfg = parseFlags(process.argv.slice(2));
  const frontEnd = cfg.stagedPath ? `STAGED(${cfg.stagedPath})` : "WEB-SEARCH";
  console.log(
    `[discovery] start mode=${cfg.dryRun ? "DRY-RUN" : "LIVE"}${cfg.mockLlm ? " mock-llm" : ""} front-end=${frontEnd} creditCap=${cfg.enrichmentCreditCap}`,
  );

  // Front-end A: ingest the discover-pm-firms skill's staging file (no
  // Anthropic API calls here). Front-end B: run web-search + classify here.
  let workItems: WorkItem[];
  if (cfg.stagedPath) {
    workItems = loadStagedWorkItems(cfg.stagedPath);
    console.log(`[discovery] loaded ${workItems.length} staged candidates`);
  } else {
    const candidates = await gatherCandidates(cfg);
    workItems = candidates.map((c) => ({ candidate: c, classification: null }));
    console.log(`[discovery] gathered ${workItems.length} candidates (target ${cfg.totalLimit})`);
  }

  let helpers: IntakeHelpers;
  let persistence: Persistence | null = null;
  if (cfg.dryRun) {
    helpers = await importDryRunHelpers();
  } else {
    persistence = await loadPersistence();
    helpers = persistence.helpers;
  }

  const enrichment: EmailEnrichmentProvider = cfg.dryRun
    ? new MockEnrichmentProvider({ cap: cfg.enrichmentCreditCap })
    : new AnymailfinderProvider({ cap: cfg.enrichmentCreditCap });

  let campaignId: string | null = null;
  let createdCampaign = false;
  let passed = 0;
  let enriched = 0;
  let inserted = 0;
  let rejected = 0;
  const today = new Date().toISOString().slice(0, 10);
  const localSlugs = new Set<string>();

  for (const item of workItems) {
    const c = item.candidate;
    let classification: ClassificationResult | null = item.classification;
    if (!classification) {
      // Web-search front-end: classify here. Staged front-end: already done.
      try {
        classification = cfg.mockLlm ? fixtureClassify(c) : await classifyCandidate(c);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.warn(`[discovery] classify failed for ${c.company}: ${msg}`);
        if (!cfg.dryRun) recordRejection(c, null, `classify_error: ${msg}`);
        rejected++;
        continue;
      }
    }

    if (!passesIcpGate(classification)) {
      const reason = `gate_fail: model=${classification.operating_model} confidence=${classification.confidence.toFixed(2)}`;
      console.log(`[discovery] reject ${c.company} — ${reason}`);
      if (!cfg.dryRun) recordRejection(c, classification, reason);
      rejected++;
      continue;
    }
    passed++;

    // Enrichment requires a scraped name + a verifiable domain.
    const championName = classification.champion?.fullName ?? c.champion?.fullName ?? "";
    const domain = classification.domain ?? c.website ?? "";
    if (!championName || !domain) {
      const reason = `enrichment_skipped: name=${championName ? "yes" : "no"} domain=${domain ? "yes" : "no"}`;
      console.log(`[discovery] reject ${c.company} — ${reason}`);
      if (!cfg.dryRun) recordRejection(c, classification, reason);
      rejected++;
      continue;
    }

    let enrichmentRes;
    try {
      enrichmentRes = await enrichment.findPersonEmail({
        fullName: championName,
        domain,
        companyName: c.company,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn(`[discovery] enrichment refused/failed for ${c.company}: ${msg}`);
      if (!cfg.dryRun) recordRejection(c, classification, `enrichment_error: ${msg}`);
      rejected++;
      // If the cap is hit, stop the loop entirely.
      if (msg.includes("credit cap")) {
        console.warn("[discovery] credit cap reached — halting loop.");
        break;
      }
      continue;
    }
    if (!enrichmentRes.valid || !enrichmentRes.email) {
      const reason = `enrichment_invalid: status=${enrichmentRes.email_status}`;
      console.log(`[discovery] reject ${c.company} — ${reason}`);
      if (!cfg.dryRun) recordRejection(c, classification, reason);
      rejected++;
      continue;
    }
    enriched++;

    // Build the same prospects insert shape that the CSV intake route builds.
    const classified = helpers.classifyIndustry("Property management", c.company);
    if (!classified) {
      const reason = `industry_classify_failed`;
      console.warn(`[discovery] reject ${c.company} — ${reason}`);
      if (!cfg.dryRun) recordRejection(c, classification, reason);
      rejected++;
      continue;
    }
    const baseSlug = helpers.slugify(c.company);
    if (!baseSlug) {
      const reason = `slugify_empty`;
      console.warn(`[discovery] reject ${c.company} — ${reason}`);
      if (!cfg.dryRun) recordRejection(c, classification, reason);
      rejected++;
      continue;
    }

    if (cfg.dryRun) {
      // Dry-run uses local-only slug uniqueness; never touches ra.db.
      const slug = helpers.uniqueSlug(baseSlug, localSlugs);
      localSlugs.add(slug);
      console.log(
        `[discovery] DRY would-insert slug=${slug} company="${c.company}" email=${enrichmentRes.email}`,
      );
      inserted++;
      continue;
    }

    if (!persistence) throw new Error("persistence missing in live mode");

    if (!createdCampaign) {
      campaignId = `cmp_${Date.now().toString(36)}_disc`;
      persistence.createCampaign({
        id: campaignId,
        name: `Discovery ${today}`,
        csvFilename: null,
        rowCount: 0,
      });
      createdCampaign = true;
    }

    const slug = helpers.uniqueSlug(baseSlug, persistence.existingSlugs);
    persistence.existingSlugs.add(slug);

    persistence.insertProspect({
      slug,
      company: c.company,
      industry: classified.industry,
      template: classified.template,
      pack: classified.pack,
      employees: classification.firm_size_estimate || 0,
      location: c.location || "—",
      website: helpers.deriveWebsite(enrichmentRes.email, domain),
      championName,
      championTitle: classification.champion?.title ?? c.champion?.title ?? "—",
      championEmail: enrichmentRes.email,
      championLinkedinUrl: classification.champion?.linkedinUrl ?? c.champion?.linkedinUrl ?? null,
      companyLinkedinUrl: null,
      technologies: null,
      annualRevenue: null,
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
    inserted++;
    console.log(`[discovery] insert slug=${slug} company="${c.company}" email=${enrichmentRes.email}`);
  }

  // Run the orchestrator to completion if anything was inserted live. The CLI
  // is a short-lived process — unlike the Next server it must AWAIT the
  // pipeline, otherwise the process exits and orphans the in-flight work.
  if (!cfg.dryRun && persistence && campaignId && inserted > 0) {
    console.log(`[discovery] running pipeline for campaign ${campaignId} ...`);
    try {
      await persistence.runPipelineForCampaign(campaignId);
      console.log(`[discovery] pipeline complete for ${campaignId}`);
    } catch (err) {
      console.error("[discovery] orchestrator failed:", err);
    }
  }

  // Surface enrichment counters via the provider concrete classes.
  const creditsUsed =
    "used" in (enrichment as object)
      ? (enrichment as unknown as { used: number }).used
      : 0;

  const summary: Summary = {
    candidates: workItems.length,
    passed,
    enriched,
    inserted,
    rejected,
    creditsUsed,
    campaignId,
  };
  console.log(`[discovery] done ${JSON.stringify(summary)}`);
  if (!cfg.dryRun) {
    console.log(`[discovery] rejected store: ${REJECTED_DB_PATH_FOR_REPORT}`);
  }
  return summary;
}

// Run when invoked as a script (not when imported for tests).
const isMain = (() => {
  try {
    if (typeof require !== "undefined" && require.main === module) return true;
  } catch {
    /* noop */
  }
  // For ESM contexts, compare URLs.
  try {
    const here = fileURLToPath(import.meta.url);
    return path.resolve(here) === path.resolve(process.argv[1] ?? "");
  } catch {
    return false;
  }
})();

if (isMain) {
  main().catch((err) => {
    console.error("[discovery] fatal:", err);
    process.exit(1);
  });
}

export { main, parseFlags };
