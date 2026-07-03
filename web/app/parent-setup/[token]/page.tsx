import { ParentSetupForm } from "./setup-form";

export const metadata = { title: "Set up your child's account — MonthlyAlerts" };

export default async function ParentSetupPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <ParentSetupForm token={token} />
    </main>
  );
}
