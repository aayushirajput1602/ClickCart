import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import type { Wishlist } from "@/lib/models"

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
    const wishlists = db.collection<Wishlist>("wishlists")

    const wishlist = await wishlists.findOne({ userId: new ObjectId(userId) })

    return NextResponse.json({
      items: wishlist?.items || [],
    })
  } catch (error) {
    console.error("Get wishlist error:", error)
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
    const wishlists = db.collection<Wishlist>("wishlists")

    let wishlist = await wishlists.findOne({ userId: new ObjectId(userId) })

    if (!wishlist) {
      wishlist = {
        userId: new ObjectId(userId),
        items: [],
        updatedAt: new Date(),
      }
    }

    switch (action) {
      case "add":
        const exists = wishlist.items.some((wishlistItem) => wishlistItem.productId === item.productId)
        if (!exists) {
          wishlist.items.push(item)
        }
        break

      case "remove":
        wishlist.items = wishlist.items.filter((wishlistItem) => wishlistItem.productId !== item.productId)
        break

      case "clear":
        wishlist.items = []
        break
    }

    wishlist.updatedAt = new Date()

    await wishlists.replaceOne({ userId: new ObjectId(userId) }, wishlist, { upsert: true })

    return NextResponse.json({
      items: wishlist.items,
    })
  } catch (error) {
    console.error("Wishlist operation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
