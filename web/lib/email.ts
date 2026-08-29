import { Resend } from "resend";
import { t, type Lang } from "@/lib/i18n";

let client: Resend | null = null;

function resend(): Resend {
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

function from(): string {
  // Default must be on the Resend-verified sending domain.
  const email = process.env.RESEND_FROM_EMAIL ?? "alerts@alerts.monthlyalerts.com";
  const name = process.env.RESEND_FROM_NAME ?? "MonthlyAlerts";
  return `${name} <${email}>`;
}

export function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://monthlyalerts.com";
}

export function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const wrapper = (body: string, lang: Lang) => `
<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1c1917">
  <p style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#78716c;margin:0 0 24px">Monthly<span style="color:#ea580c">Alerts</span></p>
  ${body}
  <hr style="border:none;border-top:1px solid #e7e5e4;margin:32px 0 16px" />
  <p style="font-size:12px;color:#a8a29e;margin:0">${t(lang, "email_footer")}</p>
</div>`;

const button = (href: string, label: string) => `
<a href="${href}" style="display:inline-block;background:#1c1917;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:15px;font-weight:600">${label}</a>`;

async function send(to: string, subject: string, html: string) {
  return sendRawEmail({ from: from(), to, subject, html });
}

/**
 * Low-level send used by both the notification templates above (via send())
 * and the support inbox, which sends from a different address with threading
 * headers and a plain-text part.
 */
export async function sendRawEmail(opts: {
  from: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
  headers?: Record<string, string>;
}) {
  // Test/CI hook: log instead of sending (EMAIL_DISABLED=true).
  if (process.env.EMAIL_DISABLED === "true") {
    console.log(`[email disabled] to=${opts.to} subject=${opts.subject}`);
    return null;
  }
  // The Resend SDK reports failures via the error field instead of throwing —
  // without this check, failed sends would look like successes to callers.
  const { data, error } = await resend().emails.send(opts);
  if (error) {
    throw new Error(`Email to ${opts.to} failed: ${error.message}`);
  }
  return data;
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

/** Email confirmation link for new password signups. */
export async function sendVerificationEmail(to: string, token: string, lang: Lang) {
  const link = `${appUrl()}/auth/verify?token=${token}`;
  await send(
    to,
    t(lang, "email_verify_subject"),
    wrapper(
      `
      <h1 style="font-size:22px;margin:0 0 16px">${t(lang, "email_verify_title")}</h1>
      <p style="font-size:15px;line-height:1.6;color:#44403c">${t(lang, "email_verify_body")}</p>
      <p style="margin:24px 0">${button(link, t(lang, "email_verify_button"))}</p>
      <p style="font-size:13px;color:#78716c">${t(lang, "email_ignore")}</p>
      `,
      lang
    )
  );
}

/** Password reset link. */
export async function sendPasswordResetEmail(to: string, token: string, lang: Lang) {
  const link = `${appUrl()}/reset?token=${token}`;
  await send(
    to,
    t(lang, "email_reset_subject"),
    wrapper(
      `
      <h1 style="font-size:22px;margin:0 0 16px">${t(lang, "email_reset_title")}</h1>
      <p style="font-size:15px;line-height:1.6;color:#44403c">${t(lang, "email_reset_body")}</p>
      <p style="margin:24px 0">${button(link, t(lang, "email_reset_button"))}</p>
      <p style="font-size:13px;color:#78716c">${t(lang, "email_ignore")}</p>
      `,
      lang
    )
  );
}

/** Anti-enumeration signup notice: the address already has an account. */
export async function sendAccountExistsEmail(to: string, lang: Lang) {
  await send(
    to,
    t(lang, "email_exists_subject"),
    wrapper(
      `
      <h1 style="font-size:22px;margin:0 0 16px">${t(lang, "email_exists_subject")}</h1>
      <p style="font-size:15px;line-height:1.6;color:#44403c">${t(lang, "email_exists_body")}</p>
      <p style="margin:24px 0">${button(`${appUrl()}/login`, t(lang, "log_in"))}</p>
      `,
      lang
    )
  );
}

/** Task assignment notice, in the assignee's language. */
export async function sendAssignmentEmail(
  to: string,
  lang: Lang,
  data: {
    assignerName: string;
    projectName: string; // translated
    itemTitle: string; // translated
    projectId: string;
    itemId: string;
    dueDate: string | null; // localized display string
  }
) {
  await send(
    to,
    t(lang, "email_assign_subject", { project: data.projectName, item: data.itemTitle }),
    wrapper(
      `
      <p style="font-size:15px;line-height:1.6;color:#44403c">${t(lang, "email_assign_body", {
        assigner: escapeHtml(data.assignerName),
        project: escapeHtml(data.projectName),
      })}</p>
      <p style="font-size:18px;font-weight:600;margin:16px 0">${escapeHtml(data.itemTitle)}</p>
      ${
        data.dueDate
          ? `<p style="font-size:14px;color:#78716c">${t(lang, "email_assign_due", { date: data.dueDate })}</p>`
          : ""
      }
      <p style="margin:24px 0">${button(
        `${appUrl()}/projects/${data.projectId}/items/${data.itemId}`,
        t(lang, "email_assign_button")
      )}</p>
      `,
      lang
    )
  );
}

/** 30-day storage-expiration warning to the project owner. */
export async function sendExpiryWarningEmail(
  to: string,
  lang: Lang,
  data: { projectName: string; projectId: string; date: string }
) {
  await send(
    to,
    t(lang, "email_expiry_subject", { project: data.projectName, date: data.date }),
    wrapper(
      `
      <h1 style="font-size:22px;margin:0 0 16px">${escapeHtml(data.projectName)}</h1>
      <p style="font-size:15px;line-height:1.6;color:#44403c">${t(lang, "email_expiry_body", {
        project: escapeHtml(data.projectName),
        date: data.date,
      })}</p>
      <p style="margin:24px 0">${button(
        `${appUrl()}/projects/${data.projectId}`,
        t(lang, "email_monthly_open_project")
      )}</p>
      `,
      lang
    )
  );
}

/** Project invitation, in the language the owner selected for this invitee. */
export async function sendInviteEmail(
  to: string,
  inviterName: string,
  projectName: string,
  role: "editor" | "commenter",
  token: string,
  lang: Lang
) {
  const link = `${appUrl()}/invite/${token}`;
  await send(
    to,
    t(lang, "email_invite_subject", { inviter: inviterName, project: projectName }),
    wrapper(
      `
      <h1 style="font-size:22px;margin:0 0 16px">${t(lang, "invite_title")}</h1>
      <p style="font-size:15px;line-height:1.6;color:#44403c">${t(lang, "invite_body", {
        inviter: escapeHtml(inviterName),
        project: escapeHtml(projectName),
        role: t(lang, role === "editor" ? "role_editor" : "role_commenter").toLowerCase(),
      })}</p>
      <p style="margin:24px 0">${button(link, t(lang, "email_invite_button"))}</p>
      <p style="font-size:13px;color:#78716c">${t(lang, "email_invite_expiry")}</p>
      `,
      lang
    )
  );
}

export type MonthlyStatus = {
  projectId: string;
  projectName: string; // already translated to the recipient's language
  monthLabel: string;
  totalItems: number;
  doneItems: number;
  completedThisMonth: number;
  addedThisMonth: number;
  overdueCount: number;
  overdueTitles: string[]; // already translated
};

/** The monthly status update — the product's namesake. */
export async function sendMonthlyStatusEmail(
  to: string,
  lang: Lang,
  status: MonthlyStatus,
  unsubscribeUrl: string
) {
  const pct =
    status.totalItems > 0 ? Math.round((status.doneItems / status.totalItems) * 100) : 0;
  const statRow = (label: string, value: string) => `
    <tr>
      <td style="padding:10px 0;font-size:14px;color:#78716c;border-bottom:1px solid #f5f5f4">${label}</td>
      <td style="padding:10px 0;font-size:14px;font-weight:600;text-align:right;border-bottom:1px solid #f5f5f4">${value}</td>
    </tr>`;
  const overdueList =
    status.overdueTitles.length > 0
      ? `
      <p style="font-size:14px;font-weight:600;margin:24px 0 8px">${t(lang, "email_monthly_overdue_list")}</p>
      <ul style="margin:0;padding-left:20px">
        ${status.overdueTitles
          .map(
            (title) =>
              `<li style="font-size:14px;line-height:1.8;color:#44403c">${escapeHtml(title)}</li>`
          )
          .join("")}
      </ul>`
      : "";
  await send(
    to,
    t(lang, "email_monthly_subject", {
      project: status.projectName,
      month: status.monthLabel,
    }),
    wrapper(
      `
      <h1 style="font-size:22px;margin:0 0 8px">${escapeHtml(status.projectName)}</h1>
      <p style="font-size:14px;color:#78716c;margin:0 0 24px">${t(lang, "email_monthly_title", { month: status.monthLabel })}</p>
      <div style="background:#f5f5f4;border-radius:8px;height:10px;margin-bottom:8px">
        <div style="background:#ea580c;border-radius:8px;height:10px;width:${pct}%"></div>
      </div>
      <p style="font-size:13px;color:#78716c;margin:0 0 20px">${t(lang, "progress_done", {
        done: status.doneItems,
        total: status.totalItems,
      })} (${pct}%)</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:8px">
        ${statRow(t(lang, "email_monthly_completed"), String(status.completedThisMonth))}
        ${statRow(t(lang, "email_monthly_added"), String(status.addedThisMonth))}
        ${statRow(t(lang, "email_monthly_overdue"), String(status.overdueCount))}
      </table>
      ${overdueList}
      <p style="margin:28px 0 8px">${button(
        `${appUrl()}/projects/${status.projectId}`,
        t(lang, "email_monthly_open_project")
      )}</p>
      <p style="font-size:12px;margin:24px 0 0"><a href="${unsubscribeUrl}" style="color:#a8a29e">${t(lang, "email_monthly_unsubscribe")}</a></p>
      `,
      lang
    )
  );
}
