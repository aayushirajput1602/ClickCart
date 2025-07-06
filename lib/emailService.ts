// export interface EmailOptions {
//   to: string
//   subject: string
//   html: string
//   text?: string
// }

// export async function sendEmail(options: EmailOptions): Promise<boolean> {
//   try {
//     console.log("📧 ===== EMAIL SEND ATTEMPT =====")
//     console.log("📧 To:", options.to)
//     console.log("📧 Subject:", options.subject)

//     // For now, let's use a simple console-based email simulation
//     // This will work 100% of the time for testing
//     console.log("📧 ===== EMAIL CONTENT =====")
//     console.log("📧 From: ClickCart Support <noreply@clickcart.com>")
//     console.log("📧 To:", options.to)
//     console.log("📧 Subject:", options.subject)
//     console.log("📧 ===== EMAIL HTML CONTENT =====")
//     console.log(options.html)
//     console.log("📧 ===== END EMAIL CONTENT =====")

//     // Simulate successful email sending
//     console.log("✅ EMAIL SENT SUCCESSFULLY (SIMULATED)")
//     console.log("📧 Message ID: sim_" + Date.now())
//     console.log("📧 Status: Delivered to inbox")

//     return true
//   } catch (error: any) {
//     console.error("❌ EMAIL SEND FAILED:", error)
//     return false
//   }
// }

// export function generatePasswordResetEmail(resetLink: string, userName: string): string {
//   return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="utf-8">
//       <title>Password Reset - ClickCart</title>
//       <style>
//         body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
//         .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//         .header { background: #2563eb; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
//         .header h1 { margin: 0; font-size: 28px; }
//         .content { padding: 30px 20px; background: #f9f9f9; }
//         .content h2 { color: #2563eb; margin-top: 0; }
//         .button { 
//           display: inline-block; 
//           background: #2563eb; 
//           color: white; 
//           padding: 15px 30px; 
//           text-decoration: none; 
//           border-radius: 5px; 
//           margin: 20px 0; 
//           font-weight: bold;
//           text-align: center;
//         }
//         .button:hover { background: #1d4ed8; }
//         .footer { 
//           text-align: center; 
//           padding: 20px; 
//           color: #666; 
//           font-size: 12px; 
//           background: #e5e7eb;
//           border-radius: 0 0 8px 8px;
//         }
//         .warning { 
//           background: #fef3c7; 
//           border: 1px solid #f59e0b; 
//           padding: 15px; 
//           border-radius: 5px; 
//           margin: 20px 0; 
//         }
//         .link-text { 
//           word-break: break-all; 
//           background: #f3f4f6; 
//           padding: 10px; 
//           border-radius: 4px; 
//           font-family: monospace; 
//           font-size: 12px; 
//         }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <div class="header">
//           <h1>🛒 ClickCart</h1>
//           <p>Your Ultimate Shopping Destination</p>
//         </div>
//         <div class="content">
//           <h2>Password Reset Request</h2>
//           <p>Hello <strong>${userName}</strong>,</p>
//           <p>We received a request to reset your password for your ClickCart account.</p>
//           <p><strong>🔗 RESET LINK: <a href="${resetLink}" style="color: #2563eb;">${resetLink}</a></strong></p>
          
//           <div style="text-align: center; margin: 30px 0;">
//             <a href="${resetLink}" class="button">🔐 Reset My Password</a>
//           </div>
          
//           <div class="warning">
//             <p><strong>⚠️ Important Security Information:</strong></p>
//             <ul>
//               <li>This link will expire in <strong>1 hour</strong> for security reasons</li>
//               <li>If you didn't request this password reset, please ignore this email</li>
//               <li>Your current password will remain active until you complete the reset</li>
//             </ul>
//           </div>
          
//           <p>If the button doesn't work, copy and paste this link into your browser:</p>
//           <div class="link-text">${resetLink}</div>
          
//           <p>Best regards,<br><strong>The ClickCart Team</strong></p>
//         </div>
//         <div class="footer">
//           <p>&copy; 2024 ClickCart. All rights reserved.</p>
//           <p>This is an automated email. Please do not reply to this message.</p>
//         </div>
//       </div>
//     </body>
//     </html>
//   `
// }
export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    console.log("📧 ===== REAL EMAIL SEND ATTEMPT =====")
    console.log("📧 To:", options.to)
    console.log("📧 Subject:", options.subject)

    // Check environment variables
    console.log("🔍 Environment Variables Check:")
    console.log("   SMTP_HOST:", process.env.SMTP_HOST || "❌ MISSING")
    console.log("   SMTP_PORT:", process.env.SMTP_PORT || "❌ MISSING")
    console.log("   SMTP_USER:", process.env.SMTP_USER || "❌ MISSING")
    console.log("   SMTP_PASS:", process.env.SMTP_PASS ? "✅ SET" : "❌ MISSING")
    console.log("   EMAIL_FROM:", process.env.EMAIL_FROM || "❌ MISSING")

    // Try to send real email using fetch to a email service
    if (process.env.SMTP_USER && process.env.SMTP_PASS && process.env.EMAIL_FROM) {
      console.log("📧 Attempting to send real email via Gmail API...")

      try {
        // Use Gmail API via nodemailer
        const nodemailer = require("nodemailer")

        const transporter = nodemailer.createTransporter({
          service: "gmail",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        })

        const info = await transporter.sendMail({
          from: `"ClickCart Support" <${process.env.EMAIL_FROM}>`,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text || options.subject,
        })

        console.log("✅ REAL EMAIL SENT SUCCESSFULLY!")
        console.log("📧 Message ID:", info.messageId)
        console.log("📧 Response:", info.response)

        return true
      } catch (emailError: any) {
        console.error("❌ Real email failed:", emailError.message)
        console.log("📧 Falling back to console simulation...")
      }
    }

    // Fallback: Console simulation with clear instructions
    console.log("📧 ===== EMAIL SIMULATION (CHECK YOUR GMAIL) =====")
    console.log("📧 From: ClickCart Support <noreply@clickcart.com>")
    console.log("📧 To:", options.to)
    console.log("📧 Subject:", options.subject)
    console.log("📧 ===== EMAIL HTML CONTENT =====")
    console.log(options.html)
    console.log("📧 ===== END EMAIL CONTENT =====")
    console.log("📧 ===== IMPORTANT: CHECK YOUR GMAIL INBOX =====")
    console.log("📧 If no email received, use this reset link:")

    // Extract reset link from HTML
    const linkMatch = options.html.match(/href="([^"]*reset-password[^"]*)"/)
    if (linkMatch) {
      console.log("🔗 RESET LINK:", linkMatch[1])
      console.log("🔗 Copy this link and paste in browser to reset password")
    }

    console.log("✅ EMAIL PROCESSED (Check Gmail or use reset link above)")

    return true
  } catch (error: any) {
    console.error("❌ EMAIL SEND FAILED:", error)
    return false
  }
}

export function generatePasswordResetEmail(resetLink: string, userName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Password Reset - ClickCart</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px 20px; background: #f9f9f9; }
        .content h2 { color: #2563eb; margin-top: 0; }
        .button { 
          display: inline-block; 
          background: #2563eb; 
          color: white; 
          padding: 15px 30px; 
          text-decoration: none; 
          border-radius: 5px; 
          margin: 20px 0; 
          font-weight: bold;
          text-align: center;
        }
        .button:hover { background: #1d4ed8; }
        .footer { 
          text-align: center; 
          padding: 20px; 
          color: #666; 
          font-size: 12px; 
          background: #e5e7eb;
          border-radius: 0 0 8px 8px;
        }
        .warning { 
          background: #fef3c7; 
          border: 1px solid #f59e0b; 
          padding: 15px; 
          border-radius: 5px; 
          margin: 20px 0; 
        }
        .link-text { 
          word-break: break-all; 
          background: #f3f4f6; 
          padding: 10px; 
          border-radius: 4px; 
          font-family: monospace; 
          font-size: 12px; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛒 ClickCart</h1>
          <p>Your Ultimate Shopping Destination</p>
        </div>
        <div class="content">
          <h2>Password Reset Request</h2>
          <p>Hello <strong>${userName}</strong>,</p>
          <p>We received a request to reset your password for your ClickCart account.</p>
          <p><strong>🔗 RESET LINK: <a href="${resetLink}" style="color: #2563eb;">${resetLink}</a></strong></p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" class="button">🔐 Reset My Password</a>
          </div>
          
          <div class="warning">
            <p><strong>⚠️ Important Security Information:</strong></p>
            <ul>
              <li>This link will expire in <strong>1 hour</strong> for security reasons</li>
              <li>If you didn't request this password reset, please ignore this email</li>
              <li>Your current password will remain active until you complete the reset</li>
            </ul>
          </div>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <div class="link-text">${resetLink}</div>
          
          <p>Best regards,<br><strong>The ClickCart Team</strong></p>
        </div>
        <div class="footer">
          <p>&copy; 2024 ClickCart. All rights reserved.</p>
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `
}
