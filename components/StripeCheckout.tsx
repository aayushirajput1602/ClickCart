"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, Smartphone } from "lucide-react"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutFormProps {
  amount: number
  onSuccess: () => void
}

function CheckoutForm({ amount, onSuccess }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"card" | "online">("card")
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (paymentMethod === "online") {
      // Store order data and redirect to online payment page
      const orderData = sessionStorage.getItem("checkoutData")
      if (orderData) {
        sessionStorage.setItem("paymentAmount", amount.toString())
        router.push("/payment/online")
        return
      }
    }

    if (!stripe || !elements) {
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      return
    }

    setIsLoading(true)

    try {
      // Create payment intent
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: Math.round(amount * 100) }), // Convert to cents
      })

      const { clientSecret } = await response.json()

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      })

      if (error) {
        toast({
          title: "Payment failed",
          description: error.message,
          variant: "destructive",
        })
      } else if (paymentIntent.status === "succeeded") {
        toast({
          title: "Payment successful",
          description: "Your payment has been processed successfully.",
        })
        onSuccess()
      }
    } catch (error) {
      toast({
        title: "Payment error",
        description: "An error occurred while processing your payment.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Payment Details</h3>

        {/* Payment Method Selection */}
        <div className="space-y-3">
          {/* Card Option */}
          <div
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              paymentMethod === "card" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
            }`}
            onClick={() => setPaymentMethod("card")}
          >
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === "card"}
                onChange={() => setPaymentMethod("card")}
                className="text-blue-600"
              />
              <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-gray-600" />
              </div>
              <span className="font-medium">Card</span>
            </div>
          </div>

          {/* Online Payment Option */}
          <div
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              paymentMethod === "online" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
            }`}
            onClick={() => setPaymentMethod("online")}
          >
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                name="paymentMethod"
                value="online"
                checked={paymentMethod === "online"}
                onChange={() => setPaymentMethod("online")}
                className="text-blue-600"
              />
              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                <Smartphone className="h-4 w-4 text-blue-600" />
              </div>
              <span className="font-medium">Online Payment</span>
            </div>
          </div>
        </div>

        {/* Card Information Form */}
        {paymentMethod === "card" && (
          <div className="space-y-4 mt-4 p-4 border rounded-lg bg-gray-50">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Card Information</label>
              <div className="border rounded-md p-3 bg-white">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: "16px",
                        color: "#424770",
                        "::placeholder": {
                          color: "#aab7c4",
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Online Payment Information */}
        {paymentMethod === "online" && (
          <div className="space-y-4 mt-4 p-4 border rounded-lg bg-blue-50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                <Smartphone className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-blue-900">Online Payment Options</p>
                <p className="text-sm text-blue-700">UPI, Net Banking, Digital Wallets</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading || !stripe}>
        {isLoading ? "Processing..." : `Pay ${formatPrice(amount)}`}
      </Button>
    </form>
  )
}

interface StripeCheckoutProps {
  amount: number
  onSuccess: () => void
}

export default function StripeCheckout({ amount, onSuccess }: StripeCheckoutProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm amount={amount} onSuccess={onSuccess} />
    </Elements>
  )
}
