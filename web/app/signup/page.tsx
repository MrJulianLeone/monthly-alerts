import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { homeForRole } from "@/lib/page-auth";
import { SignupFlow } from "./signup-flow";

export const metadata = { title: "Get started — MonthlyAlerts" };

export default async function SignupPage() {
  // Already signed in (session still valid) — go straight to the app.
  const user = await getCurrentUser();
  if (user) redirect(homeForRole(user.role));

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <SignupFlow />
    </main>
  );
}
