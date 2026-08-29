import { expect, test } from "@playwright/test";
import { createHash, randomBytes } from "node:crypto";
import pg from "pg";

/**
 * Smoke test for the money paths: signup → email verification → onboarding →
 * project creation → checklist editing. Email sending is disabled
 * (EMAIL_DISABLED=true), so the verification token is seeded straight into
 * the database — the same table the real flow uses.
 */

const DATABASE_URL =
  process.env.DATABASE_URL ?? "postgres://localhost:5432/monthlyalerts_test";

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ssl: /localhost|127\.0\.0\.1/.test(DATABASE_URL)
    ? undefined
    : { rejectUnauthorized: false },
});

test.afterAll(() => pool.end());

test("signup, verify, onboard, and run a checklist", async ({ page }) => {
  const email = `e2e-${Date.now()}@example.com`;
  const password = "smoke-test-passw0rd";

  // Sign up.
  await page.goto("/login");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("Check your email")).toBeVisible();

  // Login is refused until the email is confirmed.
  const unverified = await page.request.post("/api/auth/login", {
    data: { email, password },
  });
  expect(unverified.status()).toBe(403);

  // Seed a verification token (stands in for the emailed link).
  const token = randomBytes(32).toString("hex");
  await pool.query(
    `INSERT INTO login_tokens (email, purpose, token_hash, expires_at)
     VALUES ($1, 'verify', $2, now() + interval '60 minutes')`,
    [email, createHash("sha256").update(token).digest("hex")]
  );
  await page.goto(`/auth/verify?token=${token}`);

  // Onboarding.
  await expect(page.getByText(email)).toBeVisible();
  await page.locator("#name").fill("E2E Tester");
  await page.getByRole("button", { name: "Continue" }).click();

  // Create a project.
  await page.getByRole("link", { name: /New project/i }).first().click();
  await page.locator("#pname").fill("Smoke Test Build");
  await page.getByRole("button", { name: "Create project" }).click();
  await expect(page.getByRole("heading", { name: "Smoke Test Build" })).toBeVisible();

  // Add a section and an item.
  await page.getByRole("button", { name: /Add section/ }).click();
  await page.getByPlaceholder(/Section name/).fill("Foundation");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expect(page.getByRole("heading", { name: /Foundation/ })).toBeVisible();

  await page.getByPlaceholder(/What needs to be done/).fill("Pour the footings");
  await page.getByRole("button", { name: "Add item" }).click();
  await expect(page.getByText("Pour the footings")).toBeVisible();

  // Check the item off and confirm progress updates.
  await page.getByRole("button", { name: "open", exact: true }).click();
  await expect(page.getByText("1 of 1 complete")).toBeVisible();

  // Log out, log back in with the password.
  await page.getByRole("button", { name: "Log out" }).click();
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
  await expect(page.getByText("Smoke Test Build")).toBeVisible();
});

test("wrong password is rejected", async ({ page }) => {
  const res = await page.request.post("/api/auth/login", {
    data: { email: "nobody@example.com", password: "definitely-wrong" },
  });
  expect(res.status()).toBe(401);
});
