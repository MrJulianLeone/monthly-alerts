import Link from "next/link";
import { redirect } from "next/navigation";
import { getRememberedUser } from "@/lib/auth";
import { homeForRole } from "@/lib/page-auth";

const features = [
  {
    title: "Daily coaching, two taps",
    body: "Snap a photo of your meal for instant, practical feedback. Complete your daily challenge and tap \"I Did It\". No typing, no friction.",
  },
  {
    title: "Challenges that grow with you",
    body: "Sequential bodyweight and dumbbell challenges with progressive overload tuned to your age, gender, and performance.",
  },
  {
    title: "The monthly summary",
    body: "Every month you get a clear progress report — meals logged, challenges completed, streaks, and trends — in the app and in your inbox.",
  },
  {
    title: "Built for families",
    body: "Kids 11+ join with parent approval and a dedicated parent dashboard. Adults sign up in under a minute.",
  },
];

export default async function HomePage() {
  // Signed-in visitors go straight to their app until they log out.
  const remembered = await getRememberedUser();
  if (remembered) redirect(homeForRole(remembered.status));

  return (
    <main>
      <section className="mx-auto max-w-3xl px-6 pb-20 pt-24 text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-neutral-500">
          MonthlyAlerts.com
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl">
          Your personal health coach.
          <br />
          Progress you can see, every month.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-neutral-600">
          Daily guidance for meals and exercise through a simple chat with your
          AI coach — and a professional monthly progress summary that shows how
          far you&apos;ve come.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-lg bg-neutral-900 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-700"
          >
            Get started — first 30 days free
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-100"
          >
            Log in
          </Link>
        </div>
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
