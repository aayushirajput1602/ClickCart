"use client"

import type React from "react"

import { useState } from "react"
import { useStripe, useElements, PaymentElement, AddressElement } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"

interface CheckoutFormProps {
  onSuccess: () => void
  onError: (error: string) => void
  orderData: any
}

export default function CheckoutForm({ onSuccess, onError, orderData }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-success`,
      },
      redirect: "if_required",
    })

    if (error) {
      onError(error.message || "Payment failed")
    } else {
      onSuccess()
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
        <AddressElement
          options={{
            mode: "shipping",
            allowedCountries: ["US"],
          }}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
        <PaymentElement />
      </div>

      <Button type="submit" disabled={!stripe || isLoading} className="w-full" size="lg">
        {isLoading ? "Processing..." : `Pay $${orderData.total?.toFixed(2)}`}
      </Button>
    </form>
  )
}
