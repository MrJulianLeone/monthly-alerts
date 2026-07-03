import { Resend } from "resend";
import { kgToLb } from "@/lib/units";

let client: Resend | null = null;

function resend(): Resend {
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

function from(): string {
  // Default must be on the Resend-verified sending domain (alerts.monthlyalerts.com).
  const email = process.env.RESEND_FROM_EMAIL ?? "coach@alerts.monthlyalerts.com";
  const name = process.env.RESEND_FROM_NAME ?? "MonthlyAlerts";
  return `${name} <${email}>`;
}

export function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://monthlyalerts.com";
}

const wrapper = (body: string) => `
<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#171717">
  <p style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#737373;margin:0 0 24px">MonthlyAlerts</p>
  ${body}
  <hr style="border:none;border-top:1px solid #e5e5e5;margin:32px 0 16px" />
  <p style="font-size:12px;color:#a3a3a3;margin:0">MonthlyAlerts.com — Your personal health coach.</p>
</div>`;

const button = (href: string, label: string) => `
<a href="${href}" style="display:inline-block;background:#171717;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:15px;font-weight:600">${label}</a>`;

async function send(to: string, subject: string, html: string) {
  // The Resend SDK reports failures via the error field instead of throwing —
  // without this check, failed sends would look like successes to callers.
  const { data, error } = await resend().emails.send({ from: from(), to, subject, html });
  if (error) {
    throw new Error(`Email to ${to} failed: ${error.message}`);
  }
  return data;
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

/** Under-16 flow: parent receives a secure setup link. */
export async function sendParentSetupEmail(parentEmail: string, token: string) {
  const link = `${appUrl()}/parent-setup/${token}`;
  await send(
    parentEmail,
    "Set up your child's MonthlyAlerts health coach account",
    wrapper(`
      <h1 style="font-size:22px;margin:0 0 16px">Your child wants to start with MonthlyAlerts</h1>
      <p style="font-size:15px;line-height:1.6;color:#404040">
        Your child asked to join MonthlyAlerts, a professional personal health coach that
        provides daily meal and exercise guidance plus a monthly progress summary.
        Because they are under 16, your approval and setup are required.
      </p>
      <p style="font-size:15px;line-height:1.6;color:#404040">
        Use the secure link below to review the program, complete your child's profile,
        and set their login credentials. You will also get a parent dashboard to follow
        their progress and receive their monthly summaries.
      </p>
      <p style="margin:24px 0">${button(link, "Set up my child's account")}</p>
      <p style="font-size:13px;color:#737373">This link expires in 7 days. The first 30 days are completely free.</p>
    `)
  );
}

/** Leaderboard referral invite. */
export async function sendReferralEmail(
  inviteeEmail: string,
  referrerName: string,
  leaderboardName: string,
  token: string
) {
  const link = `${appUrl()}/invite/${token}`;
  await send(
    inviteeEmail,
    `${referrerName} invited you to their MonthlyAlerts leaderboard`,
    wrapper(`
      <h1 style="font-size:22px;margin:0 0 16px">You're invited</h1>
      <p style="font-size:15px;line-height:1.6;color:#404040">
        ${referrerName} invited you to join the leaderboard "${leaderboardName}" on
        MonthlyAlerts — a personal health coach with daily meal and exercise guidance
        and monthly progress summaries.
      </p>
      <p style="margin:24px 0">${button(link, "Accept invitation")}</p>
      <p style="font-size:13px;color:#737373">This invitation expires in 14 days.</p>
    `)
  );
}

/**
 * A user inviting a family member to MonthlyAlerts. The link carries a secure
 * token so acceptance is linked back to the inviter. When `asParent` is set,
 * the invitee is being asked to be the (minor) inviter's parent/guardian and
 * becomes their parent on accept.
 */
export async function sendFamilyInviteEmail(
  inviteeEmail: string,
  inviterName: string,
  token: string,
  asParent = false
) {
  const link = `${appUrl()}/family-invite/${token}`;
  if (asParent) {
    await send(
      inviteeEmail,
      `${inviterName} needs a parent to set up MonthlyAlerts`,
      wrapper(`
        <h1 style="font-size:22px;margin:0 0 16px">${inviterName} asked you to be their parent on MonthlyAlerts</h1>
        <p style="font-size:15px;line-height:1.6;color:#404040">
          ${inviterName} wants to use MonthlyAlerts — a professional personal health coach
          with daily meal and exercise guidance and a monthly progress summary. Because
          they are under 16, a parent or guardian needs to approve and oversee their account.
        </p>
        <p style="font-size:15px;line-height:1.6;color:#404040">
          Accept below to become their parent on MonthlyAlerts. You'll get a parent
          dashboard to follow their progress and receive their monthly summaries — and you
          can start your own coaching too. The first 30 days are completely free.
        </p>
        <p style="margin:24px 0">${button(link, "Accept and become their parent")}</p>
        <p style="font-size:13px;color:#737373">This invitation expires in 14 days.</p>
      `)
    );
    return;
  }
  await send(
    inviteeEmail,
    `${inviterName} invited you to MonthlyAlerts`,
    wrapper(`
      <h1 style="font-size:22px;margin:0 0 16px">Join your family on MonthlyAlerts</h1>
      <p style="font-size:15px;line-height:1.6;color:#404040">
        ${inviterName} is using MonthlyAlerts — a personal health coach with daily meal
        and exercise guidance and a monthly progress summary — and invited you to join
        them as family.
      </p>
      <p style="font-size:15px;line-height:1.6;color:#404040">
        Accept the invitation below and your coach kicks things off right away. The first
        30 days are completely free.
      </p>
      <p style="margin:24px 0">${button(link, "Accept invitation")}</p>
      <p style="font-size:13px;color:#737373">This invitation expires in 14 days.</p>
    `)
  );
}

/** The monthly progress summary — the core deliverable. */
export async function sendMonthlySummaryEmail(
  to: string,
  displayName: string,
  monthLabel: string,
  narrative: string,
  stats: {
    meals_logged: number;
    challenges_completed: number;
    best_streak: number;
    weight_delta_kg: number | null;
  }
) {
  const statRow = (label: string, value: string) => `
    <tr>
      <td style="padding:10px 0;font-size:14px;color:#737373;border-bottom:1px solid #f5f5f5">${label}</td>
      <td style="padding:10px 0;font-size:14px;font-weight:600;text-align:right;border-bottom:1px solid #f5f5f5">${value}</td>
    </tr>`;
  await send(
    to,
    `${displayName}'s ${monthLabel} progress summary — MonthlyAlerts`,
    wrapper(`
      <h1 style="font-size:22px;margin:0 0 8px">${monthLabel} Progress Summary</h1>
      <p style="font-size:14px;color:#737373;margin:0 0 24px">For ${displayName}</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        ${statRow("Meals logged", String(stats.meals_logged))}
        ${statRow("Challenges completed", String(stats.challenges_completed))}
        ${statRow("Best streak", `${stats.best_streak} days`)}
        ${
          stats.weight_delta_kg !== null
            ? statRow(
                "Weight change",
                `${stats.weight_delta_kg > 0 ? "+" : ""}${kgToLb(stats.weight_delta_kg).toFixed(1)} lbs`
              )
            : ""
        }
      </table>
      ${narrative
        .split(/\n+/)
        .map(
          (p) =>
            `<p style="font-size:15px;line-height:1.7;color:#404040">${p}</p>`
        )
        .join("")}
    `)
  );
}

/** After ~30 days of active use: prompt the Stripe monthly subscription. */
export async function sendBillingPromptEmail(to: string, displayName: string) {
  const link = `${appUrl()}/subscribe`;
  await send(
    to,
    "Your first month with MonthlyAlerts — keep the momentum going",
    wrapper(`
      <h1 style="font-size:22px;margin:0 0 16px">One month of progress</h1>
      <p style="font-size:15px;line-height:1.6;color:#404040">
        ${displayName} has completed the first free month with MonthlyAlerts —
        daily coaching, meal feedback, and a monthly progress summary.
      </p>
      <p style="font-size:15px;line-height:1.6;color:#404040">
        To keep the coaching going, start the monthly subscription below.
        Cancel anytime.
      </p>
      <p style="margin:24px 0">${button(link, "Start monthly subscription")}</p>
    `)
  );
}
