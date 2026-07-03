import Link from "next/link";
import { Card } from "@/components/ui";

export const metadata = { title: "Subscription active — MonthlyAlerts" };

export default function SubscribeSuccessPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <Card>
        <h1 className="text-xl font-semibold text-neutral-900">You&apos;re all set</h1>
        <p className="mt-2 text-sm leading-relaxed text-neutral-500">
          Your MonthlyAlerts subscription is active. Open the app and keep the streak going —
          your next monthly summary is on its way at the end of the month.
        </p>
        <Link
          href="/me"
          className="mt-6 inline-block rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700"
        >
          View my progress
        </Link>
      </Card>
    </main>
  );
}
