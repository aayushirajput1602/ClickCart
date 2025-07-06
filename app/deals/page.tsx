import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { Clock, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import LoadingSpinner from "@/components/LoadingSpinner"
import { mockProducts } from "@/lib/mockData"

export default function DealsPage() {
  // Filter products that have discounts
  const dealProducts = mockProducts.filter((product) => product.discount && product.discount > 0)

  // Sort by discount percentage (highest first)
  dealProducts.sort((a, b) => (b.discount || 0) - (a.discount || 0))

  const flashDeals = dealProducts.slice(0, 6) // Top 6 deals
  const todayDeals = dealProducts.slice(6, 12) // Next 6 deals
  const weeklyDeals = dealProducts.slice(12) // Remaining deals

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-500 to-pink-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">🔥 Amazing Deals</h1>
          <p className="text-xl mb-8 opacity-90">
            Save big on your favorite products with our exclusive deals and discounts!
          </p>
          <div className="flex items-center justify-center space-x-4 text-lg">
            <Clock className="h-6 w-6" />
            <span>Limited time offers - Don't miss out!</span>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Flash Deals */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">⚡ Flash Deals</h2>
            <div className="flex items-center text-red-600">
              <Clock className="h-5 w-5 mr-2" />
              <span className="font-semibold">Ends in 2 days!</span>
            </div>
          </div>

          <Suspense fallback={<LoadingSpinner />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {flashDeals.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="relative">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={400}
                      height={300}
                      className="w-full h-48 object-cover"
                    />
                    <Badge className="absolute top-3 left-3 bg-red-500 text-white text-lg font-bold">
                      -{product.discount}% OFF
                    </Badge>
                    {product.stock <= 5 && (
                      <Badge className="absolute top-3 right-3 bg-orange-500 text-white">
                        Only {product.stock} left!
                      </Badge>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>

                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 ml-2">({product.reviews})</span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-red-600">${product.price.toFixed(2)}</span>
                        {product.originalPrice && (
                          <span className="text-lg text-gray-500 line-through">
                            ${product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <span className="text-green-600 font-semibold">
                        Save ${((product.originalPrice || 0) - product.price).toFixed(2)}
                      </span>
                    </div>

                    <Link href={`/product/${product.id}`}>
                      <Button className="w-full bg-red-600 hover:bg-red-700">Shop Now</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Suspense>
        </section>

        {/* Today's Deals */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">🎯 Today's Best Deals</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {todayDeals.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={300}
                    height={200}
                    className="w-full h-40 object-cover"
                  />
                  <Badge className="absolute top-2 left-2 bg-blue-500 text-white">-{product.discount}% OFF</Badge>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">${product.originalPrice.toFixed(2)}</span>
                      )}
                    </div>
                  </div>

                  <Link href={`/product/${product.id}`}>
                    <Button variant="outline" className="w-full">
                      View Deal
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Weekly Deals */}
        <section>
          <h2 className="text-3xl font-bold mb-8">📅 Weekly Deals</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {weeklyDeals.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={200}
                    height={150}
                    className="w-full h-32 object-cover"
                  />
                  <Badge className="absolute top-2 left-2 bg-green-500 text-white text-sm">-{product.discount}%</Badge>
                </div>

                <div className="p-3">
                  <h3 className="font-medium text-sm mb-2 line-clamp-2">{product.name}</h3>

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
                    {product.originalPrice && (
                      <span className="text-xs text-gray-500 line-through">${product.originalPrice.toFixed(2)}</span>
                    )}
                  </div>

                  <Link href={`/product/${product.id}`}>
                    <Button size="sm" variant="outline" className="w-full text-xs">
                      Shop Now
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Newsletter signup for deals */}
        <section className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Never Miss a Deal!</h2>
          <p className="mb-6">Subscribe to get notified about exclusive deals and flash sales</p>
          <div className="max-w-md mx-auto flex gap-4">
            <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-2 rounded-lg text-gray-900" />
            <Button className="bg-white text-blue-600 hover:bg-gray-100">Subscribe</Button>
          </div>
        </section>
      </div>
    </div>
  )
}
