// Environment variable validation
// This runs at build time to catch missing variables early

export function validateEnv() {
  const required = [
    'DATABASE_URL',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'NEXT_PUBLIC_URL',
  ]

  const missing = required.filter(key => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  // Warn about optional but recommended variables
  const optional = [
    'RESEND_API_KEY',
    'STRIPE_WEBHOOK_SECRET',
  ]

  const missingOptional = optional.filter(key => !process.env[key])
  
  if (missingOptional.length > 0) {
    console.warn(`⚠️  Missing optional environment variables: ${missingOptional.join(', ')}`)
  }
}

// Helper to get the base URL for the application
export function getBaseUrl(): string {
  // In the browser, use window.location.origin
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  // On server, use NEXT_PUBLIC_URL or Vercel URL
  if (process.env.NEXT_PUBLIC_URL) {
    return process.env.NEXT_PUBLIC_URL
  }

  // Fallback for Vercel deployments
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // Development fallback
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000'
  }

  throw new Error('Unable to determine base URL. Please set NEXT_PUBLIC_URL environment variable.')
}

// Validate on import (only in Node.js environment)
if (typeof window === 'undefined') {
  validateEnv()
}
