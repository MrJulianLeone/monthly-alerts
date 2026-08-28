import Link from "next/link";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { billingEnabled, createProjectFromSession, stripe } from "@/lib/billing";
import { t } from "@/lib/i18n";
import { requireOnboardedUser } from "@/lib/page-auth";

export const dynamic = "force-dynamic";

/**
 * Stripe Checkout success landing. The webhook normally creates the project;
 * this page verifies the session directly and creates it if the webhook
 * hasn't arrived yet (createProjectFromSession is idempotent).
 */
export default async function ActivatedPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { user, lang } = await requireOnboardedUser("/projects/activated");
  const { session_id } = await searchParams;
  if (!billingEnabled() || !session_id) redirect("/dashboard");

  let projectId: string | null = null;
  try {
    const session = await stripe().checkout.sessions.retrieve(session_id);
    if (session.payment_status === "paid" && session.metadata?.user_id === user.id) {
      projectId = await createProjectFromSession(session);
    }
  } catch {
    // fall through to the generic success screen
  }

  return (
    <div className="min-h-screen">
      <AppHeader lang={lang} userName={user.name} />
      <main className="mx-auto max-w-xl px-4 sm:px-6 py-20 text-center">
        <h1 className="display text-5xl mb-4">{t(lang, "billing_success_title")}</h1>
        <p className="text-sm text-ink-soft mb-8">{t(lang, "billing_success_body")}</p>
        <Link
          href={projectId ? `/projects/${projectId}` : "/dashboard"}
          className="btn btn-primary"
        >
          {t(lang, "email_monthly_open_project")}
        </Link>
      </main>
    </div>
  );
}
