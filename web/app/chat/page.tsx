import Link from "next/link";
import { sql } from "@/lib/db";
import { requirePageUser } from "@/lib/page-auth";
import { Card } from "@/components/ui";
import { ChatClient, type Message, type Challenge } from "./chat-client";

export const metadata = { title: "Coach chat — MonthlyAlerts" };
export const dynamic = "force-dynamic";

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string }>;
}) {
  const user = await requirePageUser();
  const { action } = await searchParams;

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
  const challenge = ((challengeRows as NonNullable<Challenge>[])[0] ?? null) as Challenge;
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
    <ChatClient
      displayName={profile.display_name}
      initialMessages={messages}
      initialChallenge={challenge}
      initialAction={action === "photo" || action === "challenge" ? action : undefined}
    />
  );
}
