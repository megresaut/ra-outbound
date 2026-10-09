/**
 * One-time Gmail OAuth setup.
 *
 * Prereq: create a Google Cloud project, enable the Gmail API,
 * create an OAuth 2.0 Client ID of type "Web application" with
 * authorized redirect URI = http://localhost:4399/callback
 * Put CLIENT_ID and CLIENT_SECRET into outreach_hub/.env.local:
 *
 *   GOOGLE_CLIENT_ID=...
 *   GOOGLE_CLIENT_SECRET=...
 *
 * Then run:
 *   npx tsx scripts/gmail-oauth-setup.ts
 *
 * The script will:
 *   1. Spin up a local server on :4399
 *   2. Print an authorization URL — open it, sign in as megha@reasonableautomations.com
 *   3. Google redirects to localhost:4399/callback with a code
 *   4. The script exchanges the code for a refresh token
 *   5. Prints GOOGLE_REFRESH_TOKEN=... to add to .env.local
 */

import http from "http";
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

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:4399/callback";
const SCOPE = "https://www.googleapis.com/auth/gmail.send";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    "Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in outreach_hub/.env.local first.",
  );
  console.error("\nTo create them:");
  console.error("  1. https://console.cloud.google.com/apis/credentials");
  console.error("  2. Create OAuth client ID → Web application");
  console.error(`  3. Authorized redirect URI: ${REDIRECT_URI}`);
  console.error("  4. Enable Gmail API in the same project");
  process.exit(1);
}

const authUrl =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent",
  }).toString();

const server = http.createServer(async (req, res) => {
  if (!req.url?.startsWith("/callback")) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }
  const url = new URL(req.url, "http://localhost:4399");
  const code = url.searchParams.get("code");
  const errParam = url.searchParams.get("error");
  if (errParam) {
    res.writeHead(400, { "Content-Type": "text/html" });
    res.end(`<h1>OAuth error</h1><pre>${errParam}</pre>`);
    console.error("OAuth error:", errParam);
    server.close();
    process.exit(1);
  }
  if (!code) {
    res.writeHead(400);
    res.end("Missing code");
    return;
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }).toString(),
    });
    const body = (await tokenRes.json()) as { refresh_token?: string; error?: string; error_description?: string };
    if (!tokenRes.ok || !body.refresh_token) {
      throw new Error(`Token exchange failed: ${body.error_description || JSON.stringify(body)}`);
    }

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(
      `<h1>OK</h1><p>Refresh token captured. Check your terminal and add it to .env.local.</p>`,
    );

    console.log("\n──────────────────────────────────────────────────────────────");
    console.log("Add this to outreach_hub/.env.local:");
    console.log("");
    console.log(`GOOGLE_REFRESH_TOKEN=${body.refresh_token}`);
    console.log("──────────────────────────────────────────────────────────────\n");
    server.close();
    process.exit(0);
  } catch (e) {
    res.writeHead(500);
    res.end((e as Error).message);
    console.error(e);
    server.close();
    process.exit(1);
  }
});

server.listen(4399, () => {
  console.log(`Listening on http://localhost:4399`);
  console.log(`\nOpen this URL in your browser:\n\n${authUrl}\n`);
});
