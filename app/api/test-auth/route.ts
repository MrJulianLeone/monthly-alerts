import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session")?.value

    if (!sessionId) {
      return NextResponse.json({
        status: 'no_session',
        message: 'No session cookie found. User needs to login.'
      })
    }

    // Test session query
    const result = await sql`
      SELECT s.id, s.user_id, u.email, u.first_name as "firstName", u.last_name as "lastName", u.created_at as "createdAt"
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.id = ${sessionId} AND s.expires_at > NOW()
    `

    const session = result[0]

    if (!session) {
      return NextResponse.json({
        status: 'session_expired',
        message: 'Session not found or expired'
      })
    }

    // Test admin check
    const adminResult = await sql`
      SELECT * FROM admin_users WHERE user_id = ${session.user_id}::uuid
    `

    return NextResponse.json({
      status: 'success',
      session: {
        id: session.id,
        user_id: session.user_id,
        email: session.email,
        firstName: session.firstName,
        lastName: session.lastName,
      },
      isAdmin: adminResult.length > 0,
      tests: {
        sessionQuery: 'passed',
        adminQuery: 'passed',
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      name: error.name,
      code: error.code,
      detail: error.detail,
    }, { status: 500 })
  }
}
