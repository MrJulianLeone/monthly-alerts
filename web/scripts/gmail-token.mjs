#!/usr/bin/env node
// One-time helper: mints the Gmail refresh token for the outreach mailbox.
// Run locally (needs a browser):
//
//   OUTREACH_GOOGLE_CLIENT_ID=... OUTREACH_GOOGLE_CLIENT_SECRET=... \
//     node scripts/gmail-token.mjs
//
// Prerequisites (full walkthrough at /admin/prospects/setup):
//   - A Google Cloud project with the Gmail API enabled
//   - An OAuth consent screen set to "Internal" (Workspace org)
//   - An OAuth client of type "Web application" with redirect URI
//     http://localhost:8765/callback
//
// The script opens a consent URL; approve it AS THE OUTREACH MAILBOX
// (e.g. julian@getmonthlyalerts.com), then copy the printed refresh token
// into Vercel as OUTREACH_GOOGLE_REFRESH_TOKEN.

import { createServer } from "node:http";

const clientId = process.env.OUTREACH_GOOGLE_CLIENT_ID;
const clientSecret = process.env.OUTREACH_GOOGLE_CLIENT_SECRET;
if (!clientId || !clientSecret) {
  console.error(
    "Set OUTREACH_GOOGLE_CLIENT_ID and OUTREACH_GOOGLE_CLIENT_SECRET env vars first."
  );
  process.exit(1);
}

const REDIRECT = "http://localhost:8765/callback";
const SCOPES = [
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.modify",
].join(" ");

const authUrl =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    client_id: clientId,
    redirect_uri: REDIRECT,
    response_type: "code",
    scope: SCOPES,
    access_type: "offline",
    prompt: "consent",
  }).toString();

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost:8765");
  if (url.pathname !== "/callback") {
    res.writeHead(404).end();
    return;
  }
  const code = url.searchParams.get("code");
  if (!code) {
    res.writeHead(400).end("Missing ?code — try again.");
    return;
  }
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: REDIRECT,
        grant_type: "authorization_code",
      }),
    });
    const data = await tokenRes.json();
    if (!data.refresh_token) {
      throw new Error(`No refresh_token in response: ${JSON.stringify(data)}`);
    }
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Done — refresh token printed in your terminal. You can close this tab.");
    console.log("\nAdd these to Vercel (Project → Settings → Environment Variables):\n");
    console.log(`OUTREACH_GOOGLE_CLIENT_ID=${clientId}`);
    console.log(`OUTREACH_GOOGLE_CLIENT_SECRET=${clientSecret}`);
    console.log(`OUTREACH_GOOGLE_REFRESH_TOKEN=${data.refresh_token}\n`);
  } catch (err) {
    res.writeHead(500).end(String(err));
    console.error(err);
  } finally {
    server.close();
  }
});

server.listen(8765, () => {
  console.log("\n1. Open this URL in a browser:\n");
  console.log(authUrl);
  console.log(
    "\n2. Sign in as the OUTREACH mailbox (not your personal account) and approve.\n" +
      "3. The refresh token will be printed here.\n"
  );
});
