"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { track } from "@/lib/analytics";
import { t, type Lang } from "@/lib/i18n";

/**
 * Owner-only draft banner: what a draft can and can't do, days left, and the
 * activate button (credits if they cover the fee, otherwise Stripe Checkout).
 */
export function ActivateBanner({
  projectId,
  daysLeft,
  price,
  creditBalance,
  creditCovers,
  lang,
}: {
  projectId: string;
  daysLeft: number;
  price: string;
  creditBalance: string | null;
  creditCovers: boolean;
  lang: Lang;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="no-print sheet border-accent p-5 sm:p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="microlabel text-accent mb-1">
            {t(lang, "draft_banner_title", { days: daysLeft })}
          </p>
          <p className="text-sm text-ink-soft leading-relaxed max-w-xl">
            {t(lang, "draft_banner_body", { price })}
          </p>
          {creditCovers && creditBalance && (
            <p className="text-sm font-medium mt-2">
              {t(lang, "draft_credit_covers", { balance: creditBalance })}
            </p>
          )}
          <p className="microlabel mt-2">
            <Link href={`/projects/${projectId}/report`} className="underline hover:text-ink">
              {t(lang, "report_preview_link")}
            </Link>
          </p>
        </div>
        <div className="shrink-0">
          <button
            disabled={busy}
            className="btn btn-primary"
            onClick={async () => {
              setBusy(true);
              setError(false);
              track("checkout_started", { credit: creditCovers });
              const res = await fetch(`/api/projects/${projectId}/activate`, { method: "POST" })
                .then((r) => r.json().then((data) => ({ ok: r.ok, data })))
                .catch(() => ({ ok: false, data: {} as Record<string, unknown> }));
              if (res.ok && res.data.checkout_url) {
                window.location.href = res.data.checkout_url as string;
                return;
              }
              if (res.ok && res.data.activated) {
                router.push(`/projects/activated?project=${projectId}`);
                router.refresh();
                return;
              }
              setBusy(false);
              setError(true);
            }}
          >
            {creditCovers
              ? t(lang, "draft_activate_credit")
              : t(lang, "draft_activate", { price })}
          </button>
          {error && <p className="microlabel text-red-700 mt-2">{t(lang, "error_generic")}</p>}
        </div>
      </div>
    </div>
  );
}
