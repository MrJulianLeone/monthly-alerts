// Environment variable validation
// This runs at build time to catch missing variables early

export function validateEnv() {
  const required = [
    'DATABASE_URL',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  ]

  const missing = required.filter(key => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  // Warn about optional but recommended variables
  const optional = [
    'RESEND_API_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_URL',
  ]

  const missingOptional = optional.filter(key => !process.env[key])
  
  if (missingOptional.length > 0) {
    console.warn(`⚠️  Missing optional environment variables: ${missingOptional.join(', ')}`)
  }
}

// Validate on import (only in Node.js environment)
if (typeof window === 'undefined') {
  validateEnv()
}
