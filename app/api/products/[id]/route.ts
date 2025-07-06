import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"
import type { Product } from "@/lib/models"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")
    const products = db.collection<Product>("products")

    // Try to find product by id field first
    let product = await products.findOne({ id: params.id })

    // If not found by id, try by _id (in case the id is an ObjectId string)
    if (!product && ObjectId.isValid(params.id)) {
      product = await products.findOne({ _id: new ObjectId(params.id) })
    }

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({
      product: {
        ...product,
        _id: product._id?.toString(),
        // Ensure we always have an id field for frontend consistency
        id: product.id || product._id?.toString(),
      },
    })
  } catch (error) {
    console.error("Get product error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
