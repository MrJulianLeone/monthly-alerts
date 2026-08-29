import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { isAdmin } from "@/lib/admin";
import { requireOnboardedUser } from "@/lib/page-auth";
import {
  getThreadMessages,
  markThreadRead,
  supportAddress,
  type SupportMessage,
} from "@/lib/support";
import { Composer } from "../composer";
import { ThreadActions } from "../thread-actions";

export const dynamic = "force-dynamic";

// One support conversation. Viewing it marks its inbound messages read.

export default async function ThreadPage(props: {
  params: Promise<{ thread: string }>;
}) {
  const { user } = await requireOnboardedUser("/admin/inbox");
  if (!isAdmin(user)) notFound();

  const { thread } = await props.params;
  const threadKey = decodeURIComponent(thread);
  const messages = await getThreadMessages(threadKey);
  if (messages.length === 0) notFound();
  await markThreadRead(threadKey);

  const counterparty = messages[0].counterparty_email;
  const folder = messages[messages.length - 1].folder;
  const subject = messages.find((m) => m.subject)?.subject ?? "(no subject)";
  const replySubject = /^re\s*:/i.test(subject) ? subject : `Re: ${subject}`;
  const fmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="min-h-screen">
      <AppHeader lang={user.preferred_language} user={user} />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
        <p className="microlabel mb-2">
          <Link href="/admin" className="hover:text-accent-deep">Site administration</Link>
          {" / "}
          <Link href="/admin/inbox" className="hover:text-accent-deep">Inbox</Link>
          {folder === "spam" && (
            <>
              {" / "}
              <Link href="/admin/inbox?folder=spam" className="hover:text-accent-deep">Spam</Link>
            </>
          )}
        </p>
        <div className="flex items-start justify-between gap-4 mb-1">
          <h1 className="display text-3xl">{subject}</h1>
          <ThreadActions threadKey={threadKey} folder={folder} />
        </div>
        <p className="text-sm text-ink-soft mb-8">{counterparty}</p>

        <div className="space-y-4 mb-8">
          {messages.map((m) => (
            <MessageCard key={m.id} message={m} fmt={fmt} />
          ))}
        </div>

        <Composer
          threadKey={threadKey}
          to={counterparty}
          subject={replySubject}
          from={supportAddress()}
        />
      </main>
    </div>
  );
}

function MessageCard({
  message: m,
  fmt,
}: {
  message: SupportMessage;
  fmt: Intl.DateTimeFormat;
}) {
  const outbound = m.direction === "outbound";
  const toAdmin = outbound && m.to_email !== m.counterparty_email;
  const verdictChip =
    m.direction === "inbound" && m.ai_verdict
      ? { spam: "AI: spam", responded: "AI: auto-replied", needs_info: "AI: needs you", skipped: "AI: skipped" }[
          m.ai_verdict
        ]
      : null;
  return (
    <div className={`sheet p-4 sm:p-5 ${outbound ? "ml-6 sm:ml-12 bg-stone-50" : "mr-6 sm:mr-12"}`}>
      <div className="flex items-baseline justify-between gap-4 mb-3">
        <p className="text-sm font-semibold">
          {outbound ? (m.auto ? "Autoresponder" : "You") : m.from_name || m.from_email}
          {!outbound && m.from_name && (
            <span className="font-normal text-ink-soft"> · {m.from_email}</span>
          )}
          {toAdmin && <span className="font-normal text-ink-soft"> → {m.to_email}</span>}
          {verdictChip && <span className="chip text-ink-faint ml-2">{verdictChip}</span>}
        </p>
        <p className="microlabel shrink-0">{fmt.format(new Date(m.created_at))}</p>
      </div>
      {m.text_body ? (
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{m.text_body}</p>
      ) : m.html_body ? (
        // Untrusted sender HTML: render only inside a fully sandboxed iframe
        // (no scripts, no same-origin access).
        <iframe
          sandbox=""
          srcDoc={m.html_body}
          className="w-full min-h-64 border border-line bg-white"
          title="Email content"
        />
      ) : (
        <p className="text-sm text-ink-faint">(empty message)</p>
      )}
      {m.direction === "inbound" && m.ai_note && (
        <p className="microlabel mt-3">AI: {m.ai_note}</p>
      )}
      {m.attachments.length > 0 && (
        <p className="microlabel mt-3">
          Attachments: {m.attachments.map((a) => a.filename ?? "unnamed").join(", ")} (view in
          the Resend dashboard)
        </p>
      )}
    </div>
  );
}
