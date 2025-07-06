import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { seedProducts } from "@/lib/seedDatabase"
import type { Product } from "@/lib/models"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    // First, ensure the database is seeded
    await seedProducts()

    const client = await clientPromise
    const db = client.db("ecommerce")
    const products = db.collection<Product>("products")

    // Get all products
    const allProducts = await products.find({}).toArray()
    console.log("Returning products count:", allProducts.length)

    return NextResponse.json({
      products: allProducts.map((product) => ({
        ...product,
        _id: product._id?.toString(),
        // Ensure we always have an id field for frontend consistency
        id: product.id || product._id?.toString(),
      })),
    })
  } catch (error) {
    console.error("Get products error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { productId, stock } = await request.json()
    console.log("Updating stock for product:", productId, "to:", stock)

    const client = await clientPromise
    const db = client.db("ecommerce")
    const products = db.collection<Product>("products")

    // Try to update by id field first
    let result = await products.updateOne(
      { id: productId },
      {
        $set: {
          stock,
          inStock: stock > 0,
          updatedAt: new Date(),
        },
      },
    )

    console.log("Update result by id:", result.matchedCount, result.modifiedCount)

    // If not found by id, try by _id
    if (result.matchedCount === 0 && ObjectId.isValid(productId)) {
      result = await products.updateOne(
        { _id: new ObjectId(productId) },
        {
          $set: {
            stock,
            inStock: stock > 0,
            updatedAt: new Date(),
          },
        },
      )
      console.log("Update result by _id:", result.matchedCount, result.modifiedCount)
    }

    if (result.matchedCount === 0) {
      console.error("Product not found for update:", productId)
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update product error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
