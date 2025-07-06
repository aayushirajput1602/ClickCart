import { Suspense } from "react"
import ProductGrid from "@/components/ProductGrid"
import ProductFilters from "@/components/ProductFilters"
import LoadingSpinner from "@/components/LoadingSpinner"
import { mockProducts } from "@/lib/mockData"

interface SearchPageProps {
  searchParams: {
    q?: string
    sort?: string
    minPrice?: string
    maxPrice?: string
    rating?: string
  }
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || ""

  // Filter products by search query
  let filteredProducts = mockProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase()),
  )

  // Apply price filters (now in rupees)
  if (searchParams.minPrice) {
    filteredProducts = filteredProducts.filter((p) => p.price >= Number.parseFloat(searchParams.minPrice!))
  }
  if (searchParams.maxPrice) {
    filteredProducts = filteredProducts.filter((p) => p.price <= Number.parseFloat(searchParams.maxPrice!))
  }
  if (searchParams.rating) {
    filteredProducts = filteredProducts.filter((p) => p.rating >= Number.parseFloat(searchParams.rating!))
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
    }
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
          Search Results {query && `for "${query}"`}
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
