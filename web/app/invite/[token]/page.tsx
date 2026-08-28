import Link from "next/link";
import { Logo } from "@/components/logo";
import { findUserByEmail, getCurrentUser, hashToken } from "@/lib/auth";
import { sql } from "@/lib/db";
import { t, type Lang } from "@/lib/i18n";
import { translateOne } from "@/lib/translate";
import { AcceptInvite, InviteRegisterForm } from "./invite-client";

export const dynamic = "force-dynamic";

type InviteRow = {
  email: string;
  role: "editor" | "commenter";
  language: Lang;
  project_name: string;
  project_name_lang: Lang;
  inviter_name: string | null;
  inviter_email: string;
};

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const user = await getCurrentUser();

  const rows = (await sql()`
    SELECT i.email, i.role, i.language, p.name AS project_name, p.name_lang AS project_name_lang,
           u.name AS inviter_name, u.email AS inviter_email
    FROM invites i
    JOIN projects p ON p.id = i.project_id
    JOIN users u ON u.id = i.invited_by
    WHERE i.token_hash = ${hashToken(token)}
      AND i.accepted_at IS NULL AND i.expires_at > now()
  `) as InviteRow[];
  const invite = rows[0] ?? null;

  // Logged-out visitors see the page in the language the owner chose for them.
  const lang: Lang = user?.preferred_language ?? invite?.language ?? "en";

  const projectName = invite
    ? await translateOne(invite.project_name, invite.project_name_lang, lang)
    : null;

  // Does the invited address already have a usable (password + verified) account?
  const invitedUser = invite ? await findUserByEmail(invite.email) : null;
  const hasAccount = !!(invitedUser?.password_hash && invitedUser?.email_verified_at);

  return (
    <div className="min-h-screen grid-paper flex flex-col">
      <header className="border-b-[1.5px] border-line-strong bg-sheet">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center">
          <Logo />
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md sheet p-8 sm:p-10">
          {!invite ? (
            <>
              <h1 className="display text-4xl mb-3">{t(lang, "invite_title")}</h1>
              <p className="text-sm text-ink-soft leading-relaxed">{t(lang, "invite_invalid")}</p>
            </>
          ) : (
            <>
              <p className="microlabel mb-3">{t(lang, "app_name")}</p>
              <h1 className="display text-4xl mb-4">{t(lang, "invite_title")}</h1>
              <p className="text-[15px] text-ink-soft leading-relaxed mb-8">
                {t(lang, "invite_body", {
                  inviter: invite.inviter_name ?? invite.inviter_email,
                  project: projectName ?? invite.project_name,
                  role: t(
                    lang,
                    invite.role === "editor" ? "role_editor" : "role_commenter"
                  ).toLowerCase(),
                })}
              </p>
              {user ? (
                user.email === invite.email ? (
                  <AcceptInvite token={token} lang={lang} />
                ) : (
                  <p className="text-sm text-accent-deep border-[1.5px] border-accent-deep rounded-[2px] px-3 py-2">
                    {t(lang, "invite_wrong_account", {
                      email: invite.email,
                      current: user.email,
                    })}
                  </p>
                )
              ) : hasAccount ? (
                <>
                  <p className="text-sm text-ink-soft leading-relaxed mb-4">
                    {t(lang, "invite_log_in_to_accept")}
                  </p>
                  <Link
                    href={`/login?next=${encodeURIComponent(`/invite/${token}`)}`}
                    className="btn btn-primary w-full"
                  >
                    {t(lang, "log_in")}
                  </Link>
                </>
              ) : (
                <InviteRegisterForm token={token} email={invite.email} lang={lang} />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
