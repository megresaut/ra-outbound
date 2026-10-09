import { spawn, ChildProcess } from "child_process";
import { createServer } from "net";
import { existsSync } from "fs";
import path from "path";

const REPO_ROOT = path.resolve(process.cwd(), "..");
const DEMOS_DIR = path.join(REPO_ROOT, "demos");
const PREVIEW_PORT_START = 3201;
const PREVIEW_PORT_END = 3300;
const READY_TIMEOUT_MS = 90_000;

type Preview = {
  slug: string;
  port: number;
  process: ChildProcess;
  startedAt: number;
  status: "starting" | "ready" | "stopped" | "error";
  errorMessage?: string;
};

// Stash on globalThis so Next.js dev-server HMR doesn't wipe the map (each
// route-handler reload re-imports this module otherwise).
const G = globalThis as unknown as { __previews?: Map<string, Preview> };
if (!G.__previews) G.__previews = new Map<string, Preview>();
const previews = G.__previews;

function probePort(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const srv = createServer();
    srv.once("error", () => resolve(false));
    srv.once("listening", () => srv.close(() => resolve(true)));
    srv.listen(port, "127.0.0.1");
  });
}

async function findFreePort(): Promise<number> {
  const used = new Set([...previews.values()].map((p) => p.port));
  for (let port = PREVIEW_PORT_START; port <= PREVIEW_PORT_END; port++) {
    if (used.has(port)) continue;
    if (await probePort(port)) return port;
  }
  throw new Error(`No free port in [${PREVIEW_PORT_START}, ${PREVIEW_PORT_END}]`);
}

function runNpmInstall(cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn("npm", ["install", "--silent", "--no-audit", "--no-fund"], {
      cwd,
      env: { ...process.env },
    });
    let stderr = "";
    proc.stderr.on("data", (d) => (stderr += d.toString()));
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`npm install exited ${code}\n${stderr.slice(-500)}`));
    });
  });
}

function waitForReady(child: ChildProcess): Promise<void> {
  return new Promise((resolve, reject) => {
    let resolved = false;
    const timer = setTimeout(() => {
      if (resolved) return;
      resolved = true;
      reject(new Error(`next dev did not become ready within ${READY_TIMEOUT_MS / 1000}s`));
    }, READY_TIMEOUT_MS);

    const onChunk = (buf: Buffer) => {
      const s = buf.toString();
      if (/Ready in|Local:\s+http/.test(s) && !resolved) {
        resolved = true;
        clearTimeout(timer);
        resolve();
      }
    };
    child.stdout?.on("data", onChunk);
    child.stderr?.on("data", onChunk);
    child.once("exit", (code) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timer);
      reject(new Error(`next dev exited ${code} before becoming ready`));
    });
  });
}

export type PreviewState = {
  status: "stopped" | "starting" | "ready" | "error";
  port?: number;
  url?: string;
  errorMessage?: string;
};

export function getPreviewState(slug: string): PreviewState {
  const p = previews.get(slug);
  if (!p) return { status: "stopped" };
  if (p.status === "ready") {
    return { status: "ready", port: p.port, url: `http://localhost:${p.port}` };
  }
  return { status: p.status, port: p.port, errorMessage: p.errorMessage };
}

export async function startPreview(slug: string): Promise<PreviewState> {
  const existing = previews.get(slug);
  if (existing && (existing.status === "ready" || existing.status === "starting")) {
    return getPreviewState(slug);
  }

  const demoDir = path.join(DEMOS_DIR, slug);
  if (!existsSync(demoDir)) {
    throw new Error(`No demo at demos/${slug}`);
  }

  // Install deps if missing (first-time setup for older demos).
  if (!existsSync(path.join(demoDir, "node_modules", "next"))) {
    await runNpmInstall(demoDir);
  }

  const port = await findFreePort();
  const child = spawn("npx", ["next", "dev", "-p", String(port)], {
    cwd: demoDir,
    env: { ...process.env },
    detached: false,
  });

  const preview: Preview = {
    slug,
    port,
    process: child,
    startedAt: Date.now(),
    status: "starting",
  };
  previews.set(slug, preview);

  child.once("exit", () => {
    const p = previews.get(slug);
    if (p && p.process === child) previews.delete(slug);
  });

  try {
    await waitForReady(child);
    preview.status = "ready";
    return getPreviewState(slug);
  } catch (e) {
    preview.status = "error";
    preview.errorMessage = e instanceof Error ? e.message : String(e);
    child.kill("SIGTERM");
    throw e;
  }
}

export function stopPreview(slug: string): boolean {
  const p = previews.get(slug);
  if (!p) return false;
  p.status = "stopped";
  p.process.kill("SIGTERM");
  previews.delete(slug);
  return true;
}

// Kill every child when the outreach_hub process exits.
function cleanupAll() {
  for (const p of previews.values()) {
    try {
      p.process.kill("SIGTERM");
    } catch {
      // ignore
    }
  }
}
process.once("exit", cleanupAll);
process.once("SIGINT", cleanupAll);
process.once("SIGTERM", cleanupAll);
