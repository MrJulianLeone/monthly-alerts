import "server-only"
import Stripe from "stripe"
import "./env"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
  timeout: 10000, // 10 second timeout
  maxNetworkRetries: 2,
})
