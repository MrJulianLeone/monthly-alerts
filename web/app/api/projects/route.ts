import { NextResponse } from "next/server";
import { jsonError, requireUser } from "@/lib/api";
import { billingEnabled, stripe } from "@/lib/billing";
import { sql } from "@/lib/db";
import { appUrl } from "@/lib/email";

/**
 * Creates a project. While billing is disabled this is direct and free; once
 * BILLING_ENABLED=true it returns a Stripe Checkout URL instead, and the
 * project is created when payment completes (webhook, with a success-page
 * fallback).
 */
export async function POST(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const body = await request.json().catch(() => ({}));

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 200) : "";
  const address =
    typeof body.address === "string" ? body.address.trim().slice(0, 300) : null;
  const description =
    typeof body.description === "string" ? body.description.trim().slice(0, 2000) : null;
  if (!name) return jsonError("Project name is required", 400);

  const lang = auth.user.preferred_language;

  if (billingEnabled()) {
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
      // Stripe Tax (enabled in the dashboard) only applies when the session
      // asks for it; billing address is required for tax calculation.
      automatic_tax: { enabled: true },
      billing_address_collection: "required",
      allow_promotion_codes: true,
      customer_email: auth.user.email,
      success_url: `${appUrl()}/projects/activated?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl()}/projects/new`,
      metadata: {
        user_id: auth.user.id,
        name,
        name_lang: lang,
        address: address ?? "",
        description: description ?? "",
      },
    });
    return NextResponse.json({ checkout_url: session.url });
  }

  const rows = (await sql()`
    INSERT INTO projects (name, name_lang, address, description, owner_id)
    VALUES (${name}, ${lang}, ${address}, ${description}, ${auth.user.id})
    RETURNING id
  `) as { id: string }[];
  await sql()`
    INSERT INTO project_members (project_id, user_id, role)
    VALUES (${rows[0].id}, ${auth.user.id}, 'owner')
  `;
  return NextResponse.json({ id: rows[0].id });
}
