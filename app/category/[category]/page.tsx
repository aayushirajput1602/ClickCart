import { Suspense } from "react"
import ProductGrid from "@/components/ProductGrid"
import ProductFilters from "@/components/ProductFilters"
import LoadingSpinner from "@/components/LoadingSpinner"
import { mockProducts } from "@/lib/mockData"

interface CategoryPageProps {
  params: {
    category: string
  }
  searchParams: {
    sort?: string
    minPrice?: string
    maxPrice?: string
    rating?: string
  }
}

export default function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category } = params

  // Filter products by category
  let filteredProducts = mockProducts.filter((product) => {
    if (category === "all") return true
    return product.category === category
  })

  // Apply price filters (now in rupees)
  if (searchParams.minPrice) {
    const minPrice = Number.parseFloat(searchParams.minPrice)
    filteredProducts = filteredProducts.filter((p) => p.price >= minPrice)
  }
  if (searchParams.maxPrice) {
    const maxPrice = Number.parseFloat(searchParams.maxPrice)
    filteredProducts = filteredProducts.filter((p) => p.price <= maxPrice)
  }

  // Apply rating filter
  if (searchParams.rating) {
    const minRating = Number.parseFloat(searchParams.rating)
    filteredProducts = filteredProducts.filter((p) => p.rating >= minRating)
  }

  // Apply sorting
  if (searchParams.sort) {
    switch (searchParams.sort) {
      case "price-low":
        filteredProducts.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filteredProducts.sort((a, b) => b.price - a.price)
        break
      case "rating":
        filteredProducts.sort((a, b) => b.rating - a.rating)
        break
      case "newest":
        filteredProducts.sort((a, b) => Number.parseInt(b.id) - Number.parseInt(a.id))
        break
      case "popular":
        filteredProducts.sort((a, b) => b.reviews - a.reviews)
        break
      default:
        // Default sorting
        break
    }
  }

  const categoryNames: { [key: string]: string } = {
    clothing: "Clothing",
    electronics: "Electronics",
    groceries: "Groceries",
    footwear: "Footwear",
    sports: "Sports & Fitness",
    "home-garden": "Home & Garden",
    all: "All Products",
  }

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price)
  }

  // Get price range info for current filters
  const getPriceRangeText = () => {
    const minPrice = searchParams.minPrice ? Number.parseFloat(searchParams.minPrice) : null
    const maxPrice = searchParams.maxPrice ? Number.parseFloat(searchParams.maxPrice) : null

    if (minPrice && maxPrice) {
      return ` (${formatPrice(minPrice)} - ${formatPrice(maxPrice)})`
    } else if (minPrice) {
      return ` (Above ${formatPrice(minPrice)})`
    } else if (maxPrice) {
      return ` (Under ${formatPrice(maxPrice)})`
    }
    return ""
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {categoryNames[category] || "Products"}
          {getPriceRangeText()}
        </h1>
        <p className="text-gray-600">Showing {filteredProducts.length} products</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters sidebar */}
        <div className="lg:w-1/4">
          <ProductFilters />
        </div>

        {/* Products grid */}
        <div className="lg:w-3/4">
          <Suspense fallback={<LoadingSpinner />}>
            <ProductGrid products={filteredProducts} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
