import Link from "next/link";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { TrackEvent } from "@/components/track-event";
import {
  activateProjectFromSession,
  billingEnabled,
  createProjectFromSession,
  stripe,
} from "@/lib/billing";
import { t } from "@/lib/i18n";
import { requireOnboardedUser } from "@/lib/page-auth";

export const dynamic = "force-dynamic";

/**
 * Stripe Checkout success landing. The webhook normally activates the
 * project; this page verifies the session directly and activates it if the
 * webhook hasn't arrived yet (both helpers are idempotent).
 */
export default async function ActivatedPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; project?: string }>;
}) {
  const { user, lang } = await requireOnboardedUser("/projects/activated");
  const { session_id, project } = await searchParams;
  if (!billingEnabled()) redirect("/dashboard");

  let projectId: string | null = project ?? null;
  let source = "credit";
  if (session_id) {
    source = "stripe";
    try {
      const session = await stripe().checkout.sessions.retrieve(session_id);
      if (session.payment_status === "paid" && session.metadata?.user_id === user.id) {
        projectId = session.metadata?.activate_project_id
          ? await activateProjectFromSession(session)
          : await createProjectFromSession(session);
      }
    } catch {
      // fall through to the generic success screen
    }
  } else if (!projectId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen">
      <AppHeader lang={lang} user={user} />
      <TrackEvent event="project_activated" props={{ source }} />
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
