import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const hasKey = !!process.env.STRIPE_SECRET_KEY
    const keyPrefix = process.env.STRIPE_SECRET_KEY?.substring(0, 10)
    
    if (!hasKey) {
      return NextResponse.json({
        status: 'error',
        message: 'STRIPE_SECRET_KEY not set'
      })
    }

    // Try basic Stripe import
    const Stripe = require('stripe')
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    
    // Simple API call
    const products = await stripe.products.list({ limit: 1 })
    
    return NextResponse.json({
      status: 'success',
      key_prefix: keyPrefix,
      stripe_initialized: true,
      api_test: 'passed',
      products_count: products.data.length
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode,
    }, { status: 500 })
  }
}
