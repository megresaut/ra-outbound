import fs from "fs";
import path from "path";
import { sendGmail } from "../lib/gmail";

function loadEnvLocal() {
  const file = path.resolve(__dirname, "..", ".env.local");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadEnvLocal();

const TO = process.argv[2] ?? "meghashyamkrishnasamy@gmail.com";

async function main() {
  const result = await sendGmail({
    from: "Megha <megha@reasonableautomations.com>",
    to: TO,
    subject: "ra-outbound Gmail send test",
    body:
      "This is a test send from the ra-outbound Gmail integration.\n\n" +
      "If you got this, the OAuth refresh token + Gmail API are wired correctly.\n\n" +
      "— Megha",
  });
  console.log(`Sent. messageId=${result.id} threadId=${result.threadId}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
