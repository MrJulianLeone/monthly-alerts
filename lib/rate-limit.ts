/**
 * Rate limiting utilities
 * Prevents brute force attacks on authentication endpoints
 */

import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: Date
}

/**
 * Check if a specific action is rate limited
 * @param identifier - Unique identifier (email, IP address, etc.)
 * @param action - Action type (login, signup, password-reset, etc.)
 * @param maxAttempts - Maximum attempts allowed
 * @param windowMinutes - Time window in minutes
 */
export async function checkRateLimit(
  identifier: string,
  action: string,
  maxAttempts: number = 5,
  windowMinutes: number = 15
): Promise<RateLimitResult> {
  const now = new Date()
  const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000)

  try {
    // Get attempts in the current window
    const attempts = await sql`
      SELECT COUNT(*) as count
      FROM rate_limits
      WHERE identifier = ${identifier}
        AND action = ${action}
        AND created_at > ${windowStart}
    `

    const count = Number(attempts[0]?.count || 0)
    const resetAt = new Date(now.getTime() + windowMinutes * 60 * 1000)

    if (count >= maxAttempts) {
      return {
        allowed: false,
        remaining: 0,
        resetAt
      }
    }

    // Record this attempt
    await sql`
      INSERT INTO rate_limits (identifier, action, created_at)
      VALUES (${identifier}, ${action}, ${now})
    `

    return {
      allowed: true,
      remaining: maxAttempts - count - 1,
      resetAt
    }
  } catch (error) {
    console.error("[RateLimit] Error checking rate limit:", error)
    // In case of error, allow the request (fail open)
    return {
      allowed: true,
      remaining: maxAttempts,
      resetAt: new Date(now.getTime() + windowMinutes * 60 * 1000)
    }
  }
}

/**
 * Clear rate limit records for an identifier (e.g., after successful action)
 */
export async function clearRateLimit(identifier: string, action: string): Promise<void> {
  try {
    await sql`
      DELETE FROM rate_limits
      WHERE identifier = ${identifier}
        AND action = ${action}
    `
  } catch (error) {
    console.error("[RateLimit] Error clearing rate limit:", error)
  }
}

/**
 * Clean up old rate limit records (should be run periodically)
 */
export async function cleanupRateLimits(): Promise<void> {
  try {
    // Delete records older than 24 hours
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)
    await sql`
      DELETE FROM rate_limits
      WHERE created_at < ${cutoff}
    `
  } catch (error) {
    console.error("[RateLimit] Error cleaning up rate limits:", error)
  }
}

/**
 * Get IP address from request headers
 */
export function getClientIP(headers: Headers): string {
  // Try various headers in order of preference
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIP = headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  // Fallback for Vercel
  const vercelIP = headers.get('x-vercel-forwarded-for')
  if (vercelIP) {
    return vercelIP
  }

  return 'unknown'
}

