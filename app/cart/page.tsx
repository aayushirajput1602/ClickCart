"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/contexts/CartContext"
import { useToast } from "@/hooks/use-toast"

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart } = useCart()
  const [promoCode, setPromoCode] = useState("")
  const { toast } = useToast()

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 50 ? 0 : 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const handleApplyPromo = () => {
    if (promoCode.toLowerCase() === "save10") {
      toast({
        title: "Promo code applied!",
        description: "You saved 10% on your order.",
      })
    } else {
      toast({
        title: "Invalid promo code",
        description: "Please check your promo code and try again.",
        variant: "destructive",
      })
    }
  }

  const refreshProductStock = async () => {
    try {
      const updatedItems = []
      for (const item of items) {
        const response = await fetch(`/api/products/${item.id}`)
        if (response.ok) {
          const data = await response.json()
          const updatedProduct = data.product

          if (updatedProduct.stock < item.quantity) {
            // Update quantity to available stock
            updateQuantity(item.id, updatedProduct.stock)
            toast({
              title: "Cart updated",
              description: `${item.name} quantity adjusted to available stock (${updatedProduct.stock}).`,
            })
          }

          if (!updatedProduct.inStock || updatedProduct.stock === 0) {
            // Remove out of stock items
            removeFromCart(item.id)
            toast({
              title: "Item removed",
              description: `${item.name} is no longer available and has been removed from your cart.`,
              variant: "destructive",
            })
          }
        }
      }
    } catch (error) {
      console.error("Failed to refresh stock:", error)
    }
  }

  // Refresh stock when component mounts
  useEffect(() => {
    if (items.length > 0) {
      refreshProductStock()
    }
  }, [])

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="h-24 w-24 mx-auto text-gray-300 mb-6" />
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link href="/category/all">
          <Button size="lg">Continue Shopping</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-4">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  width={100}
                  height={100}
                  className="rounded-lg object-cover"
                />

                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                  <p className="text-lg font-bold mt-2">${item.price.toFixed(2)}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 p-2">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center pt-4">
            <Button variant="outline" onClick={clearCart}>
              Clear Cart
            </Button>
            <Link href="/category/all">
              <Button variant="outline">Continue Shopping</Button>
            </Link>
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-lg shadow-md p-6 h-fit">
          <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Promo code
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Promo Code</label>
            <div className="flex space-x-2">
              <Input value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="Enter code" />
              <Button onClick={handleApplyPromo} variant="outline">
                Apply
              </Button>
            </div>
          </div> */}

          <Link href="/checkout" className="block mt-6">
            <Button className="w-full" size="lg">
              Proceed to Checkout
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
