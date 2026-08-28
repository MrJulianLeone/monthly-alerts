import { NextResponse } from "next/server";
import {
  consumeLoginToken,
  createSession,
  findOrCreateUser,
  getVisitorLang,
  requestIp,
  setSessionCookie,
} from "@/lib/auth";
import { appUrl } from "@/lib/email";

/**
 * Magic-link landing. Consumes the one-time token, creates (or revives) the
 * user — which is also the email confirmation — starts a session, and routes
 * first-time users through onboarding before anything else.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";
  const login = token ? await consumeLoginToken(token) : null;

  if (!login) {
    return NextResponse.redirect(`${appUrl()}/login?error=invalid`);
  }

  const lang = await getVisitorLang();
  const user = await findOrCreateUser(login.email, lang);
  const session = await createSession(user.id, {
    ip: await requestIp(),
    userAgent: request.headers.get("user-agent"),
  });
  await setSessionCookie(session.token, session.expiresAt);

  const next = login.redirect ?? "/dashboard";
  const dest = user.onboarded_at
    ? next
    : `/welcome?next=${encodeURIComponent(next)}`;
  return NextResponse.redirect(`${appUrl()}${dest}`);
}
