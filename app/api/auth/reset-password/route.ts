import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({ message: "API is working!" })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, newPassword } = body

    if (!email || !newPassword) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    // Simulate success
    return NextResponse.json({ message: "Password reset successful!" })
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
