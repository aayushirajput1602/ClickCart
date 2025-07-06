import Link from "next/link"
import { CheckCircle, Package, Truck, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function OrderConfirmationPage() {
  const orderNumber = "ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase()
  const estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />

        <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>

        <p className="text-gray-600 mb-8">
          Thank you for your purchase. Your order has been confirmed and will be shipped soon.
        </p>

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-left">
              <h3 className="font-semibold mb-2">Order Number</h3>
              <p className="text-gray-600">{orderNumber}</p>
            </div>
            <div className="text-left">
              <h3 className="font-semibold mb-2">Estimated Delivery</h3>
              <p className="text-gray-600">{estimatedDelivery}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center p-4">
            <CreditCard className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Payment Confirmed</h3>
            <p className="text-sm text-gray-600">Your payment has been processed</p>
          </div>
          <div className="text-center p-4">
            <Package className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Order Processing</h3>
            <p className="text-sm text-gray-600">We're preparing your items</p>
          </div>
          <div className="text-center p-4">
            <Truck className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Shipping Soon</h3>
            <p className="text-sm text-gray-600">You'll receive tracking info</p>
          </div>
        </div>

        <div className="space-y-4">
          <Link href="/orders">
            <Button className="w-full md:w-auto">Track Your Order</Button>
          </Link>
          <Link href="/category/all">
            <Button variant="outline" className="w-full md:w-auto md:ml-4">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
