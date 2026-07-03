import { FamilyInviteFlow } from "./family-invite-flow";

export const metadata = { title: "Family invitation — MonthlyAlerts" };

export default async function FamilyInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <FamilyInviteFlow token={token} />
    </main>
  );
}
