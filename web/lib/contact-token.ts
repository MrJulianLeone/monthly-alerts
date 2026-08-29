import { createHmac, timingSafeEqual } from "node:crypto";

// Signed render-time token for the public contact form: proves the submission
// came from a form we served, and when. Bots that POST instantly (or scripts
// replaying old tokens) are rejected; humans take longer than MIN_AGE to type
// a message. Signed with CRON_SECRET — no new env var needed.

const MIN_AGE_MS = 3_000;
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

function sign(ts: string): string {
  const secret = process.env.CRON_SECRET ?? "";
  return createHmac("sha256", secret).update(`contact:${ts}`).digest("hex");
}

export function issueContactToken(): string {
  const ts = Date.now().toString();
  return `${ts}.${sign(ts)}`;
}

export function verifyContactToken(token: string): boolean {
  const [ts, sig] = token.split(".");
  if (!ts || !sig) return false;
  const expected = sign(ts);
  const given = Buffer.from(sig, "utf8");
  const want = Buffer.from(expected, "utf8");
  if (given.length !== want.length || !timingSafeEqual(given, want)) return false;
  const age = Date.now() - Number(ts);
  return Number.isFinite(age) && age >= MIN_AGE_MS && age <= MAX_AGE_MS;
}
