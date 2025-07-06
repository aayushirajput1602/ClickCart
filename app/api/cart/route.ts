import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import type { Cart } from "@/lib/models"

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
    const carts = db.collection<Cart>("carts")

    const cart = await carts.findOne({ userId: new ObjectId(userId) })

    return NextResponse.json({
      items: cart?.items || [],
    })
  } catch (error) {
    console.error("Get cart error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action, item } = await request.json()

    const client = await clientPromise
    const db = client.db("ecommerce")
    const carts = db.collection<Cart>("carts")

    let cart = await carts.findOne({ userId: new ObjectId(userId) })

    if (!cart) {
      cart = {
        userId: new ObjectId(userId),
        items: [],
        updatedAt: new Date(),
      }
    }

    switch (action) {
      case "add":
        const existingItemIndex = cart.items.findIndex((cartItem) => cartItem.productId === item.productId)

        if (existingItemIndex > -1) {
          cart.items[existingItemIndex].quantity += 1
        } else {
          cart.items.push({ ...item, quantity: 1 })
        }
        break

      case "remove":
        cart.items = cart.items.filter((cartItem) => cartItem.productId !== item.productId)
        break

      case "updateQuantity":
        const itemIndex = cart.items.findIndex((cartItem) => cartItem.productId === item.productId)
        if (itemIndex > -1) {
          if (item.quantity <= 0) {
            cart.items.splice(itemIndex, 1)
          } else {
            cart.items[itemIndex].quantity = item.quantity
          }
        }
        break

      case "clear":
        cart.items = []
        break
    }

    cart.updatedAt = new Date()

    await carts.replaceOne({ userId: new ObjectId(userId) }, cart, { upsert: true })

    return NextResponse.json({
      items: cart.items,
    })
  } catch (error) {
    console.error("Cart operation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
