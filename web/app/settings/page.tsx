import { AppHeader } from "@/components/app-header";
import { appUrl } from "@/lib/email";
import { t } from "@/lib/i18n";
import { requireOnboardedUser } from "@/lib/page-auth";
import {
  PROJECT_PRICE_DISPLAY,
  REFERRAL_CREDIT_DISPLAY,
  referralsEnabled,
} from "@/lib/pricing";
import {
  creditBalanceCents,
  getReferralCode,
  listLedger,
  referralStats,
  suggestCode,
} from "@/lib/referrals";
import { ReferralCard } from "./referral-card";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { user, lang } = await requireOnboardedUser("/settings");

  // The referral card shows once the program is open, or earlier for anyone
  // who already holds credit (comped projects) so they can see the balance.
  const [code, balance, ledger] = await Promise.all([
    getReferralCode(user.id),
    creditBalanceCents(user.id),
    listLedger(user.id),
  ]);
  const showReferrals = referralsEnabled() || balance > 0 || ledger.length > 0;
  const stats = code ? await referralStats(code.code) : null;

  return (
    <div className="min-h-screen">
      <AppHeader lang={lang} user={user} />
      <main className="mx-auto max-w-xl px-4 sm:px-6 py-10">
        <p className="microlabel mb-2">{user.email}</p>
        <h1 className="display text-5xl mb-8">{t(lang, "settings_title")}</h1>
        <div className="sheet p-8">
          <SettingsForm
            initial={{
              name: user.name ?? "",
              company: user.company ?? "",
              phone: user.phone ?? "",
              preferred_language: user.preferred_language,
              email_opt_out: user.email_opt_out,
            }}
          />
        </div>
        {showReferrals && (
          <ReferralCard
            lang={lang}
            initialCode={code?.code ?? null}
            suggested={suggestCode(user)}
            siteUrl={appUrl()}
            stats={stats}
            balanceCents={balance}
            creditDisplay={REFERRAL_CREDIT_DISPLAY}
            priceDisplay={PROJECT_PRICE_DISPLAY}
            ledger={ledger}
          />
        )}
        <p className="microlabel mt-6">
          {t(lang, "settings_delete_account", { email: "support@monthlyalerts.com" })}
        </p>
      </main>
    </div>
  );
}
