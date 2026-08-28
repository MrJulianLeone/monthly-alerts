import { NextResponse } from "next/server";
import { createEmailToken, findUserByEmail } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";
import { DEFAULT_LANG, isLang } from "@/lib/i18n";

/**
 * Password reset request. Always answers ok so the endpoint can't be used to
 * probe which emails have accounts. Also the upgrade path for magic-link-era
 * accounts that never had a password.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const lang = isLang(body.lang) ? body.lang : DEFAULT_LANG;

  if (email) {
    const user = await findUserByEmail(email);
    if (user) {
      const token = await createEmailToken(email, "reset");
      await sendPasswordResetEmail(email, token, user.preferred_language ?? lang).catch(
        (err) => console.error("reset email failed:", err)
      );
    }
  }
  return NextResponse.json({ ok: true });
}
