import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import type { OrderCancellation } from "@/lib/models"

async function getUserFromToken(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return null

  const decoded = verifyToken(token)
  return decoded ? decoded.userId : null
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("ecommerce")
    const orderCancellations = db.collection<OrderCancellation>("orderCancellations")

    // Get all cancellations (in a real app, you'd add admin role check)
    const cancellations = await orderCancellations.find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({
      cancellations: cancellations.map((cancellation) => ({
        ...cancellation,
        _id: cancellation._id?.toString(),
        orderId: cancellation.orderId?.toString(),
        userId: cancellation.userId?.toString(),
      })),
    })
  } catch (error) {
    console.error("Get cancellations error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
