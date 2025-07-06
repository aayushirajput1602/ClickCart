import clientPromise from "@/lib/mongodb"
import { mockProducts } from "@/lib/mockData"
import type { Product } from "@/lib/models"

export async function seedProducts() {
  console.log("Starting database seeding process...")

  try {
    // Test the MongoDB connection first
    const client = await clientPromise
    console.log("MongoDB connection successful")

    const db = client.db("ecommerce")
    console.log("Connected to ecommerce database")

    // Ensure the products collection exists
    const collections = await db.listCollections({ name: "products" }).toArray()
    if (collections.length === 0) {
      console.log("Products collection doesn't exist, creating it...")
      await db.createCollection("products")
      console.log("Products collection created")
    }

    const products = db.collection<Product>("products")

    // Check if products collection is empty
    const count = await products.countDocuments()
    console.log(`Current product count in database: ${count}`)

    if (count === 0) {
      console.log("Products collection is empty, seeding data...")

      // Convert mock products to database format
      const productsToInsert = mockProducts.map((product) => ({
        ...product,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))

      // Insert products in smaller batches to avoid potential issues
      const batchSize = 10
      const batches = []

      for (let i = 0; i < productsToInsert.length; i += batchSize) {
        batches.push(productsToInsert.slice(i, i + batchSize))
      }

      console.log(`Splitting ${productsToInsert.length} products into ${batches.length} batches`)

      let totalInserted = 0
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i]
        try {
          const result = await products.insertMany(batch)
          totalInserted += result.insertedCount
          console.log(`Batch ${i + 1}/${batches.length}: Inserted ${result.insertedCount} products`)
        } catch (error) {
          console.error(`Error inserting batch ${i + 1}:`, error)
        }
      }

      console.log(`Seeding complete. Total products inserted: ${totalInserted}`)

      // Verify seeding worked
      const newCount = await products.countDocuments()
      console.log(`New product count after seeding: ${newCount}`)

      // Check if specific products were inserted
      const product1 = await products.findOne({ id: "1" })
      const product19 = await products.findOne({ id: "19" })

      console.log(`Product 1 inserted: ${product1 ? "YES" : "NO"}`)
      console.log(`Product 19 inserted: ${product19 ? "YES" : "NO"}`)

      return {
        success: true,
        productsInserted: totalInserted,
        newCount,
        product1Found: !!product1,
        product19Found: !!product19,
      }
    } else {
      console.log("Products collection already has data, skipping seeding")
      return {
        success: true,
        productsInserted: 0,
        existingCount: count,
        message: "Database already seeded",
      }
    }
  } catch (error) {
    console.error("Database seeding failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function forceSeedProducts() {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")
    const products = db.collection<Product>("products")

    // Clear existing products
    const deleteResult = await products.deleteMany({})
    console.log(`Cleared ${deleteResult.deletedCount} existing products`)

    // Now seed fresh data
    return await seedProducts()
  } catch (error) {
    console.error("Force seeding failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
