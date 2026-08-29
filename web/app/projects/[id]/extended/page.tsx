import Link from "next/link";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { applyExtensionFromSession, extensionsEnabled, stripe } from "@/lib/billing";
import { t } from "@/lib/i18n";
import { requireOnboardedUser } from "@/lib/page-auth";
import { getProject, projectExpiresAt } from "@/lib/projects";

export const dynamic = "force-dynamic";

/**
 * Extension Checkout success landing. The webhook normally applies the
 * extension; this page verifies the session and applies it if the webhook
 * hasn't arrived yet (applyExtensionFromSession is idempotent).
 */
export default async function ExtendedPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { id } = await params;
  const { user, lang } = await requireOnboardedUser(`/projects/${id}/settings`);
  const { session_id } = await searchParams;
  if (!extensionsEnabled() || !session_id) redirect(`/projects/${id}/settings`);

  try {
    const session = await stripe().checkout.sessions.retrieve(session_id);
    if (
      session.payment_status === "paid" &&
      session.metadata?.extend_project_id === id &&
      session.metadata?.user_id === user.id
    ) {
      await applyExtensionFromSession(session);
    }
  } catch {
    // fall through to the generic success screen
  }

  const project = await getProject(id);
  const date = project
    ? new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(projectExpiresAt(project))
    : null;

  return (
    <div className="min-h-screen">
      <AppHeader lang={lang} user={user} />
      <main className="mx-auto max-w-xl px-4 sm:px-6 py-20 text-center">
        <h1 className="display text-5xl mb-4">{t(lang, "extend_success_title")}</h1>
        <p className="text-sm text-ink-soft mb-8">
          {date
            ? t(lang, "extend_success_body", { date })
            : t(lang, "billing_success_body")}
        </p>
        <Link href={`/projects/${id}`} className="btn btn-primary">
          {t(lang, "email_monthly_open_project")}
        </Link>
      </main>
    </div>
  );
}
