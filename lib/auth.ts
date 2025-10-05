import { neon } from "@neondatabase/serverless"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const sql = neon(process.env.DATABASE_URL!)

export async function hashPassword(password: string): Promise<string> {
  // Simple hash for demo - in production use bcrypt
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

export async function createUser(email: string, password: string, name: string) {
  const hashedPassword = await hashPassword(password)

  const result = await sql`
    INSERT INTO users (email, password_hash, name)
    VALUES (${email}, ${hashedPassword}, ${name})
    RETURNING id, email, name
  `

  return result[0]
}

export async function verifyUser(email: string, password: string) {
  const hashedPassword = await hashPassword(password)

  const result = await sql`
    SELECT id, email, name
    FROM users
    WHERE email = ${email} AND password_hash = ${hashedPassword}
  `

  return result[0] || null
}

export async function createSession(userId: string) {
  const sessionId = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

  await sql`
    INSERT INTO sessions (id, user_id, expires_at)
    VALUES (${sessionId}, ${userId}, ${expiresAt})
  `

  const cookieStore = await cookies()
  cookieStore.set("session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
  })

  return sessionId
}

export async function getSession() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session")?.value

  if (!sessionId) return null

  const result = await sql`
    SELECT s.id, s.user_id, u.email, u.name, u.created_at as "createdAt"
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.id = ${sessionId} AND s.expires_at > NOW()
  `

  return result[0] || null
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }
  return session
}

export async function logout() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session")?.value

  if (sessionId) {
    await sql`DELETE FROM sessions WHERE id = ${sessionId}`
  }

  cookieStore.delete("session")
}
