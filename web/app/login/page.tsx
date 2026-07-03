import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { homeForRole } from "@/lib/page-auth";
import { LoginForm } from "./login-form";

export const metadata = { title: "Log in — MonthlyAlerts" };

export default async function LoginPage() {
  // Already signed in (session still valid) — go straight to the app.
  const user = await getCurrentUser();
  if (user) redirect(homeForRole(user.role));

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <LoginForm />
    </main>
  );
}
