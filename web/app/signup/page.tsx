import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { homeForRole } from "@/lib/page-auth";
import { SignupFlow } from "./signup-flow";

export const metadata = { title: "Get started — MonthlyAlerts" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ family?: string }>;
}) {
  // Already signed in (session still valid) — go straight to the app.
  const user = await getCurrentUser();
  if (user) redirect(homeForRole(user.role));

  const { family } = await searchParams;

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <SignupFlow familyToken={typeof family === "string" ? family : undefined} />
    </main>
  );
}
