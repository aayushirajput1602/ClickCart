import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { Product } from "@/lib/models"

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")
    const products = db.collection<Product>("products")

    // Get all products to see what's actually in the database
    const allProducts = await products.find({}).toArray()

    console.log("Products in database:", allProducts.length)
    console.log(
      "Sample products:",
      allProducts.slice(0, 3).map((p) => ({ id: p.id, _id: p._id, name: p.name })),
    )

    // Check specifically for product "19"
    const product19 = await products.findOne({ id: "19" })
    console.log("Product 19 found:", product19 ? "YES" : "NO")

    return NextResponse.json({
      totalProducts: allProducts.length,
      sampleProducts: allProducts.slice(0, 5).map((p) => ({
        id: p.id,
        _id: p._id?.toString(),
        name: p.name,
        stock: p.stock,
        inStock: p.inStock,
      })),
      product19: product19
        ? {
            id: product19.id,
            _id: product19._id?.toString(),
            name: product19.name,
            stock: product19.stock,
            inStock: product19.inStock,
          }
        : null,
      allProductIds: allProducts.map((p) => p.id).filter(Boolean),
    })
  } catch (error) {
    console.error("Debug products error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
