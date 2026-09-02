import {
  createHash,
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { cookies, headers } from "next/headers";
import { sql } from "@/lib/db";
import { DEFAULT_LANG, isLang, type Lang } from "@/lib/i18n";

const SESSION_COOKIE = "ma_session";
const SESSION_DAYS = 365; // long-lived cookie keeps users signed in
const LANG_COOKIE = "ma_lang";
const EMAIL_TOKEN_MINUTES = 60; // verification / reset links

export const MIN_PASSWORD_LENGTH = 8;

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  phone: string | null;
  preferred_language: Lang;
  onboarded_at: string | null;
  email_opt_out: boolean;
};

// ---------------------------------------------------------------------------
// Passwords (scrypt, no native deps)
// ---------------------------------------------------------------------------

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  return timingSafeEqual(candidate, Buffer.from(hash, "hex"));
}

// ---------------------------------------------------------------------------
// Tokens
// ---------------------------------------------------------------------------

export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// ---------------------------------------------------------------------------
// One-time emailed tokens: email confirmation ('verify') and password reset
// ('reset'). Consuming one proves control of the email address.
// ---------------------------------------------------------------------------

export type TokenPurpose = "verify" | "reset";

export async function createEmailToken(
  email: string,
  purpose: TokenPurpose,
  redirect?: string | null
): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + EMAIL_TOKEN_MINUTES * 60 * 1000);
  await sql()`
    INSERT INTO login_tokens (email, purpose, token_hash, redirect, expires_at)
    VALUES (${email.trim().toLowerCase()}, ${purpose}, ${hashToken(token)},
            ${redirect ?? null}, ${expiresAt.toISOString()})
  `;
  return token;
}

/** Reads the email behind a still-valid token without consuming it. */
export async function peekEmailToken(token: string, purpose: TokenPurpose): Promise<string | null> {
  const rows = (await sql()`
    SELECT email
    FROM login_tokens
    WHERE token_hash = ${hashToken(token)}
      AND purpose = ${purpose}
      AND used_at IS NULL
      AND expires_at > now()
  `) as { email: string }[];
  return rows[0]?.email ?? null;
}

export async function consumeEmailToken(
  token: string,
  purpose: TokenPurpose
): Promise<{ email: string; redirect: string | null } | null> {
  const rows = (await sql()`
    UPDATE login_tokens
    SET used_at = now()
    WHERE token_hash = ${hashToken(token)}
      AND purpose = ${purpose}
      AND used_at IS NULL
      AND expires_at > now()
    RETURNING email, redirect
  `) as { email: string; redirect: string | null }[];
  return rows[0] ?? null;
}

// ---------------------------------------------------------------------------
// User lookup
// ---------------------------------------------------------------------------

export type AuthUser = SessionUser & {
  password_hash: string | null;
  email_verified_at: string | null;
};

export async function findUserByEmail(email: string): Promise<AuthUser | null> {
  const rows = (await sql()`
    SELECT id, email, name, company, phone, preferred_language,
           onboarded_at, email_opt_out, password_hash, email_verified_at
    FROM users
    WHERE email = ${email.trim().toLowerCase()} AND deleted_at IS NULL
  `) as AuthUser[];
  return rows[0] ?? null;
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

export async function createSession(
  userId: string,
  meta: { ip?: string | null; userAgent?: string | null } = {}
): Promise<{ token: string; expiresAt: Date }> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await sql()`
    INSERT INTO sessions (user_id, token_hash, ip, user_agent, expires_at)
    VALUES (${userId}, ${hashToken(token)}, ${meta.ip ?? null},
            ${meta.userAgent ?? null}, ${expiresAt.toISOString()})
  `;
  return { token, expiresAt };
}

export async function deleteSession(token: string): Promise<void> {
  await sql()`DELETE FROM sessions WHERE token_hash = ${hashToken(token)}`;
}

async function userForToken(token: string): Promise<SessionUser | null> {
  const rows = (await sql()`
    SELECT u.id, u.email, u.name, u.company, u.phone,
           u.preferred_language, u.onboarded_at, u.email_opt_out
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ${hashToken(token)}
      AND s.expires_at > now()
      AND u.deleted_at IS NULL
  `) as SessionUser[];
  return rows[0] ?? null;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return token ? userForToken(token) : null;
}

export async function setSessionCookie(token: string, expiresAt: Date) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) await deleteSession(token).catch(() => {});
  cookieStore.delete(SESSION_COOKIE);
}

/** Signs the user in: session row + cookie. */
export async function startSession(userId: string, userAgent?: string | null) {
  const session = await createSession(userId, {
    ip: await requestIp(),
    userAgent: userAgent ?? null,
  });
  await setSessionCookie(session.token, session.expiresAt);
}

// ---------------------------------------------------------------------------
// Language resolution: logged-in users get their stored preference; visitors
// get the ma_lang cookie (set by the language toggle) or the default.
// ---------------------------------------------------------------------------

export async function getVisitorLang(): Promise<Lang> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(LANG_COOKIE)?.value;
  return isLang(raw) ? raw : DEFAULT_LANG;
}

export async function resolveLang(user: SessionUser | null): Promise<Lang> {
  return user ? user.preferred_language : getVisitorLang();
}

// ---------------------------------------------------------------------------
// Unsubscribe links (signed with CRON_SECRET so the monthly email can carry a
// one-click opt-out without a session).
// ---------------------------------------------------------------------------

export function unsubscribeSignature(userId: string): string {
  const secret = process.env.CRON_SECRET ?? "dev-secret";
  return createHmac("sha256", secret).update(`unsubscribe:${userId}`).digest("hex");
}

export async function requestIp(): Promise<string | null> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  return fwd ? fwd.split(",")[0].trim() : h.get("x-real-ip");
}
