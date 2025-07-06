import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { mockProducts } from "@/lib/mockData"
import type { Product } from "@/lib/models"

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")
    const products = db.collection<Product>("products")

    // Clear existing products
    await products.deleteMany({})
    console.log("Cleared existing products")

    // Insert fresh products
    const productsToInsert = mockProducts.map((product) => ({
      ...product,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))

    const insertResult = await products.insertMany(productsToInsert)
    console.log(`Inserted ${insertResult.insertedCount} products`)

    // Verify product "19" exists
    const product19 = await products.findOne({ id: "19" })
    console.log("Product 19 after reseed:", product19 ? "FOUND" : "NOT FOUND")

    return NextResponse.json({
      message: "Database reseeded successfully",
      insertedCount: insertResult.insertedCount,
      product19Found: !!product19,
      product19: product19
        ? {
            id: product19.id,
            name: product19.name,
            stock: product19.stock,
          }
        : null,
    })
  } catch (error) {
    console.error("Reseed error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
