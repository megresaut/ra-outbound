// One-off: reset all non-sent prospects in a campaign to research_pending and re-run the pipeline.
// Usage: ANTHROPIC_API_KEY=... npx tsx scripts/retry-campaign.ts <campaignId>

import fs from "fs";
import path from "path";

function loadEnvLocal() {
  const file = path.resolve(__dirname, "..", ".env.local");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadEnvLocal();

import { db, schema } from "../db/client";
import { and, eq, inArray, ne } from "drizzle-orm";
import { runPipelineForCampaign } from "../lib/pipeline/orchestrator";

const campaignId = process.argv[2];
if (!campaignId) {
  console.error("Usage: npx tsx scripts/retry-campaign.ts <campaignId>");
  process.exit(1);
}
if (!process.env.ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY not set");
  process.exit(1);
}

async function main() {
  const before = db
    .select({ slug: schema.prospects.slug, status: schema.prospects.pipelineStatus })
    .from(schema.prospects)
    .where(eq(schema.prospects.campaignId, campaignId))
    .all();

  const toRetry = before.filter(
    (p) => p.status !== "sent" && p.status !== "email_sent" && p.status !== "ready_to_send",
  );
  console.log(`Campaign ${campaignId}: ${before.length} total, ${toRetry.length} to retry.`);
  for (const p of toRetry) {
    console.log(`  ${p.slug.padEnd(50)} ${p.status}`);
  }

  // Reset to research_pending and clear error.
  for (const p of toRetry) {
    db.update(schema.prospects)
      .set({ pipelineStatus: "research_pending", pipelineError: null })
      .where(eq(schema.prospects.slug, p.slug))
      .run();
  }
  console.log(`Reset ${toRetry.length} to research_pending. Running pipeline...`);

  await runPipelineForCampaign(campaignId);

  const after = db
    .select({ status: schema.prospects.pipelineStatus, slug: schema.prospects.slug })
    .from(schema.prospects)
    .where(eq(schema.prospects.campaignId, campaignId))
    .all();
  const breakdown = after.reduce<Record<string, number>>((acc, p) => {
    const k = p.status ?? "(null)";
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
  console.log("\nFinal status breakdown:");
  for (const [k, v] of Object.entries(breakdown)) {
    console.log(`  ${k}: ${v}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
