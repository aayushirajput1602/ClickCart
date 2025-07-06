"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Star, Heart, ShoppingCart, Truck, Shield, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCart } from "@/contexts/CartContext"
import { useWishlist } from "@/contexts/WishlistContext"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/lib/types"
import ProductReviews from "./ProductReviews"
import { stockManager } from "@/lib/stockManager"
import StockIndicator from "./StockIndicator"

interface ProductDetailsProps {
  product: Product
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { toast } = useToast()

  const [currentStock, setCurrentStock] = useState(product.stock)
  const [isInStock, setIsInStock] = useState(product.inStock)

  const images = [product.image, product.image, product.image] // Mock multiple images

  useEffect(() => {
    const checkStock = async () => {
      const stockInfo = await stockManager.getProductStock(product.id)
      if (stockInfo) {
        setCurrentStock(stockInfo.stock)
        setIsInStock(stockInfo.inStock)
      }
    }

    checkStock()
    const interval = setInterval(checkStock, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [product.id])

  const handleAddToCart = async () => {
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
      return
    }

    // Check if adding this quantity would exceed available stock
    if (quantity > currentStock) {
      toast({
        title: "Insufficient stock",
        description: `Only ${currentStock} items available. Please reduce the quantity.`,
        variant: "destructive",
      })
      return
    }

    const updatedProduct = {
      ...product,
      stock: currentStock,
      inStock: isInStock,
    }

    for (let i = 0; i < quantity; i++) {
      addToCart(updatedProduct)
    }
    toast({
      title: "Added to cart",
      description: `${quantity} ${product.name}(s) added to your cart.`,
    })
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

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString("en-IN")}`
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Product Images */}
      <div className="space-y-4">
        <div className="aspect-square relative overflow-hidden rounded-lg">
          <Image src={images[selectedImage] || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
          {product.discount && (
            <Badge className="absolute top-4 left-4 bg-red-500 text-white">{product.discount}% OFF</Badge>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`aspect-square relative overflow-hidden rounded-lg border-2 ${
                selectedImage === index ? "border-blue-500" : "border-gray-200"
              }`}
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={`${product.name} ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <p className="text-gray-600">{product.description}</p>
        </div>

        {/* Rating */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            {product.rating} ({product.reviews} reviews)
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center space-x-4">
          <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <div className="flex items-center space-x-2">
              <span className="text-xl text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
              {product.discount && (
                <Badge className="bg-green-100 text-green-800 text-sm font-semibold">{product.discount}% OFF</Badge>
              )}
            </div>
          )}
        </div>

        <div className="mb-4">
          <StockIndicator stock={currentStock} inStock={isInStock} size="lg" />
        </div>

        {/* Quantity selector */}
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium">Quantity:</label>
          <div className="flex items-center border rounded-lg">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 py-2 hover:bg-gray-100"
              disabled={!isInStock}
            >
              -
            </button>
            <span className="px-4 py-2 border-x">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
              className="px-3 py-2 hover:bg-gray-100"
              disabled={!isInStock || quantity >= currentStock}
            >
              +
            </button>
          </div>
          {isInStock && <span className="text-sm text-gray-500">Max: {currentStock}</span>}
        </div>

        {/* Action buttons */}
        <div className="flex space-x-4">
          <Button
            onClick={handleAddToCart}
            className="flex-1"
            size="lg"
            disabled={!isInStock || currentStock === 0 || quantity > currentStock}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            {isInStock && currentStock > 0 ? "Add to Cart" : "Out of Stock"}
          </Button>
          <Button onClick={handleWishlistToggle} variant="outline" size="lg" className="px-6 bg-transparent">
            <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Truck className="h-5 w-5" />
            <span>Free Shipping</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Shield className="h-5 w-5" />
            <span>2 Year Warranty</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <RotateCcw className="h-5 w-5" />
            <span>30 Day Returns</span>
          </div>
        </div>

        {/* Product details tabs */}
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <div className="prose max-w-none">
              <p>{product.description}</p>
              <p className="mt-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="specifications" className="mt-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Brand:</span>
                  <span className="ml-2 text-gray-600">ClickCart</span>
                </div>
                <div>
                  <span className="font-medium">Category:</span>
                  <span className="ml-2 text-gray-600 capitalize">{product.category}</span>
                </div>
                <div>
                  <span className="font-medium">SKU:</span>
                  <span className="ml-2 text-gray-600">{product.id}</span>
                </div>
                <div>
                  <span className="font-medium">Weight:</span>
                  <span className="ml-2 text-gray-600">1.2 kg</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <ProductReviews productId={product.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
