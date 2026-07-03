import Link from "next/link";
import Image from "next/image";
import { sql } from "@/lib/db";
import { requirePageUser } from "@/lib/page-auth";
import { Card } from "@/components/ui";

export const metadata = { title: "Coach chat — MonthlyAlerts" };
export const dynamic = "force-dynamic";

type Message = {
  id: string;
  sender: "coach" | "user";
  kind: string;
  content: string | null;
  metadata: { photo_url?: string; challenge_id?: string } | null;
  created_at: string;
};

export default async function ChatPage() {
  const user = await requirePageUser();

  const [profileRows, messageRows, challengeRows] = await Promise.all([
    sql()`SELECT display_name FROM profiles WHERE user_id = ${user.id}`,
    sql()`
      SELECT id, sender, kind, content, metadata, created_at
      FROM chat_messages
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC LIMIT 100`,
    sql()`
      SELECT c.id, c.target_value, c.sequence_number, e.name, e.unit
      FROM challenges c JOIN exercises e ON e.id = c.exercise_id
      WHERE c.user_id = ${user.id} AND c.status = 'active'
      ORDER BY c.sequence_number DESC LIMIT 1`,
  ]);

  const profile = (profileRows as { display_name: string }[])[0];
  const challenge = (challengeRows as {
    target_value: number;
    sequence_number: number;
    name: string;
    unit: string;
  }[])[0];
  // Query returns newest-first for the LIMIT; display oldest-first.
  const messages = (messageRows as Message[]).slice().reverse();

  if (!profile) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-12">
        <Card>
          <h1 className="text-xl font-semibold text-neutral-900">No coach yet</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Your coach chat starts once you have a coaching profile.
          </p>
          <Link
            href="/enroll"
            className="mt-4 inline-block rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700"
          >
            Start my coaching
          </Link>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-2xl flex-col px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Your Coach</h1>
          {challenge && (
            <p className="mt-1 text-sm text-neutral-500">
              Challenge #{challenge.sequence_number}: {challenge.name} — {challenge.target_value}{" "}
              {challenge.unit === "seconds" ? "sec" : "reps"}
            </p>
          )}
        </div>
        <Link
          href="/me"
          className="rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
        >
          &larr; Dashboard
        </Link>
      </div>

      <div className="flex-1 space-y-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
        {messages.length === 0 ? (
          <p className="py-12 text-center text-sm text-neutral-500">
            No messages yet — your coach will kick things off shortly.
          </p>
        ) : (
          messages.map((m) => <ChatBubble key={m.id} message={m} />)
        )}
      </div>

      <p className="mt-4 text-center text-xs text-neutral-400">
        Snap meals and complete challenges from the MonthlyAlerts mobile app — everything
        appears here too.
      </p>
    </main>
  );
}

function ChatBubble({ message }: { message: Message }) {
  const isCoach = message.sender === "coach";

  if (message.kind === "meal_photo" && message.metadata?.photo_url) {
    return (
      <div className="flex justify-end">
        <Image
          src={message.metadata.photo_url}
          alt="Meal photo"
          width={160}
          height={160}
          unoptimized
          className="h-40 w-40 rounded-xl object-cover"
        />
      </div>
    );
  }

  const content = message.kind === "challenge_complete" ? "I did it." : message.content;
  if (!content) return null;

  return (
    <div className={`flex ${isCoach ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[82%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
          isCoach
            ? "border border-neutral-200 bg-neutral-50 text-neutral-900"
            : "bg-neutral-900 text-white"
        }`}
      >
        {message.kind === "monthly_summary" && (
          <p className="mb-1 text-[11px] font-bold tracking-widest text-amber-600">
            MONTHLY SUMMARY
          </p>
        )}
        <p className="whitespace-pre-line">{content}</p>
      </div>
    </div>
  );
}
