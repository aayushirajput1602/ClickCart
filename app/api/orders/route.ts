import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import type { Order, Product } from "@/lib/models"

async function getUserFromToken(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return null

  const decoded = verifyToken(token)
  return decoded ? decoded.userId : null
}

function generateOrderNumber(): string {
  return "ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase()
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("ecommerce")
    const orders = db.collection<Order>("orders")

    const userOrders = await orders
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({
      orders: userOrders.map((order) => ({
        ...order,
        _id: order._id?.toString(),
      })),
    })
  } catch (error) {
    console.error("Get orders error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orderData = await request.json()
    console.log(
      "Processing order with items:",
      orderData.items.map((item: any) => ({ productId: item.productId, name: item.name, quantity: item.quantity })),
    )

    const client = await clientPromise
    const db = client.db("ecommerce")
    const orders = db.collection<Order>("orders")
    const products = db.collection<Product>("products")

    // First, let's check what products are actually in the database
    const totalProductCount = await products.countDocuments()
    console.log("Total products in database:", totalProductCount)

    // Validate stock availability before processing order
    for (const item of orderData.items) {
      console.log(`Looking for product: ${item.productId}`)

      // Try to find product by id field first
      let product = await products.findOne({ id: item.productId })
      console.log(`Product found by id "${item.productId}":`, product ? "YES" : "NO")

      // If not found by id, try by _id (in case productId is an ObjectId string)
      if (!product && ObjectId.isValid(item.productId)) {
        product = await products.findOne({ _id: new ObjectId(item.productId) })
        console.log(`Product found by _id "${item.productId}":`, product ? "YES" : "NO")
      }

      // If still not found, let's search for similar products
      if (!product) {
        const similarProducts = await products
          .find({
            $or: [
              { id: { $regex: item.productId, $options: "i" } },
              { name: { $regex: item.name || "", $options: "i" } },
            ],
          })
          .limit(3)
          .toArray()

        console.log(
          `Similar products found for "${item.productId}":`,
          similarProducts.map((p) => ({ id: p.id, name: p.name })),
        )

        // Let's also check all product IDs in the database
        const allProductIds = await products.find({}).project({ id: 1, _id: 1 }).toArray()
        console.log(
          "All product IDs in database:",
          allProductIds.slice(0, 10).map((p) => ({ id: p.id, _id: p._id?.toString() })),
        )
      }

      if (!product) {
        console.error(`Product not found: ${item.productId}`)
        return NextResponse.json(
          {
            error: `Product ${item.productId} not found`,
            debug: {
              searchedId: item.productId,
              totalProducts: totalProductCount,
              isValidObjectId: ObjectId.isValid(item.productId),
            },
          },
          { status: 400 },
        )
      }

      if (!product.inStock || product.stock < item.quantity) {
        console.error(
          `Insufficient stock for product ${item.productId}: available=${product.stock}, requested=${item.quantity}`,
        )
        return NextResponse.json(
          {
            error: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
          },
          { status: 400 },
        )
      }
    }

    // Update product stock and mark as out of stock if needed
    const stockUpdates = []
    for (const item of orderData.items) {
      // Try to find product by id field first, then by _id if needed
      let product = await products.findOne({ id: item.productId })

      if (!product && ObjectId.isValid(item.productId)) {
        product = await products.findOne({ _id: new ObjectId(item.productId) })
      }

      if (product) {
        const newStock = Math.max(0, product.stock - item.quantity)
        const isInStock = newStock > 0

        // Update using the same field we found the product with
        const updateQuery = product.id ? { id: item.productId } : { _id: product._id }

        const updateResult = await products.updateOne(updateQuery, {
          $set: {
            stock: newStock,
            inStock: isInStock,
            updatedAt: new Date(),
          },
        })

        stockUpdates.push({
          productId: item.productId,
          productName: product.name,
          oldStock: product.stock,
          newStock: newStock,
          isInStock: isInStock,
          quantityOrdered: item.quantity,
          updateSuccess: updateResult.modifiedCount > 0,
        })

        console.log(`Stock updated for ${product.name}: ${product.stock} -> ${newStock} (In Stock: ${isInStock})`)
      }
    }

    // Verify all stock updates were successful
    const failedUpdates = stockUpdates.filter((update) => !update.updateSuccess)
    if (failedUpdates.length > 0) {
      console.error("Some stock updates failed:", failedUpdates)
    }

    const order: Omit<Order, "_id"> = {
      userId: new ObjectId(userId),
      orderNumber: generateOrderNumber(),
      items: orderData.items,
      subtotal: orderData.subtotal,
      shipping: orderData.shipping,
      tax: orderData.tax,
      total: orderData.total,
      status: "processing",
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod,
      paymentIntentId: orderData.paymentIntentId,
      stripeSessionId: orderData.stripeSessionId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await orders.insertOne(order)

    // Clear user's cart after successful order
    const carts = db.collection("carts")
    await carts.updateOne({ userId: new ObjectId(userId) }, { $set: { items: [], updatedAt: new Date() } })

    return NextResponse.json({
      orderId: result.insertedId.toString(),
      orderNumber: order.orderNumber,
      stockUpdates: stockUpdates,
    })
  } catch (error) {
    console.error("Create order error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
