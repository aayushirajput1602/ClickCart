"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { CreditCard, Truck, Shield, MapPin, AlertTriangle, Smartphone, Banknote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCart } from "@/contexts/CartContext"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import StripeCheckout from "@/components/StripeCheckout"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart, refreshStock } = useCart()
  const { user, token } = useAuth()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    email: user?.email || "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    paymentMethod: "stripe",
    stripeOption: "card", // New field for Stripe sub-options
  })

  const [showStripeCheckout, setShowStripeCheckout] = useState(false)
  const [stockValidated, setStockValidated] = useState(false)
  const [stockIssues, setStockIssues] = useState<string[]>([])

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 1500 ? 0 : 99 // Free shipping above ₹1500, otherwise ₹99
  const tax = subtotal * 0.18 // 18% GST
  const total = subtotal + shipping + tax

  // Format price in Indian rupees
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  // Validate stock when component mounts and when items change
  useEffect(() => {
    validateStock()
  }, [items])

  const validateStock = async () => {
    if (items.length === 0) return

    try {
      await refreshStock()

      const issues: string[] = []

      items.forEach((item) => {
        if (!item.inStock) {
          issues.push(`${item.name} is out of stock`)
        } else if (item.stock < item.quantity) {
          issues.push(`${item.name} has only ${item.stock} items available (you have ${item.quantity} in cart)`)
        }
      })

      setStockIssues(issues)
      setStockValidated(issues.length === 0)
    } catch (error) {
      console.error("Stock validation failed:", error)
      setStockValidated(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !token) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to place an order.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    // Final stock validation before proceeding
    await validateStock()

    if (!stockValidated || stockIssues.length > 0) {
      toast({
        title: "Stock validation failed",
        description: "Please review your cart and try again.",
        variant: "destructive",
      })
      return
    }

    if (formData.paymentMethod === "stripe") {
      if (formData.stripeOption === "card") {
        setShowStripeCheckout(true)
      } else if (formData.stripeOption === "online") {
        // Redirect to online payment page
        const orderData = {
          items: items.map((item) => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: item.quantity,
            description: item.description,
            category: item.category,
          })),
          subtotal,
          shipping,
          tax,
          total,
          shippingAddress: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country,
          },
          paymentMethod: "stripe-online",
        }

        // Store order data in sessionStorage for online payment page
        sessionStorage.setItem("pendingOrder", JSON.stringify(orderData))
        router.push("/payment/online")
      }
    } else if (formData.paymentMethod === "cod") {
      // Handle Cash on Delivery
      await processOrder()
    }
  }

  const processOrder = async (paymentIntentId?: string) => {
    try {
      const orderData = {
        items: items.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity,
          description: item.description,
          category: item.category,
        })),
        subtotal,
        shipping,
        tax,
        total,
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
        paymentMethod: formData.paymentMethod,
        paymentIntentId,
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to place order")
      }

      toast({
        title: "Order placed successfully!",
        description: `Order ${result.orderNumber} has been created.`,
      })

      // Log stock updates for debugging
      if (result.stockUpdates) {
        console.log("Stock updates:", result.stockUpdates)
        result.stockUpdates.forEach((update: any) => {
          console.log(`${update.productName}: ${update.oldStock} -> ${update.newStock} (In Stock: ${update.isInStock})`)
        })
      }

      clearCart()
      router.push("/order-success")
    } catch (error: any) {
      toast({
        title: "Order failed",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleStripeSuccess = (paymentIntentId: string) => {
    processOrder(paymentIntentId)
  }

  const handleStripeError = (error: string) => {
    toast({
      title: "Payment failed",
      description: error,
      variant: "destructive",
    })
    setShowStripeCheckout(false)
  }

  if (items.length === 0) {
    router.push("/cart")
    return null
  }

  if (showStripeCheckout) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Complete Payment</h1>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (18%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <StripeCheckout
              amount={total}
              onSuccess={handleStripeSuccess}
              onError={handleStripeError}
              orderData={{ total, orderNumber: "TBD" }}
            />
          </div>

          <div className="mt-4 text-center">
            <Button variant="outline" onClick={() => setShowStripeCheckout(false)}>
              Back to Checkout
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {/* Stock Issues Alert */}
      {stockIssues.length > 0 && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="font-semibold mb-2">Stock Issues Detected:</div>
            <ul className="list-disc list-inside space-y-1">
              {stockIssues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
            <div className="mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/cart")}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Update Cart
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Checkout form */}
        <div className="space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact information */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Contact Information
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Shipping address */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Truck className="h-5 w-5 mr-2" />
                Shipping Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" name="address" value={formData.address} onChange={handleInputChange} required />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" value={formData.city} onChange={handleInputChange} required />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input id="state" name="state" value={formData.state} onChange={handleInputChange} required />
                </div>
                <div>
                  <Label htmlFor="zipCode">PIN Code</Label>
                  <Input id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleInputChange} required />
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Method
              </h2>

              <RadioGroup
                value={formData.paymentMethod}
                onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                className="space-y-4"
              >
                {/* Stripe Payment Option */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <RadioGroupItem value="stripe" id="stripe" />
                    <Label htmlFor="stripe" className="flex items-center cursor-pointer flex-1">
                      <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                      <div>
                        <div className="font-medium">Credit/Debit Card (Stripe)</div>
                        <div className="text-sm text-gray-500">Pay securely with your card or online payment</div>
                      </div>
                    </Label>
                  </div>

                  {/* Stripe Sub-options */}
                  {formData.paymentMethod === "stripe" && (
                    <div className="ml-6 mt-3 space-y-3 border-l-2 border-gray-200 pl-4">
                      <RadioGroup
                        value={formData.stripeOption}
                        onValueChange={(value) => setFormData({ ...formData, stripeOption: value })}
                        className="space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="card" id="card" />
                          <Label htmlFor="card" className="flex items-center cursor-pointer">
                            <CreditCard className="h-4 w-4 mr-2 text-gray-600" />
                            <div>
                              <div className="font-medium text-sm">Card Information</div>
                              <div className="text-xs text-gray-500">Enter card details directly</div>
                            </div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="online" id="online" />
                          <Label htmlFor="online" className="flex items-center cursor-pointer">
                            <Smartphone className="h-4 w-4 mr-2 text-gray-600" />
                            <div>
                              <div className="font-medium text-sm">Online Payment</div>
                              <div className="text-xs text-gray-500">UPI, Net Banking, Wallets</div>
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}
                </div>

                {/* Cash on Delivery Option */}
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="cod" id="cod" />
                  <Label htmlFor="cod" className="flex items-center cursor-pointer flex-1">
                    <Banknote className="h-5 w-5 mr-2 text-green-600" />
                    <div>
                      <div className="font-medium">Cash on Delivery</div>
                      <div className="text-sm text-gray-500">Pay when your order is delivered</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={!stockValidated || stockIssues.length > 0}>
              {formData.paymentMethod === "stripe"
                ? formData.stripeOption === "card"
                  ? "Continue to Payment"
                  : "Proceed to Online Payment"
                : "Place Order"}
            </Button>
          </form>
        </div>

        {/* Order summary */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <div key={item.id} className="flex items-center space-x-4">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  width={60}
                  height={60}
                  className="rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  {!item.inStock && <p className="text-sm text-red-600 font-medium">Out of Stock</p>}
                  {item.inStock && item.stock < item.quantity && (
                    <p className="text-sm text-orange-600 font-medium">Only {item.stock} available</p>
                  )}
                </div>
                <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%)</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 text-blue-700">
              <Shield className="h-5 w-5" />
              <span className="text-sm font-medium">Secure Checkout</span>
            </div>
            <p className="text-xs text-blue-600 mt-1">Your payment information is encrypted and secure.</p>
          </div>

          {subtotal < 1500 && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                Add {formatPrice(1500 - subtotal)} more to get <strong>FREE shipping!</strong>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
