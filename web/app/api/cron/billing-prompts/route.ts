import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireCronSecret } from "@/lib/api";
import { sendBillingPromptEmail } from "@/lib/email";

export const maxDuration = 300;

/**
 * Daily: users whose ~30-day free trial has ended, who are still active and
 * unsubscribed, get one email (to the parent for minors) prompting the Stripe
 * monthly subscription.
 */
export async function GET(request: NextRequest) {
  const unauthorized = requireCronSecret(request);
  if (unauthorized) return unauthorized;

  const due = (await sql()`
    SELECT s.id AS subscription_id, u.id AS user_id, u.email,
           p.display_name, parent.email AS parent_email
    FROM subscriptions s
    JOIN users u ON u.id = s.user_id AND u.deleted_at IS NULL
    LEFT JOIN profiles p ON p.user_id = u.id
    LEFT JOIN users parent ON parent.id = u.parent_id
    WHERE s.status = 'trialing'
      AND s.trial_ends_at < now()
      AND s.billing_prompt_sent_at IS NULL
      AND u.last_active_at > now() - interval '14 days'
    LIMIT 100
  `) as {
    subscription_id: string;
    user_id: string;
    email: string;
    display_name: string | null;
    parent_email: string | null;
  }[];

  let sent = 0;
  for (const row of due) {
    try {
      await sendBillingPromptEmail(
        row.parent_email ?? row.email,
        row.display_name ?? "Your coached user"
      );
      await sql()`
        UPDATE subscriptions SET billing_prompt_sent_at = now()
        WHERE id = ${row.subscription_id}
      `;
      sent++;
    } catch {
      // retried on the next run
    }
  }

  return NextResponse.json({ due: due.length, sent });
}
