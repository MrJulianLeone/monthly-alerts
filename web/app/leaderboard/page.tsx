import { requirePageUser } from "@/lib/page-auth";
import { AppShell } from "@/components/app-shell";
import { LeaderboardClient } from "./leaderboard-client";

export const metadata = { title: "Leaderboard — MonthlyAlerts" };
export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  await requirePageUser();

  return (
    <AppShell
      title="Leaderboard"
      subtitle="Weekly activity with your friends"
      active="leaderboard"
    >
      <LeaderboardClient />
    </AppShell>
  );
}
