import ProductCard from "./ProductCard"
import { mockProducts } from "@/lib/mockData"

export default function FeaturedProducts() {
  const featuredProducts = mockProducts.slice(0, 8)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {featuredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
