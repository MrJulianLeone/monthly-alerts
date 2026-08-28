import Link from "next/link";
import { redirect } from "next/navigation";
import { LangToggle } from "@/components/lang-toggle";
import { Logo } from "@/components/logo";
import { getCurrentUser, getVisitorLang } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { AuthForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  const lang = await getVisitorLang();
  const params = await searchParams;
  const next =
    params.next && params.next.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : null;

  return (
    <div className="min-h-screen grid-paper flex flex-col">
      <header className="border-b-[1.5px] border-line-strong bg-sheet">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <Logo />
          <LangToggle current={lang} />
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="sheet p-8 sm:p-10">
            {params.error === "invalid" && (
              <p className="text-sm text-accent-deep border-[1.5px] border-accent-deep rounded-[2px] px-3 py-2 mb-6">
                {t(lang, "login_invalid_link")}
              </p>
            )}
            <AuthForm lang={lang} next={next} />
          </div>
          <p className="microlabel text-center mt-6">
            <Link href="/" className="hover:text-ink transition-colors">
              ← {t(lang, "back")}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
