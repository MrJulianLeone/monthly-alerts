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
        </p>
        <h1 className="display text-3xl mb-1">{subject}</h1>
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
  return (
    <div className={`sheet p-4 sm:p-5 ${outbound ? "ml-6 sm:ml-12 bg-stone-50" : "mr-6 sm:mr-12"}`}>
      <div className="flex items-baseline justify-between gap-4 mb-3">
        <p className="text-sm font-semibold">
          {outbound ? "You" : m.from_name || m.from_email}
          {!outbound && m.from_name && (
            <span className="font-normal text-ink-soft"> · {m.from_email}</span>
          )}
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
      {m.attachments.length > 0 && (
        <p className="microlabel mt-3">
          Attachments: {m.attachments.map((a) => a.filename ?? "unnamed").join(", ")} (view in
          the Resend dashboard)
        </p>
      )}
    </div>
  );
}
