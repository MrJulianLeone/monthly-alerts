import { createRemoteJWKSet, jwtVerify } from "jose";

export type OAuthIdentity = { sub: string; email: string | null };

const appleJwks = createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys"));

/** Verifies a Sign in with Apple identity token from the mobile app. */
export async function verifyAppleToken(identityToken: string): Promise<OAuthIdentity> {
  const audience = process.env.APPLE_BUNDLE_ID;
  if (!audience) throw new Error("APPLE_BUNDLE_ID is not configured");
  const { payload } = await jwtVerify(identityToken, appleJwks, {
    issuer: "https://appleid.apple.com",
    audience,
  });
  return { sub: String(payload.sub), email: (payload.email as string) ?? null };
}

/** Verifies a Google ID token from the mobile app. */
export async function verifyGoogleToken(idToken: string): Promise<OAuthIdentity> {
  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
  );
  if (!response.ok) throw new Error("Invalid Google token");
  const payload = (await response.json()) as {
    sub: string;
    email?: string;
    aud: string;
  };
  const allowed = (process.env.GOOGLE_CLIENT_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (allowed.length > 0 && !allowed.includes(payload.aud)) {
    throw new Error("Google token audience mismatch");
  }
  return { sub: payload.sub, email: payload.email ?? null };
}
