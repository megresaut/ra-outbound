import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { db, schema } from "@/db/client";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const REPO_ROOT = path.resolve(process.cwd(), "..");
const DEMOS_DIR = path.join(REPO_ROOT, "demos");

function vercelDeploy(cwd: string, projectName: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "npx",
      ["--yes", "vercel", "--prod", "--yes", "--name", projectName],
      { cwd, env: { ...process.env } },
    );

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => (stdout += d.toString()));
    child.stderr.on("data", (d) => (stderr += d.toString()));

    child.on("error", (e) => reject(new Error(`Failed to spawn vercel: ${e.message}`)));
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`vercel exited ${code}\nstderr tail: ${stderr.slice(-800)}`));
        return;
      }
      const urlMatch = (stdout + "\n" + stderr).match(/https:\/\/[a-z0-9-]+\.vercel\.app/g);
      if (!urlMatch || urlMatch.length === 0) {
        reject(new Error(`vercel succeeded but no URL found`));
        return;
      }
      resolve(urlMatch[urlMatch.length - 1]);
    });
  });
}

export async function POST(_req: Request, { params }: { params: { slug: string } }) {
  const slug = params.slug;
  const demoDir = path.join(DEMOS_DIR, slug);

  if (!fs.existsSync(demoDir)) {
    return new Response(
      JSON.stringify({ error: `No local demo at demos/${slug}` }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  }

  const prospect = db
    .select({ slug: schema.prospects.slug })
    .from(schema.prospects)
    .where(eq(schema.prospects.slug, slug))
    .get();
  if (!prospect) {
    return new Response(
      JSON.stringify({ error: `Prospect "${slug}" not in DB` }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (type: string, data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type, data })}\n\n`));
      };
      try {
        send("step", { label: "Deploying to Vercel (this takes ~60s)", stage: "deploy" });
        const url = await vercelDeploy(demoDir, slug);
        send("step", { label: "Deployed", stage: "deploy", url });

        send("step", { label: "Updating DB", stage: "db" });
        const today = new Date().toISOString().slice(0, 10);
        db.update(schema.prospects)
          .set({ demoUrl: url, lastTouch: today })
          .where(eq(schema.prospects.slug, slug))
          .run();
        db.insert(schema.events)
          .values({
            prospectSlug: slug,
            ts: new Date().toISOString(),
            kind: "demo_built",
            note: `Deployed to ${url}`,
          })
          .run();

        send("done", { slug, url });
      } catch (e) {
        send("error", { message: e instanceof Error ? e.message : String(e) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
