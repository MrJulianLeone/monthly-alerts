"use server"

import { createUser, verifyUser, createSession, logout as logoutUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { validatePassword, validateEmail, validateName, sanitizeText } from "@/lib/validation"

export async function signup(formData: FormData) {
  const email = (formData.get("email") as string)?.trim()
  const password = formData.get("password") as string
  const firstName = sanitizeText(formData.get("firstName") as string)
  const lastName = sanitizeText(formData.get("lastName") as string)

  console.log("[v0] Signup action called with email:", email)

  // Validate all fields
  if (!email || !password || !firstName || !lastName) {
    console.log("[v0] Missing required fields")
    return { error: "All fields are required" }
  }

  // Validate email
  const emailValidation = validateEmail(email)
  if (!emailValidation.valid) {
    return { error: emailValidation.error }
  }

  // Validate password strength
  const passwordValidation = validatePassword(password)
  if (!passwordValidation.valid) {
    return { error: passwordValidation.error }
  }

  // Validate names
  const firstNameValidation = validateName(firstName, "First name")
  if (!firstNameValidation.valid) {
    return { error: firstNameValidation.error }
  }

  const lastNameValidation = validateName(lastName, "Last name")
  if (!lastNameValidation.valid) {
    return { error: lastNameValidation.error }
  }

  try {
    console.log("[v0] Creating user...")
    const user = await createUser(email, password, firstName, lastName)
    console.log("[v0] User created successfully:", user.id)

    console.log("[v0] Creating session...")
    await createSession(user.id)
    console.log("[v0] Session created successfully")

    // Send email verification
    console.log("[v0] Sending verification email...")
    const { sendVerificationEmail } = await import("./email-verification")
    await sendVerificationEmail(user.id, email, firstName)
    console.log("[v0] Verification email sent")

    redirect("/dashboard?verify=pending")
  } catch (error: any) {
    console.log("[v0] Signup error:", error)

    if (error?.message?.includes("duplicate key") || error?.message?.includes("users_email_key")) {
      return { error: "An account with this email already exists. Please login instead." }
    }

    return { error: "Signup failed. Please try again." }
  }
}

export async function login(formData: FormData) {
  const email = (formData.get("email") as string)?.trim()
  const password = formData.get("password") as string

  console.log("[v0] Login action called with email:", email)

  if (!email || !password) {
    console.log("[v0] Missing required fields")
    return { error: "Email and password are required" }
  }

  // Rate limiting check
  const { checkRateLimit, clearRateLimit } = await import("@/lib/rate-limit")
  const rateLimit = await checkRateLimit(email, "login", 5, 15)
  
  if (!rateLimit.allowed) {
    console.log("[v0] Rate limit exceeded for:", email)
    const minutes = Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 60000)
    return { error: `Too many login attempts. Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.` }
  }

  const user = await verifyUser(email, password)

  if (!user) {
    console.log("[v0] Invalid email or password")
    return { error: "Invalid email or password" }
  }

  console.log("[v0] User verified successfully:", user.id)

  // Clear rate limit on successful login
  await clearRateLimit(email, "login")

  await createSession(user.id)
  console.log("[v0] Session created successfully")

  redirect("/dashboard")
}

export async function logout() {
  console.log("[v0] Logout action called")
  await logoutUser()
  console.log("[v0] User logged out")

  redirect("/")
}
