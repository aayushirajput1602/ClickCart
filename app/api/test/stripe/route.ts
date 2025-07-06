import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export async function GET() {
  try {
    console.log("🧪 Testing Stripe API connection...")

    // Test basic Stripe API connectivity
    const account = await stripe.accounts.retrieve()

    console.log("✅ Stripe API test successful!")
    console.log("   Account ID:", account.id)
    console.log("   Country:", account.country)
    console.log("   Currency:", account.default_currency)

    return NextResponse.json({
      success: true,
      message: "Stripe API connection successful",
      account: {
        id: account.id,
        country: account.country,
        currency: account.default_currency,
      },
    })
  } catch (error: any) {
    console.error("❌ Stripe API test failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        type: error.type,
      },
      { status: 500 },
    )
  }
}
