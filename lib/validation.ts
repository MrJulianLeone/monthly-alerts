/**
 * Validation utilities for user input
 */

export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validate password strength
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { valid: false, error: "Password is required" }
  }

  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters long" }
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: "Password must contain at least one uppercase letter" }
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, error: "Password must contain at least one lowercase letter" }
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, error: "Password must contain at least one number" }
  }

  // Check for common weak passwords
  const commonPasswords = ['password', '12345678', 'qwerty123', 'abc12345']
  if (commonPasswords.includes(password.toLowerCase())) {
    return { valid: false, error: "Password is too common. Please choose a stronger password" }
  }

  return { valid: true }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { valid: false, error: "Email is required" }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, error: "Please enter a valid email address" }
  }

  return { valid: true }
}

/**
 * Sanitize HTML content to prevent XSS attacks
 * Removes all HTML tags except safe ones
 */
export function sanitizeHTML(html: string): string {
  if (!html) return ''
  
  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '')
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '')
  
  // Remove data: protocol (can be used for XSS)
  sanitized = sanitized.replace(/data:text\/html/gi, '')
  
  return sanitized
}

/**
 * Sanitize plain text input (for names, subjects, etc.)
 */
export function sanitizeText(text: string): string {
  if (!text) return ''
  
  // Remove any HTML tags
  let sanitized = text.replace(/<[^>]*>/g, '')
  
  // Trim whitespace
  sanitized = sanitized.trim()
  
  return sanitized
}

/**
 * Validate name (first name, last name)
 */
export function validateName(name: string, fieldName: string = 'Name'): ValidationResult {
  if (!name || !name.trim()) {
    return { valid: false, error: `${fieldName} is required` }
  }

  if (name.trim().length < 1) {
    return { valid: false, error: `${fieldName} must be at least 1 character` }
  }

  if (name.length > 100) {
    return { valid: false, error: `${fieldName} must be less than 100 characters` }
  }

  // Check for potentially malicious input
  if (/<[^>]*>/.test(name)) {
    return { valid: false, error: `${fieldName} contains invalid characters` }
  }

  return { valid: true }
}

