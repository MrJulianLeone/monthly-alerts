import { neon } from "@neondatabase/serverless"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"

const sql = neon(process.env.DATABASE_URL!)

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

export async function createUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string
) {
  const hashedPassword = await hashPassword(password)

  const result = await sql`
    INSERT INTO users (email, password_hash, first_name, last_name, name)
    VALUES (${email}, ${hashedPassword}, ${firstName}, ${lastName}, ${firstName + " " + lastName})
    RETURNING id, email, first_name as "firstName", last_name as "lastName"
  `

  return result[0]
}

export async function verifyUser(email: string, password: string) {
  const result = await sql`
    SELECT id, email, first_name, last_name, password_hash
    FROM users
    WHERE email = ${email}
  `

  const user = result[0]
  if (!user) return null

  const isValidPassword = await bcrypt.compare(password, user.password_hash)
  if (!isValidPassword) return null

  // Return user without password hash
  return { 
    id: user.id, 
    email: user.email, 
    firstName: user.first_name,
    lastName: user.last_name
  }
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
    SELECT s.id, s.user_id, u.email, u.first_name as "firstName", u.last_name as "lastName", u.created_at as "createdAt"
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
