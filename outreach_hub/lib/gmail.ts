// Gmail API sender using OAuth refresh token.

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Gmail not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN in .env.local (run scripts/gmail-oauth-setup.ts).",
    );
  }
  if (cachedAccessToken && Date.now() < cachedAccessToken.expiresAt - 60_000) {
    return cachedAccessToken.token;
  }
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }).toString(),
  });
  const body = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };
  if (!res.ok || !body.access_token) {
    throw new Error(
      `Gmail access token refresh failed: ${body.error_description || body.error || res.statusText}`,
    );
  }
  cachedAccessToken = {
    token: body.access_token,
    expiresAt: Date.now() + (body.expires_in ?? 3600) * 1000,
  };
  return body.access_token;
}

function buildRFC822(opts: {
  from: string;
  to: string;
  subject: string;
  body: string;
}): string {
  // Subject must be UTF-8 safe. Use RFC2047 if non-ASCII present.
  const isAscii = /^[\x00-\x7F]*$/.test(opts.subject);
  const subjectHeader = isAscii
    ? opts.subject
    : `=?UTF-8?B?${Buffer.from(opts.subject, "utf8").toString("base64")}?=`;

  const headers = [
    `From: ${opts.from}`,
    `To: ${opts.to}`,
    `Subject: ${subjectHeader}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 7bit",
  ].join("\r\n");

  return `${headers}\r\n\r\n${opts.body}`;
}

function base64UrlEncode(s: string): string {
  return Buffer.from(s, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function sendGmail(opts: {
  from: string;
  to: string;
  subject: string;
  body: string;
}): Promise<{ id: string; threadId: string }> {
  const token = await getAccessToken();
  const raw = base64UrlEncode(buildRFC822(opts));
  const res = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw }),
    },
  );
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Gmail send failed (${res.status}): ${text.slice(0, 500)}`);
  }
  const json = JSON.parse(text) as { id: string; threadId: string };
  return json;
}

export function isGmailConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN,
  );
}
