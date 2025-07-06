import { type NextRequest, NextResponse } from "next/server"
import { seedProducts, forceSeedProducts } from "@/lib/seedDatabase"

export async function GET(request: NextRequest) {
  try {
    console.log("Running database seeding...")
    const result = await seedProducts()

    return NextResponse.json({
      message: "Database seeding process completed",
      result,
    })
  } catch (error) {
    console.error("Seeding API error:", error)
    return NextResponse.json(
      {
        error: "Failed to seed database",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("Running forced database seeding...")
    const result = await forceSeedProducts()

    return NextResponse.json({
      message: "Forced database seeding process completed",
      result,
    })
  } catch (error) {
    console.error("Force seeding API error:", error)
    return NextResponse.json(
      {
        error: "Failed to force seed database",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
