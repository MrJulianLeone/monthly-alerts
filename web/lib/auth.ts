import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { sql } from "@/lib/db";
import { effectiveRole } from "@/lib/admin";

const SESSION_COOKIE = "ma_session";
const SESSION_DAYS = 365;

const USER_COOKIE = "ma_user";
const USER_COOKIE_DAYS = 365;

export type SessionUser = {
  id: string;
  email: string;
  role: "user" | "parent" | "admin";
  parent_id: string | null;
  date_of_birth: string | null;
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
// Tokens & sessions (shared by web cookies and mobile bearer tokens)
// ---------------------------------------------------------------------------

export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

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
    SELECT u.id, u.email, u.role, u.parent_id, u.date_of_birth
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ${hashToken(token)}
      AND s.expires_at > now()
      AND u.deleted_at IS NULL
  `) as SessionUser[];
  if (rows.length === 0) return null;
  // Touch activity timestamps (best-effort, drives leaderboard activity).
  sql()`
    UPDATE users SET last_active_at = now() WHERE id = ${rows[0].id}
  `.catch(() => {});
  // Enforce the single-admin policy regardless of what the database says,
  // and converge the stored role when it disagrees (best-effort).
  const role = effectiveRole(rows[0].email, rows[0].role);
  if (role !== rows[0].role) {
    sql()`UPDATE users SET role = ${role} WHERE id = ${rows[0].id}`.catch(() => {});
  }
  return { ...rows[0], role };
}

/** Resolves the current user from a bearer token (mobile) or cookie (web). */
export async function getCurrentUser(
  request?: Request
): Promise<SessionUser | null> {
  const bearer = request?.headers.get("authorization");
  if (bearer?.startsWith("Bearer ")) {
    return userForToken(bearer.slice(7));
  }
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
  cookieStore.delete(USER_COOKIE);
}

// ---------------------------------------------------------------------------
// Remembered-user cookie (username + status, long-lived)
// ---------------------------------------------------------------------------

export type RememberedUser = { name: string; status: string };

/**
 * Long-lived cookie remembering who is signed in (username + account status/
 * role). Set at every login/signup and cleared only on logout, so returning
 * visitors are sent straight to their app.
 */
export async function setUserCookie(name: string, status: string) {
  const cookieStore = await cookies();
  cookieStore.set(USER_COOKIE, JSON.stringify({ name, status }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(Date.now() + USER_COOKIE_DAYS * 24 * 60 * 60 * 1000),
  });
}

export async function getRememberedUser(): Promise<RememberedUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(USER_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed?.name !== "string" || typeof parsed?.status !== "string") return null;
    return { name: parsed.name, status: parsed.status };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Request context helpers
// ---------------------------------------------------------------------------

export async function requestIp(): Promise<string | null> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  return fwd ? fwd.split(",")[0].trim() : h.get("x-real-ip");
}

export function ageFromDob(dob: string | Date): number {
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}
