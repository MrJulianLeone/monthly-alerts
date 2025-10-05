import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY
    
    if (!stripeKey) {
      return NextResponse.json({ error: 'No Stripe key' })
    }

    // Test direct API call to Stripe
    const response = await fetch('https://api.stripe.com/v1/balance', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({
        status: 'error',
        http_status: response.status,
        stripe_error: data
      }, { status: 500 })
    }

    return NextResponse.json({
      status: 'success',
      message: 'Direct Stripe API call successful',
      balance: data,
      key_prefix: stripeKey.substring(0, 15)
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      name: error.name,
    }, { status: 500 })
  }
}
