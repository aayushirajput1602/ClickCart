import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { generateResetToken, generateResetTokenExpiry } from "@/lib/auth"
import { sendEmail, generatePasswordResetEmail } from "@/lib/emailService"
import type { User } from "@/lib/models"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    console.log("🔐 Processing password reset for:", email)

    let client
    let db
    let users

    try {
      client = await clientPromise
      db = client.db("ecommerce")
      users = db.collection<User>("users")
      console.log("✅ Database connection successful")
    } catch (dbError) {
      console.error("❌ Database connection failed:", dbError)
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    // Find user by email
    let user
    try {
      user = await users.findOne({ email })
      console.log("👤 User lookup result:", user ? "Found" : "Not found")
    } catch (userError) {
      console.error("❌ User lookup failed:", userError)
      return NextResponse.json({ error: "Database query failed" }, { status: 500 })
    }

    if (!user) {
      // Don't reveal if email exists or not for security
      console.log("⚠️ User not found, but returning success for security")
      return NextResponse.json({
        message: "If the email exists, a reset link has been sent.",
        success: true,
      })
    }

    // Generate reset token
    const resetToken = generateResetToken()
    const resetExpires = generateResetTokenExpiry()

    console.log("🔑 Generated reset token for user:", user.email)

    // Update user with reset token
    try {
      await users.updateOne(
        { _id: user._id },
        {
          $set: {
            resetPasswordToken: resetToken,
            resetPasswordExpires: resetExpires,
            updatedAt: new Date(),
          },
        },
      )
      console.log("✅ Reset token saved to database")
    } catch (updateError) {
      console.error("❌ Failed to save reset token:", updateError)
      return NextResponse.json({ error: "Failed to process reset request" }, { status: 500 })
    }

    // Generate reset link
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`

    // Send email
    const emailHtml = generatePasswordResetEmail(resetLink, user.name || user.firstName || "User")

    console.log("📧 Attempting to send email...")
    const emailSent = await sendEmail({
      to: email,
      subject: "Password Reset - ClickCart",
      html: emailHtml,
      text: `Reset your ClickCart password by clicking this link: ${resetLink}`,
    })

    if (emailSent) {
      console.log("✅ Password reset email sent successfully to:", email)
    } else {
      console.log("⚠️ Email sending failed, but reset token is still valid")
    }

    return NextResponse.json({
      message: "Password reset email sent successfully!",
      success: true,
      // For demo purposes, include the reset link in development
      resetLink: process.env.NODE_ENV === "development" ? resetLink : undefined,
    })
  } catch (error) {
    console.error("❌ Forgot password error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
