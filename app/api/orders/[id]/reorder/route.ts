import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import type { Order, Product, CartItem } from "@/lib/models"

async function getUserFromToken(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return null

  const decoded = verifyToken(token)
  return decoded ? decoded.userId : null
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("🔄 Processing reorder for order:", params.id)

    const userId = await getUserFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("ecommerce")
    const orders = db.collection<Order>("orders")
    const products = db.collection<Product>("products")
    const carts = db.collection("carts")

    // Find the order
    const order = await orders.findOne({
      _id: new ObjectId(params.id),
      userId: new ObjectId(userId),
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    console.log("✅ Order found:", order.orderNumber)
    console.log("📦 Items to reorder:", order.items.length)

    const addedItems: any[] = []
    const unavailableItems: any[] = []

    // Get current cart
    let cart = await carts.findOne({ userId: new ObjectId(userId) })
    if (!cart) {
      cart = {
        userId: new ObjectId(userId),
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      await carts.insertOne(cart)
    }

    // Process each item from the order
    for (const orderItem of order.items) {
      console.log(`🔍 Processing item: ${orderItem.name} (ID: ${orderItem.productId})`)

      // Find current product info
      const currentProduct = await products.findOne({ id: orderItem.productId })

      if (!currentProduct) {
        console.log(`❌ Product not found: ${orderItem.productId}`)
        unavailableItems.push({
          ...orderItem,
          reason: "Product no longer available",
        })
        continue
      }

      if (!currentProduct.inStock || currentProduct.stock <= 0) {
        console.log(`❌ Product out of stock: ${orderItem.productId}`)
        unavailableItems.push({
          ...orderItem,
          reason: "Out of stock",
        })
        continue
      }

      // Determine quantity to add (use available stock if less than requested)
      const requestedQuantity = orderItem.quantity
      const availableQuantity = Math.min(requestedQuantity, currentProduct.stock)

      if (availableQuantity < requestedQuantity) {
        console.log(
          `⚠️ Limited stock for ${orderItem.productId}: requested ${requestedQuantity}, available ${availableQuantity}`,
        )
      }

      // Check if item already exists in cart
      const existingCartItemIndex = cart.items.findIndex((item: any) => item.productId === orderItem.productId)

      if (existingCartItemIndex >= 0) {
        // Update existing cart item
        const existingItem = cart.items[existingCartItemIndex]
        const newQuantity = existingItem.quantity + availableQuantity

        // Make sure we don't exceed stock
        const finalQuantity = Math.min(newQuantity, currentProduct.stock)

        cart.items[existingCartItemIndex] = {
          ...existingItem,
          quantity: finalQuantity,
          price: currentProduct.price, // Use current price
          updatedAt: new Date(),
        }

        console.log(`✅ Updated existing cart item: ${orderItem.productId}, new quantity: ${finalQuantity}`)
      } else {
        // Add new cart item
        const newCartItem: CartItem = {
          productId: orderItem.productId,
          name: currentProduct.name,
          price: currentProduct.price, // Use current price, not historical
          quantity: availableQuantity,
          image: currentProduct.image,
          description: currentProduct.description,
          addedAt: new Date(),
        }

        cart.items.push(newCartItem)
        console.log(`✅ Added new cart item: ${orderItem.productId}, quantity: ${availableQuantity}`)
      }

      addedItems.push({
        productId: orderItem.productId,
        name: currentProduct.name,
        quantity: availableQuantity,
        price: currentProduct.price,
        originalQuantity: requestedQuantity,
      })

      // If we couldn't add the full requested quantity
      if (availableQuantity < requestedQuantity) {
        unavailableItems.push({
          ...orderItem,
          reason: `Only ${availableQuantity} of ${requestedQuantity} available`,
          partiallyAdded: true,
        })
      }
    }

    // Update cart in database
    await carts.updateOne(
      { userId: new ObjectId(userId) },
      {
        $set: {
          items: cart.items,
          updatedAt: new Date(),
        },
      },
    )

    const totalItemsAdded = addedItems.reduce((sum, item) => sum + item.quantity, 0)

    console.log("🎉 Reorder completed:")
    console.log(`   - Items added: ${addedItems.length}`)
    console.log(`   - Total quantity added: ${totalItemsAdded}`)
    console.log(`   - Unavailable items: ${unavailableItems.length}`)

    return NextResponse.json({
      success: true,
      message: `${totalItemsAdded} items added to cart`,
      addedItems,
      unavailableItems,
      totalItemsAdded,
      summary: {
        totalItemsProcessed: order.items.length,
        itemsAdded: addedItems.length,
        itemsUnavailable: unavailableItems.length,
        totalQuantityAdded: totalItemsAdded,
      },
    })
  } catch (error) {
    console.error("❌ Reorder error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
