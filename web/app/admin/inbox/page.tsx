import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { isAdmin } from "@/lib/admin";
import { requireOnboardedUser } from "@/lib/page-auth";
import { listThreads, supportAddress } from "@/lib/support";
import { Composer } from "./composer";

export const dynamic = "force-dynamic";

// Admin-only support inbox; not localized.

export default async function InboxPage(props: {
  searchParams: Promise<{ compose?: string }>;
}) {
  const { user } = await requireOnboardedUser("/admin/inbox");
  if (!isAdmin(user)) notFound();

  const [threads, { compose }] = await Promise.all([listThreads(), props.searchParams]);
  const unread = threads.reduce((sum, t) => sum + t.unread_count, 0);
  const fmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="min-h-screen">
      <AppHeader lang={user.preferred_language} user={user} />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <p className="microlabel mb-2">
          <Link href="/admin" className="hover:text-accent-deep">Site administration</Link>
          {" / "}{supportAddress()}
        </p>
        <div className="flex items-end justify-between gap-4 mb-8">
          <h1 className="display text-5xl">
            Inbox{unread > 0 && <span className="text-accent-deep"> {unread}</span>}
          </h1>
          <Link
            href={compose ? "/admin/inbox" : "/admin/inbox?compose=1"}
            className="btn btn-ghost btn-sm"
          >
            {compose ? "Close" : "New message"}
          </Link>
        </div>

        {compose && (
          <div className="mb-8">
            <Composer from={supportAddress()} />
          </div>
        )}

        {threads.length === 0 ? (
          <p className="text-sm text-ink-faint">
            No messages yet. Mail sent to {supportAddress()} will appear here.
          </p>
        ) : (
          <div className="divide-y divide-line border-y-[1.5px] border-line-strong">
            {threads.map((t) => (
              <Link
                key={t.thread_key}
                href={`/admin/inbox/${encodeURIComponent(t.thread_key)}`}
                className="block py-3 hover:bg-sheet px-2 -mx-2"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <p className={`text-sm truncate ${t.unread_count > 0 ? "font-semibold" : "font-medium"}`}>
                    {t.counterparty_email}
                    {t.unread_count > 0 && (
                      <span className="chip text-accent-deep ml-2">{t.unread_count} new</span>
                    )}
                  </p>
                  <p className="microlabel shrink-0">{fmt.format(new Date(t.last_at))}</p>
                </div>
                <p className="text-sm text-ink-soft truncate mt-0.5">
                  {t.subject || "(no subject)"}
                  <span className="text-ink-faint">
                    {" — "}
                    {t.last_direction === "outbound" ? "You: " : ""}
                    {t.last_preview || "…"}
                  </span>
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
