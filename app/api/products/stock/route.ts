import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"
import type { Product } from "@/lib/models"

export async function POST(request: NextRequest) {
  try {
    const { productIds } = await request.json()

    if (!productIds || !Array.isArray(productIds)) {
      return NextResponse.json({ error: "Product IDs array is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("ecommerce")
    const products = db.collection<Product>("products")

    // Create a query that looks for products by either id field or _id field
    const query = {
      $or: [
        { id: { $in: productIds } },
        { _id: { $in: productIds.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id)) } },
      ],
    }

    const stockInfo = await products.find(query).project({ id: 1, _id: 1, stock: 1, inStock: 1 }).toArray()

    const stockMap = stockInfo.reduce(
      (acc, product) => {
        // Use id field if available, otherwise use _id
        const productId = product.id || product._id?.toString()
        if (productId) {
          acc[productId] = {
            stock: product.stock,
            inStock: product.inStock,
          }
        }
        return acc
      },
      {} as Record<string, { stock: number; inStock: boolean }>,
    )

    return NextResponse.json({ stockInfo: stockMap })
  } catch (error) {
    console.error("Get stock info error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
