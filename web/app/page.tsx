import Link from "next/link";
import { redirect } from "next/navigation";
import { LangToggle } from "@/components/lang-toggle";
import { Logo, LogoMark } from "@/components/logo";
import { getCurrentUser, getVisitorLang } from "@/lib/auth";
import { t } from "@/lib/i18n";

export default async function LandingPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  const lang = await getVisitorLang();

  const features = [
    { title: t(lang, "landing_feature_1_title"), body: t(lang, "landing_feature_1_body") },
    { title: t(lang, "landing_feature_2_title"), body: t(lang, "landing_feature_2_body") },
    { title: t(lang, "landing_feature_3_title"), body: t(lang, "landing_feature_3_body") },
  ];

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

      <main className="flex-1">
        <section className="grid-paper border-b-[1.5px] border-line-strong">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 py-20 sm:py-28">
            <p className="microlabel mb-6">EN ⇄ IT — {t(lang, "app_name")}</p>
            <h1 className="display text-5xl sm:text-7xl max-w-3xl mb-6">
              {t(lang, "landing_tagline")}
            </h1>
            <p className="text-lg text-ink-soft max-w-xl mb-10 leading-relaxed">
              {t(lang, "landing_sub")}
            </p>
            <Link href="/login" className="btn btn-primary text-base px-8 py-3">
              {t(lang, "landing_cta")}
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
          <div className="grid sm:grid-cols-3 gap-px bg-line-strong border-[1.5px] border-line-strong">
            {features.map((f, i) => (
              <div key={f.title} className="bg-sheet p-8">
                <p className="microlabel mb-4">{String(i + 1).padStart(2, "0")}</p>
                <h2 className="display text-2xl mb-3">{f.title}</h2>
                <p className="text-sm text-ink-soft leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t-[1.5px] border-line-strong">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoMark size={14} />
            <span className="microlabel">{t(lang, "email_footer")}</span>
          </div>
          <span className="microlabel">© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
