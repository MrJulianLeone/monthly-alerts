import { LoginForm } from "./login-form";

export const metadata = { title: "Log in — MonthlyAlerts" };

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <LoginForm />
    </main>
  );
}
