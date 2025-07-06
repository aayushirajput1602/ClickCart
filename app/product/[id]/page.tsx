import { notFound } from "next/navigation"
import ProductDetails from "@/components/ProductDetails"
import RelatedProducts from "@/components/RelatedProducts"
import { mockProducts } from "@/lib/mockData"

interface ProductPageProps {
  params: {
    id: string
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = mockProducts.find((p) => p.id === params.id)

  if (!product) {
    notFound()
  }

  const relatedProducts = mockProducts.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductDetails product={product} />

      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">Related Products</h2>
          <RelatedProducts products={relatedProducts} />
        </div>
      )}
    </div>
  )
}
