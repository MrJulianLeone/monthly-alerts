import { NextResponse } from 'next/server'
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    // Test database connection
    const result = await sql`SELECT NOW() as current_time, COUNT(*) as user_count FROM users`
    
    return NextResponse.json({
      status: 'success',
      database: 'connected',
      timestamp: result[0].current_time,
      users: result[0].user_count,
      env: {
        hasDatabase: !!process.env.DATABASE_URL,
        hasStripe: !!process.env.STRIPE_SECRET_KEY,
        hasResend: !!process.env.RESEND_API_KEY,
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      name: error.name,
      stack: error.stack,
    }, { status: 500 })
  }
}
