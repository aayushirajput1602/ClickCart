import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { cookies } from "next/headers"
import clientPromise from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import type { Order } from "@/lib/models"

async function getUserFromToken(request: NextRequest) {
  try {
    let token = null

    // Method 1: Authorization header
    const authHeader = request.headers.get("authorization")
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.replace("Bearer ", "")
      console.log("🔑 Token found in Authorization header")
    }

    // Method 2: URL parameters
    if (!token) {
      const url = new URL(request.url)
      token = url.searchParams.get("token")
      if (token) {
        console.log("🔑 Token found in URL parameters")
      }
    }

    // Method 3: Cookies (using Next.js cookies helper)
    if (!token) {
      try {
        const cookieStore = cookies()
        token = cookieStore.get("auth-token")?.value
        if (token) {
          console.log("🔑 Token found in cookies")
        }
      } catch (cookieError) {
        console.log("⚠️ Cookie reading failed:", cookieError)
      }
    }

    // Method 4: Manual cookie parsing from headers
    if (!token) {
      const cookieHeader = request.headers.get("cookie")
      if (cookieHeader) {
        const cookies = cookieHeader.split(";").reduce(
          (acc, cookie) => {
            const [key, value] = cookie.trim().split("=")
            acc[key] = value
            return acc
          },
          {} as Record<string, string>,
        )
        token = cookies["auth-token"]
        if (token) {
          console.log("🔑 Token found in manual cookie parsing")
        }
      }
    }

    if (!token) {
      console.log("❌ No authentication token found anywhere")
      console.log("   - Authorization header:", !!authHeader)
      console.log("   - Cookie header:", !!request.headers.get("cookie"))
      console.log("   - URL params:", !!new URL(request.url).searchParams.get("token"))
      return null
    }

    console.log("🔑 Verifying token...")
    const decoded = verifyToken(token)
    if (!decoded) {
      console.log("❌ Token verification failed")
      return null
    }

    console.log("✅ Token verified for user:", decoded.userId)
    return decoded.userId
  } catch (error) {
    console.error("❌ Token verification error:", error)
    return null
  }
}

function generateInvoiceHTML(order: Order, user: any): string {
  const invoiceDate = new Date().toLocaleDateString()
  const orderDate = new Date(order.createdAt).toLocaleDateString()

  // Calculate totals safely
  const subtotal = order.items?.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0) || 0
  const shipping = order.shipping || 0
  const tax = order.tax || subtotal * 0.08
  const total = subtotal + shipping + tax

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice - ${order.orderNumber || "N/A"}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; line-height: 1.6; }
        .invoice-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
        .logo { font-size: 28px; font-weight: bold; color: #2563eb; }
        .invoice-info { text-align: right; }
        .invoice-details { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
        .section { background: #f9f9f9; padding: 20px; border-radius: 8px; }
        .section h3 { margin: 0 0 15px 0; color: #2563eb; font-size: 16px; }
        .items-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
        .items-table th, .items-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .items-table th { background: #2563eb; color: white; }
        .items-table tr:nth-child(even) { background: #f9f9f9; }
        .totals { margin-top: 30px; text-align: right; }
        .totals table { margin-left: auto; border-collapse: collapse; }
        .totals td { padding: 8px 15px; border-bottom: 1px solid #ddd; }
        .total-row { font-weight: bold; font-size: 18px; background: #2563eb; color: white; }
        .footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
        .status-delivered { background: #10b981; color: white; }
        .status-shipped { background: #8b5cf6; color: white; }
        .status-processing { background: #3b82f6; color: white; }
        .status-pending { background: #f59e0b; color: white; }
        .status-cancelled { background: #6b7280; color: white; }
        .status-refunded { background: #f97316; color: white; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <div class="invoice-header">
        <div>
          <div class="logo">ClickCart</div>
          <p>Your Ultimate Shopping Destination</p>
        </div>
        <div class="invoice-info">
          <h2>INVOICE</h2>
          <p><strong>Invoice Date:</strong> ${invoiceDate}</p>
          <p><strong>Order Number:</strong> ${order.orderNumber || "N/A"}</p>
          <p><strong>Status:</strong> <span class="status-badge status-${order.status || "pending"}">${order.status || "pending"}</span></p>
        </div>
      </div>

      <div class="invoice-details">
        <div class="section">
          <h3>Bill To:</h3>
          <p><strong>${order.shippingAddress?.firstName || user?.firstName || "Customer"} ${order.shippingAddress?.lastName || user?.lastName || ""}</strong></p>
          <p>${order.shippingAddress?.email || user?.email || "N/A"}</p>
          ${order.shippingAddress?.address ? `<p>${order.shippingAddress.address}</p>` : ""}
          ${order.shippingAddress?.city ? `<p>${order.shippingAddress.city}, ${order.shippingAddress.state || ""} ${order.shippingAddress.zipCode || ""}</p>` : ""}
          ${order.shippingAddress?.country ? `<p>${order.shippingAddress.country}</p>` : ""}
        </div>
        
        <div class="section">
          <h3>Order Details:</h3>
          <p><strong>Order Date:</strong> ${orderDate}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod ? order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1) : "N/A"}</p>
          ${order.paymentIntentId ? `<p><strong>Payment ID:</strong> ${order.paymentIntentId}</p>` : ""}
          ${order.refundId ? `<p><strong>Refund ID:</strong> ${order.refundId}</p>` : ""}
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${(order.items || [])
            .map(
              (item) => `
            <tr>
              <td>
                <strong>${item.name || "Unknown Item"}</strong><br>
                <small>${item.description || "No description"}</small>
              </td>
              <td>${item.quantity || 0}</td>
              <td>$${(item.price || 0).toFixed(2)}</td>
              <td>$${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>

      <div class="totals">
        <table>
          <tr>
            <td>Subtotal:</td>
            <td>$${subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Shipping:</td>
            <td>${shipping === 0 ? "Free" : "$" + shipping.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Tax:</td>
            <td>$${tax.toFixed(2)}</td>
          </tr>
          <tr class="total-row">
            <td>Total:</td>
            <td>$${total.toFixed(2)}</td>
          </tr>
        </table>
      </div>

      <div class="footer">
        <p>Thank you for shopping with ClickCart!</p>
        <p>For questions about this invoice, please contact our customer service.</p>
        <p>&copy; 2024 ClickCart. All rights reserved.</p>
      </div>
    </body>
    </html>
  `
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("📄 Invoice request for order:", params.id)
    console.log("📄 Request URL:", request.url)
    console.log("📄 Request headers:", Object.fromEntries(request.headers.entries()))

    const userId = await getUserFromToken(request)
    if (!userId) {
      console.log("❌ Unauthorized invoice request")
      return NextResponse.json(
        {
          error: "Unauthorized - Please login to view invoice",
          debug: {
            hasAuthHeader: !!request.headers.get("authorization"),
            hasCookies: !!request.headers.get("cookie"),
            cookieContent: request.headers.get("cookie"),
            method: request.method,
            url: request.url,
          },
        },
        { status: 401 },
      )
    }

    console.log("✅ Authorized user:", userId)

    const client = await clientPromise
    const db = client.db("ecommerce")
    const orders = db.collection<Order>("orders")
    const users = db.collection("users")

    // Find the order
    const order = await orders.findOne({
      _id: new ObjectId(params.id),
      userId: new ObjectId(userId),
    })

    if (!order) {
      console.log("❌ Order not found:", params.id)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    console.log("✅ Order found:", order.orderNumber)

    // Get user info
    const user = await users.findOne({ _id: new ObjectId(userId) })

    // Generate invoice HTML
    const invoiceHTML = generateInvoiceHTML(order, user)

    console.log("✅ Invoice generated successfully")

    // Return HTML response
    return new NextResponse(invoiceHTML, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `inline; filename="invoice-${order.orderNumber || params.id}.html"`,
        "Cache-Control": "no-cache",
      },
    })
  } catch (error) {
    console.error("❌ Generate invoice error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
