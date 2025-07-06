"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Star, Heart, ShoppingCart, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/CartContext"
import { useWishlist } from "@/contexts/WishlistContext"
import { useToast } from "@/hooks/use-toast"
import { stockManager } from "@/lib/stockManager"
import type { Product } from "@/lib/types"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, items } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { toast } = useToast()
  const [currentStock, setCurrentStock] = useState(product.stock)
  const [isInStock, setIsInStock] = useState(product.inStock)
  const [isCheckingStock, setIsCheckingStock] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageSrc, setImageSrc] = useState(product.image)

  // Check stock status periodically
  useEffect(() => {
    const checkStock = async () => {
      const stockInfo = await stockManager.getProductStock(product.id)
      if (stockInfo) {
        setCurrentStock(stockInfo.stock)
        setIsInStock(stockInfo.inStock)
      }
    }

    // Check stock immediately
    checkStock()

    // Set up periodic stock checking
    const interval = setInterval(checkStock, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [product.id])

  const handleAddToCart = async () => {
    setIsCheckingStock(true)

    // Get latest stock before adding to cart
    const latestStock = await stockManager.getProductStock(product.id)
    if (latestStock) {
      setCurrentStock(latestStock.stock)
      setIsInStock(latestStock.inStock)
    }

    if (!isInStock || currentStock === 0) {
      toast({
        title: "Out of stock",
        description: "This product is currently out of stock.",
        variant: "destructive",
      })
      setIsCheckingStock(false)
      return
    }

    // Check current cart quantity for this product
    const currentCartItem = items.find((item) => item.id === product.id)
    const currentQuantityInCart = currentCartItem ? currentCartItem.quantity : 0

    if (currentQuantityInCart >= currentStock) {
      toast({
        title: "Cannot add more",
        description: `You already have the maximum available quantity (${currentStock}) in your cart.`,
        variant: "destructive",
      })
      setIsCheckingStock(false)
      return
    }

    // Update the product with latest stock info before adding to cart
    const updatedProduct = {
      ...product,
      stock: currentStock,
      inStock: isInStock,
    }

    addToCart(updatedProduct)
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })

    setIsCheckingStock(false)
  }

  const handleWishlistToggle = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
      toast({
        title: "Removed from wishlist",
        description: `${product.name} has been removed from your wishlist.`,
      })
    } else {
      addToWishlist(product)
      toast({
        title: "Added to wishlist",
        description: `${product.name} has been added to your wishlist.`,
      })
    }
  }

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true)
      // Try placeholder image first
      setImageSrc("/placeholder.svg?height=500&width=500")
    }
  }

  const getCategoryIcon = (category: string, subcategory?: string) => {
    if (category === "clothing") {
      if (subcategory === "men") return "👔"
      if (subcategory === "women") return "👗"
      if (subcategory === "kids") return "👶"
      return "👕"
    }
    if (category === "footwear") {
      if (subcategory === "men") return "👞"
      if (subcategory === "women") return "👠"
      if (subcategory === "kids") return "👟"
      return "👟"
    }
    if (category === "electronics") return "📱"
    if (category === "groceries") return "🍯"
    if (category === "sports") return "🏃‍♂️"
    if (category === "home-garden") return "🏠"
    return "📦"
  }

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString("en-IN")}`
  }

  return (
    <div className="group relative bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Wishlist button */}
      <button
        onClick={handleWishlistToggle}
        className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
      >
        <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
      </button>

      {/* Product image */}
      <Link href={`/product/${product.id}`}>
        <div className="aspect-square relative overflow-hidden bg-gray-100">
          {!imageError ? (
            <Image
              src={imageSrc || "/placeholder.svg?height=500&width=500"}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={handleImageError}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="text-center text-gray-600">
                <div className="text-6xl mb-3">{getCategoryIcon(product.category, product.subcategory)}</div>
                <div className="text-sm font-medium px-4">{product.name}</div>
              </div>
            </div>
          )}
          {product.discount && isInStock && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
              {product.discount}% OFF
            </div>
          )}
          {!isInStock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg font-semibold">
                Out of Stock
              </Badge>
            </div>
          )}
          {isInStock && currentStock <= 5 && currentStock > 0 && (
            <div className="absolute bottom-3 left-3 bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">
              Only {currentStock} left!
            </div>
          )}
        </div>
      </Link>

      {/* Product info */}
      <div className="p-4">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>

        {/* Rating */}
        <div className="flex items-center mb-2">
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

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
            {product.originalPrice && isInStock && (
              <span className="text-sm text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          {product.discount && isInStock && (
            <span className="text-sm font-semibold text-green-600">{product.discount}% OFF</span>
          )}
        </div>

        {/* Stock info */}
        <div className="mb-3">
          {isInStock ? (
            <div className="flex items-center">
              <span className="text-sm text-green-600">✓ In Stock</span>
              {currentStock <= 10 && <span className="text-sm text-orange-600 ml-2">({currentStock} available)</span>}
            </div>
          ) : (
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-sm text-red-600 font-medium">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Add to cart button */}
        <Button
          onClick={handleAddToCart}
          className="w-full"
          size="sm"
          disabled={!isInStock || currentStock === 0 || isCheckingStock}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isCheckingStock ? "Checking..." : isInStock && currentStock > 0 ? "Add to Cart" : "Out of Stock"}
        </Button>
      </div>
    </div>
  )
}
