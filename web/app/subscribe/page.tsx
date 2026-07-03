import { SubscribeCard } from "./subscribe-card";

export const metadata = { title: "Subscribe — MonthlyAlerts" };

export default function SubscribePage() {
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <SubscribeCard />
    </main>
  );
}
