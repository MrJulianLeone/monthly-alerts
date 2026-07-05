import { redirect } from "next/navigation";
import { getCurrentUser, getRememberedUser } from "@/lib/auth";
import { homeForRole } from "@/lib/page-auth";
import { StartChat } from "./start-chat";

const features = [
  {
    title: "Start instantly, no sign-up",
    body: "Type one message and you're in. We remember you on this device with a cookie, so your coach and your history are waiting when you come back.",
  },
  {
    title: "Daily coaching, two taps",
    body: "Snap a photo of your meal for instant, practical feedback. Complete your daily challenge and tap \"I Did It\". No typing, no friction.",
  },
  {
    title: "Challenges that grow with you",
    body: "Sequential bodyweight and dumbbell challenges with progressive overload tuned to your goals and performance.",
  },
  {
    title: "The monthly summary",
    body: "Every month you get a clear progress report — meals logged, challenges completed, streaks, and trends — right in the app.",
  },
];

export default async function HomePage() {
  // Anyone with a live session (guest or full account) goes straight back to
  // their chat history — no welcome screen, no barriers.
  const user = await getCurrentUser();
  if (user) redirect(homeForRole(user.role));

  // No live session, but we may still remember who they are.
  const remembered = await getRememberedUser();

  return (
    <main>
      <section className="mx-auto max-w-3xl px-6 pb-20 pt-20 text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-neutral-500">
          MonthlyAlerts.com
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl">
          Your personal health coach.
          <br />
          Start chatting right now.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-neutral-600">
          Daily guidance for meals and exercise through a simple chat with your
          AI coach — no account, no forms, no waiting.
        </p>

        <StartChat rememberedName={remembered?.name ?? null} />
      </section>

      <section className="border-t border-neutral-200 bg-white">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 py-20 sm:grid-cols-2">
          {features.map((f) => (
            <div key={f.title}>
              <h2 className="text-lg font-semibold text-neutral-900">{f.title}</h2>
              <p className="mt-2 leading-relaxed text-neutral-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-neutral-200 py-10 text-center text-sm text-neutral-400">
        MonthlyAlerts.com — Your personal health coach.
      </footer>
    </main>
  );
}
