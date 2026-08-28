import { NextResponse } from "next/server";
import { createLoginToken } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { sendMagicLinkEmail } from "@/lib/email";
import { isLang, DEFAULT_LANG } from "@/lib/i18n";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const lang = isLang(body.lang) ? body.lang : DEFAULT_LANG;
  // Only allow same-site relative redirects (e.g. back to an invite page).
  const redirect =
    typeof body.redirect === "string" && body.redirect.startsWith("/") && !body.redirect.startsWith("//")
      ? body.redirect
      : null;

  if (!EMAIL_RE.test(email)) return jsonError("Invalid email", 400);

  const token = await createLoginToken(email, redirect);
  await sendMagicLinkEmail(email, token, lang);
  return NextResponse.json({ ok: true });
}
