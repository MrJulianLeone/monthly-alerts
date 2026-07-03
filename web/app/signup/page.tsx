import { SignupFlow } from "./signup-flow";

export const metadata = { title: "Get started — MonthlyAlerts" };

export default function SignupPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <SignupFlow />
    </main>
  );
}
