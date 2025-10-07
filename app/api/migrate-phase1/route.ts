import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    console.log('🚀 Starting Phase 1 Security Migration...')
    const results = []

    // Create rate_limits table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS rate_limits (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          identifier VARCHAR(255) NOT NULL,
          action VARCHAR(50) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `
      results.push('✅ rate_limits table created')
    } catch (e: any) {
      results.push(`⚠️  rate_limits: ${e.message}`)
    }

    // Create indexes for rate_limits
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_action ON rate_limits(identifier, action)`
      await sql`CREATE INDEX IF NOT EXISTS idx_rate_limits_created_at ON rate_limits(created_at)`
      results.push('✅ rate_limits indexes created')
    } catch (e: any) {
      results.push(`⚠️  rate_limits indexes: ${e.message}`)
    }

    // Create email_verification_tokens table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS email_verification_tokens (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token VARCHAR(255) UNIQUE NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `
      results.push('✅ email_verification_tokens table created')
    } catch (e: any) {
      results.push(`⚠️  email_verification_tokens: ${e.message}`)
    }

    // Create indexes for email_verification_tokens
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_email_verification_user_id ON email_verification_tokens(user_id)`
      await sql`CREATE INDEX IF NOT EXISTS idx_email_verification_token ON email_verification_tokens(token)`
      await sql`CREATE INDEX IF NOT EXISTS idx_email_verification_expires ON email_verification_tokens(expires_at)`
      results.push('✅ email_verification_tokens indexes created')
    } catch (e: any) {
      results.push(`⚠️  email_verification_tokens indexes: ${e.message}`)
    }

    // Create password_reset_tokens table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token VARCHAR(255) UNIQUE NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          used BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `
      results.push('✅ password_reset_tokens table created')
    } catch (e: any) {
      results.push(`⚠️  password_reset_tokens: ${e.message}`)
    }

    // Create indexes for password_reset_tokens
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_password_reset_user_id ON password_reset_tokens(user_id)`
      await sql`CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_tokens(token)`
      await sql`CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON password_reset_tokens(expires_at)`
      results.push('✅ password_reset_tokens indexes created')
    } catch (e: any) {
      results.push(`⚠️  password_reset_tokens indexes: ${e.message}`)
    }

    // Add email_verified column to users
    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE`
      results.push('✅ email_verified column added to users')
    } catch (e: any) {
      results.push(`⚠️  email_verified column: ${e.message}`)
    }

    // Performance indexes for existing tables
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id)`
      results.push('✅ Index created: subscriptions.user_id')
    } catch (e: any) {
      results.push(`⚠️  Index subscriptions.user_id: ${e.message}`)
    }

    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status)`
      results.push('✅ Index created: subscriptions.status')
    } catch (e: any) {
      results.push(`⚠️  Index subscriptions.status: ${e.message}`)
    }

    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id)`
      results.push('✅ Index created: subscriptions.stripe_customer_id')
    } catch (e: any) {
      results.push(`⚠️  Index subscriptions.stripe_customer_id: ${e.message}`)
    }

    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`
      results.push('✅ Index created: sessions.user_id')
    } catch (e: any) {
      results.push(`⚠️  Index sessions.user_id: ${e.message}`)
    }

    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)`
      results.push('✅ Index created: sessions.expires_at')
    } catch (e: any) {
      results.push(`⚠️  Index sessions.expires_at: ${e.message}`)
    }

    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_alerts_sent_at ON alerts(sent_at DESC)`
      results.push('✅ Index created: alerts.sent_at')
    } catch (e: any) {
      results.push(`⚠️  Index alerts.sent_at: ${e.message}`)
    }

    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_alerts_created_by ON alerts(created_by)`
      results.push('✅ Index created: alerts.created_by')
    } catch (e: any) {
      results.push(`⚠️  Index alerts.created_by: ${e.message}`)
    }

    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON messages(sent_at DESC)`
      results.push('✅ Index created: messages.sent_at')
    } catch (e: any) {
      results.push(`⚠️  Index messages.sent_at: ${e.message}`)
    }

    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_messages_created_by ON messages(created_by)`
      results.push('✅ Index created: messages.created_by')
    } catch (e: any) {
      results.push(`⚠️  Index messages.created_by: ${e.message}`)
    }

    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id)`
      results.push('✅ Index created: admin_users.user_id')
    } catch (e: any) {
      results.push(`⚠️  Index admin_users.user_id: ${e.message}`)
    }

    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`
      results.push('✅ Index created: users.email')
    } catch (e: any) {
      results.push(`⚠️  Index users.email: ${e.message}`)
    }

    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at)`
      results.push('✅ Index created: users.created_at')
    } catch (e: any) {
      results.push(`⚠️  Index users.created_at: ${e.message}`)
    }

    // Mark admin user as verified
    try {
      const adminResult = await sql`
        UPDATE users 
        SET email_verified = TRUE 
        WHERE email = 'julianleone@gmail.com'
        RETURNING id, email, first_name, last_name
      `
      
      if (adminResult.length > 0) {
        const admin = adminResult[0]
        results.push(`✅ Admin verified: ${admin.first_name} ${admin.last_name} (${admin.email})`)
      } else {
        results.push('⚠️  Admin user not found')
      }
    } catch (e: any) {
      results.push(`⚠️  Admin verification: ${e.message}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Phase 1 Security Migration Completed',
      results
    })
  } catch (error: any) {
    console.error('Migration error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

