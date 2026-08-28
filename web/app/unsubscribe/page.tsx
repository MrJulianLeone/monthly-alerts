import { Logo } from "@/components/logo";
import { getVisitorLang } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { UnsubscribeConfirm } from "./unsubscribe-client";

/**
 * Landing for the signed unsubscribe link in monthly emails. A confirm click
 * (not the page load) performs the opt-out, so email-client link prefetchers
 * can't unsubscribe people by accident.
 */
export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ u?: string; s?: string }>;
}) {
  const lang = await getVisitorLang();
  const params = await searchParams;

  return (
    <div className="min-h-screen grid-paper flex flex-col">
      <header className="border-b-[1.5px] border-line-strong bg-sheet">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center">
          <Logo />
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md sheet p-8 sm:p-10 text-center">
          <UnsubscribeConfirm u={params.u ?? ""} s={params.s ?? ""} lang={lang} />
        </div>
      </main>
    </div>
  );
}
