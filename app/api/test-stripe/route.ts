import { NextResponse } from 'next/server'
import { stripe } from "@/lib/stripe"

export async function GET() {
  try {
    // Test 1: Stripe connection
    const balance = await stripe.balance.retrieve()
    
    // Test 2: Create test customer
    const testCustomer = await stripe.customers.create({
      email: 'test@example.com',
      metadata: { test: 'true' }
    })
    
    // Test 3: Create test checkout session
    const testSession = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      customer: testCustomer.id,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Test Product",
            },
            unit_amount: 2900,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      return_url: `https://monthlyalerts.com/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    })
    
    // Cleanup
    await stripe.customers.del(testCustomer.id)
    
    return NextResponse.json({
      status: 'success',
      stripe: 'connected',
      balance_available: balance.available?.[0]?.amount || 0,
      customer_created: testCustomer.id,
      session_created: testSession.id,
      client_secret_exists: !!testSession.client_secret,
      tests_passed: true
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      type: error.type,
      code: error.code,
      raw: error.raw?.message,
    }, { status: 500 })
  }
}
