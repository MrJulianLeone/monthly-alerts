"use server"

import { createUser, verifyUser, createSession, logout as logoutUser } from "@/lib/auth"

export async function signup(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string

  console.log("[v0] Signup action called with email:", email)

  if (!email || !password || !name) {
    console.log("[v0] Missing required fields")
    return { error: "All fields are required" }
  }

  try {
    console.log("[v0] Creating user...")
    const user = await createUser(email, password, name)
    console.log("[v0] User created successfully:", user.id)

    console.log("[v0] Creating session...")
    await createSession(user.id)
    console.log("[v0] Session created successfully")

    return { success: true }
  } catch (error: any) {
    console.log("[v0] Signup error:", error)

    if (error?.message?.includes("duplicate key") || error?.message?.includes("users_email_key")) {
      return { error: "An account with this email already exists. Please login instead." }
    }

    return { error: "Signup failed. Please try again." }
  }
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  console.log("[v0] Login action called with email:", email)

  if (!email || !password) {
    console.log("[v0] Missing required fields")
    return { error: "Email and password are required" }
  }

  const user = await verifyUser(email, password)

  if (!user) {
    console.log("[v0] Invalid email or password")
    return { error: "Invalid email or password" }
  }

  console.log("[v0] User verified successfully:", user.id)

  await createSession(user.id)
  console.log("[v0] Session created successfully")

  return { success: true }
}

export async function logout() {
  console.log("[v0] Logout action called")
  await logoutUser()
  console.log("[v0] User logged out")

  return { success: true }
}
