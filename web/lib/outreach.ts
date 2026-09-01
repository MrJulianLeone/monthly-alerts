// Gmail adapter for the prospecting pipeline. Outreach mail goes through a
// dedicated Google Workspace mailbox on a separate domain (see
// /admin/prospects/setup), NEVER through Resend — cold outreach must not be
// able to touch transactional deliverability. Uses the Gmail REST API
// directly via fetch (OAuth refresh-token flow), so no SDK dependency.

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const GMAIL = "https://gmail.googleapis.com/gmail/v1/users/me";

export function outreachConfigured(): boolean {
  return Boolean(
    process.env.OUTREACH_GOOGLE_CLIENT_ID &&
      process.env.OUTREACH_GOOGLE_CLIENT_SECRET &&
      process.env.OUTREACH_GOOGLE_REFRESH_TOKEN
  );
}

let cachedToken: { token: string; expires: number } | null = null;

async function accessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expires - 60_000) return cachedToken.token;
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.OUTREACH_GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.OUTREACH_GOOGLE_CLIENT_SECRET ?? "",
      refresh_token: process.env.OUTREACH_GOOGLE_REFRESH_TOKEN ?? "",
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    throw new Error(`Gmail token refresh failed (${res.status}): ${await res.text()}`);
  }
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { token: data.access_token, expires: Date.now() + data.expires_in * 1000 };
  return cachedToken.token;
}

async function gmail<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await accessToken();
  const res = await fetch(`${GMAIL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) throw new Error(`Gmail API ${path} failed (${res.status}): ${await res.text()}`);
  return (await res.json()) as T;
}

/** The connected mailbox address — also the outreach From address. */
export async function outreachProfile(): Promise<{ emailAddress: string }> {
  return gmail<{ emailAddress: string }>("/profile");
}

function b64url(s: string): string {
  return Buffer.from(s).toString("base64url");
}

/** RFC 2047-encode a display name when it needs it. */
function encodeName(name: string): string {
  return /^[\x20-\x7e]*$/.test(name) ? `"${name.replace(/"/g, "")}"` : `=?UTF-8?B?${Buffer.from(name).toString("base64")}?=`;
}

export type OutreachSent = {
  gmailMessageId: string;
  gmailThreadId: string;
  messageIdHeader: string | null;
};

/**
 * Sends a plain-text email from the outreach mailbox. Pass threadId +
 * inReplyTo (the prior message's Message-ID header) to keep follow-ups in
 * the same Gmail thread for both sides.
 */
export async function outreachSend(opts: {
  to: string;
  subject: string;
  text: string;
  fromName?: string;
  threadId?: string;
  inReplyTo?: string;
  listUnsubscribeUrl?: string;
}): Promise<OutreachSent> {
  const profile = await outreachProfile();
  const from = opts.fromName
    ? `${encodeName(opts.fromName)} <${profile.emailAddress}>`
    : profile.emailAddress;

  const headers = [
    `From: ${from}`,
    `To: ${opts.to}`,
    `Subject: =?UTF-8?B?${Buffer.from(opts.subject).toString("base64")}?=`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
  ];
  if (opts.inReplyTo) {
    headers.push(`In-Reply-To: ${opts.inReplyTo}`, `References: ${opts.inReplyTo}`);
  }
  if (opts.listUnsubscribeUrl) {
    headers.push(`List-Unsubscribe: <${opts.listUnsubscribeUrl}>`);
  }
  const raw = `${headers.join("\r\n")}\r\n\r\n${Buffer.from(opts.text).toString("base64")}`;

  const sent = await gmail<{ id: string; threadId: string }>("/messages/send", {
    method: "POST",
    body: JSON.stringify({ raw: b64url(raw), threadId: opts.threadId }),
  });

  // Fetch the stored copy to learn the Message-ID Gmail assigned — needed so
  // the follow-up can thread onto this send.
  let messageIdHeader: string | null = null;
  try {
    const full = await gmail<GmailMessage>(
      `/messages/${sent.id}?format=metadata&metadataHeaders=Message-ID`
    );
    messageIdHeader = header(full, "Message-ID");
  } catch {
    // Non-fatal: the follow-up falls back to threadId-only threading.
  }
  return { gmailMessageId: sent.id, gmailThreadId: sent.threadId, messageIdHeader };
}

export type GmailMessage = {
  id: string;
  threadId: string;
  internalDate?: string;
  payload?: GmailPart;
};

type GmailPart = {
  mimeType?: string;
  headers?: { name: string; value: string }[];
  body?: { data?: string; size?: number };
  parts?: GmailPart[];
};

export function header(msg: GmailMessage, name: string): string | null {
  const h = msg.payload?.headers?.find((x) => x.name.toLowerCase() === name.toLowerCase());
  return h?.value ?? null;
}

/** Extracts the best-effort plain-text body from a Gmail payload tree. */
export function textBody(msg: GmailMessage): string {
  const collect = (part: GmailPart | undefined, want: string): string | null => {
    if (!part) return null;
    if (part.mimeType?.startsWith(want) && part.body?.data) {
      return Buffer.from(part.body.data, "base64url").toString("utf8");
    }
    for (const p of part.parts ?? []) {
      const found = collect(p, want);
      if (found) return found;
    }
    return null;
  };
  const plain = collect(msg.payload, "text/plain");
  if (plain) return plain;
  const html = collect(msg.payload, "text/html");
  if (html) {
    return html
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\s+/g, " ")
      .trim();
  }
  return "";
}

/**
 * Lists inbox messages received after the given time (full payloads).
 * Includes bounces (mailer-daemon DSNs land in the inbox too).
 */
export async function outreachListInbox(after: Date, max = 40): Promise<GmailMessage[]> {
  const afterSec = Math.floor(after.getTime() / 1000);
  const q = encodeURIComponent(`in:inbox after:${afterSec}`);
  const list = await gmail<{ messages?: { id: string }[] }>(
    `/messages?q=${q}&maxResults=${max}`
  );
  const out: GmailMessage[] = [];
  for (const m of list.messages ?? []) {
    out.push(await gmail<GmailMessage>(`/messages/${m.id}?format=full`));
  }
  return out;
}
