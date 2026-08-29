import Link from "next/link";
import { LangToggle } from "@/components/lang-toggle";
import { Logo } from "@/components/logo";
import { getVisitorLang } from "@/lib/auth";
import { issueContactToken } from "@/lib/contact-token";
import { t } from "@/lib/i18n";
import { ContactForm } from "./contact-form";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const lang = await getVisitorLang();
  const token = issueContactToken();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b-[1.5px] border-line-strong bg-sheet">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <LangToggle current={lang} />
            <Link href="/login" className="btn btn-ghost btn-sm">
              {t(lang, "log_in")}
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-xl px-4 sm:px-6 py-12 flex-1">
        <h1 className="display text-5xl mb-3">{t(lang, "contact_title")}</h1>
        <p className="text-sm text-ink-soft mb-8">{t(lang, "contact_intro")}</p>
        <ContactForm
          token={token}
          labels={{
            name: t(lang, "contact_name"),
            email: t(lang, "contact_email"),
            subject: t(lang, "contact_subject"),
            message: t(lang, "contact_message"),
            send: t(lang, "contact_send"),
            sending: t(lang, "contact_sending"),
            sentTitle: t(lang, "contact_sent_title"),
            sentBody: t(lang, "contact_sent_body"),
            error: t(lang, "contact_error"),
          }}
        />
      </main>
    </div>
  );
}
