"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Shield, Smartphone, CheckCircle, AlertCircle, CreditCard, Building, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { useCart } from "@/contexts/CartContext"
import { useToast } from "@/hooks/use-toast"

export default function OnlinePaymentPage() {
  const router = useRouter()
  const { user, token } = useAuth()
  const { clearCart } = useCart()
  const { toast } = useToast()

  const [orderData, setOrderData] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "processing" | "success" | "failed">("pending")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("upi")
  const [isFromStripe, setIsFromStripe] = useState(false)

  // Format price in Indian rupees
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  useEffect(() => {
    // Check if coming from Stripe checkout
    const stripeOrderData = sessionStorage.getItem("stripeOrderData")
    const pendingOrder = sessionStorage.getItem("pendingOrder")

    if (stripeOrderData) {
      setOrderData(JSON.parse(stripeOrderData))
      setIsFromStripe(true)
    } else if (pendingOrder) {
      setOrderData(JSON.parse(pendingOrder))
      setIsFromStripe(false)
    } else {
      // If no order data, redirect back to checkout
      router.push("/checkout")
    }
  }, [router])

  const handleOnlinePayment = async () => {
    if (!orderData || !user || !token) {
      toast({
        title: "Error",
        description: "Missing order information. Please try again.",
        variant: "destructive",
      })
      router.push("/checkout")
      return
    }

    setIsProcessing(true)
    setPaymentStatus("processing")

    try {
      // Simulate online payment processing
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // In a real implementation, you would integrate with payment gateway APIs here
      // For now, we'll simulate a successful payment
      const paymentSuccess = Math.random() > 0.1 // 90% success rate for demo

      if (paymentSuccess) {
        if (isFromStripe) {
          // If coming from Stripe, we need to create a mock payment intent and call the parent success handler
          const mockPaymentIntentId = `online_${selectedPaymentMethod}_${Date.now()}`

          // Create the order directly since we're in the Stripe flow
          const response = await fetch("/api/orders", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              items: orderData.items || [],
              subtotal: orderData.subtotal || orderData.amount * 0.85,
              shipping: orderData.shipping || 0,
              tax: orderData.tax || orderData.amount * 0.15,
              total: orderData.amount || orderData.total,
              shippingAddress: orderData.shippingAddress || {},
              paymentMethod: "stripe-online",
              paymentIntentId: mockPaymentIntentId,
            }),
          })

          const result = await response.json()

          if (!response.ok) {
            throw new Error(result.error || "Failed to place order")
          }

          setPaymentStatus("success")
          toast({
            title: "Payment Successful!",
            description: `Order ${result.orderNumber} has been placed successfully.`,
          })

          // Clear the pending order from sessionStorage
          sessionStorage.removeItem("stripeOrderData")
          clearCart()

          // Redirect to success page after a short delay
          setTimeout(() => {
            router.push("/order-success")
          }, 2000)
        } else {
          // Regular checkout flow
          const response = await fetch("/api/orders", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              ...orderData,
              paymentIntentId: `online_${selectedPaymentMethod}_${Date.now()}`,
            }),
          })

          const result = await response.json()

          if (!response.ok) {
            throw new Error(result.error || "Failed to place order")
          }

          setPaymentStatus("success")
          toast({
            title: "Payment Successful!",
            description: `Order ${result.orderNumber} has been placed successfully.`,
          })

          // Clear the pending order from sessionStorage
          sessionStorage.removeItem("pendingOrder")
          clearCart()

          // Redirect to success page after a short delay
          setTimeout(() => {
            router.push("/order-success")
          }, 2000)
        }
      } else {
        throw new Error("Payment failed. Please try again.")
      }
    } catch (error: any) {
      setPaymentStatus("failed")
      toast({
        title: "Payment Failed",
        description: error.message || "Payment could not be processed. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBackToCheckout = () => {
    if (isFromStripe) {
      // Clear Stripe order data and go back to checkout
      sessionStorage.removeItem("stripeOrderData")
      router.push("/checkout")
    } else {
      router.push("/checkout")
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "upi":
        return <Smartphone className="h-5 w-5" />
      case "netbanking":
        return <Building className="h-5 w-5" />
      case "wallet":
        return <Wallet className="h-5 w-5" />
      default:
        return <CreditCard className="h-5 w-5" />
    }
  }

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case "upi":
        return "UPI Payment"
      case "netbanking":
        return "Net Banking"
      case "wallet":
        return "Digital Wallet"
      default:
        return "Online Payment"
    }
  }

  if (!orderData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  const displayAmount = orderData.amount || orderData.total

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button variant="ghost" onClick={handleBackToCheckout} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {isFromStripe ? "Payment" : "Checkout"}
          </Button>
          <h1 className="text-3xl font-bold">Online Payment</h1>
        </div>

        {/* Payment Status */}
        {paymentStatus === "processing" && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <div>
                  <h3 className="font-semibold text-blue-800">Processing Payment...</h3>
                  <p className="text-sm text-blue-600">
                    Please wait while we process your {getPaymentMethodName(selectedPaymentMethod).toLowerCase()}.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {paymentStatus === "success" && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800">Payment Successful!</h3>
                  <p className="text-sm text-green-600">Your order has been placed successfully. Redirecting...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {paymentStatus === "failed" && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-800">Payment Failed</h3>
                  <p className="text-sm text-red-600">There was an issue processing your payment. Please try again.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Method Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod} className="space-y-3">
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="upi" id="upi" />
                <Label htmlFor="upi" className="flex items-center cursor-pointer flex-1">
                  <Smartphone className="h-5 w-5 mr-3 text-blue-600" />
                  <div>
                    <div className="font-medium">UPI Payment</div>
                    <div className="text-sm text-gray-500">Pay using Google Pay, PhonePe, Paytm, etc.</div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="netbanking" id="netbanking" />
                <Label htmlFor="netbanking" className="flex items-center cursor-pointer flex-1">
                  <Building className="h-5 w-5 mr-3 text-green-600" />
                  <div>
                    <div className="font-medium">Net Banking</div>
                    <div className="text-sm text-gray-500">Pay directly from your bank account</div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="wallet" id="wallet" />
                <Label htmlFor="wallet" className="flex items-center cursor-pointer flex-1">
                  <Wallet className="h-5 w-5 mr-3 text-purple-600" />
                  <div>
                    <div className="font-medium">Digital Wallet</div>
                    <div className="text-sm text-gray-500">Paytm, Amazon Pay, Mobikwik, etc.</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Order Summary - Only show if we have detailed order data */}
        {orderData.items && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                {orderData.items.map((item: any) => (
                  <div key={item.productId} className="flex items-center space-x-4">
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
                    </div>
                    <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(orderData.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{orderData.shipping === 0 ? "Free" : formatPrice(orderData.shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span>{formatPrice(orderData.tax)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(displayAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Button */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {getPaymentMethodIcon(selectedPaymentMethod)}
                </div>
                <h3 className="text-xl font-semibold mb-2">{getPaymentMethodName(selectedPaymentMethod)}</h3>
                <p className="text-gray-600 mb-4">You will be redirected to complete your payment securely.</p>
                <p className="text-2xl font-bold text-blue-600 mb-6">{formatPrice(displayAmount)}</p>
              </div>

              <Button
                onClick={handleOnlinePayment}
                disabled={isProcessing || paymentStatus === "success"}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : paymentStatus === "success" ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Payment Successful
                  </>
                ) : (
                  <>
                    {getPaymentMethodIcon(selectedPaymentMethod)}
                    <span className="ml-2">Pay with {getPaymentMethodName(selectedPaymentMethod)}</span>
                  </>
                )}
              </Button>

              {paymentStatus === "failed" && (
                <Button
                  onClick={handleOnlinePayment}
                  variant="outline"
                  className="w-full mt-3 bg-transparent"
                  size="lg"
                >
                  Try Again
                </Button>
              )}
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 text-gray-700">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Secure Payment</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Your payment is processed securely through encrypted payment gateways.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Address - Only show if we have address data */}
        {orderData.shippingAddress && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <p className="font-medium">
                  {orderData.shippingAddress.firstName} {orderData.shippingAddress.lastName}
                </p>
                <p>{orderData.shippingAddress.address}</p>
                <p>
                  {orderData.shippingAddress.city}, {orderData.shippingAddress.state}{" "}
                  {orderData.shippingAddress.zipCode}
                </p>
                <p>{orderData.shippingAddress.country}</p>
                <p className="mt-2 text-gray-600">{orderData.shippingAddress.email}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
