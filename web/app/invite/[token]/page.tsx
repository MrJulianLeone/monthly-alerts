import { InviteFlow } from "./invite-flow";

export const metadata = { title: "Leaderboard invitation — MonthlyAlerts" };

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <InviteFlow token={token} />
    </main>
  );
}
