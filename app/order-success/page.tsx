import Link from "next/link"
import { CheckCircle, Package, Truck, CreditCard, Download, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function OrderSuccessPage() {
  const orderNumber = "ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase()
  const estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
  const orderTotal = "$" + (Math.random() * 500 + 50).toFixed(2)

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Order Placed Successfully! 🎉</h1>
            <p className="text-xl text-gray-600 mb-2">
              Thank you for your purchase! Your order has been confirmed and is being processed.
            </p>
            <p className="text-lg text-gray-500">Order confirmation has been sent to your email address.</p>
          </div>

          {/* Order Details Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Order Number</h3>
                  <p className="text-gray-600 font-mono">{orderNumber}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Order Total</h3>
                  <p className="text-2xl font-bold text-green-600">{orderTotal}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Estimated Delivery</h3>
                  <p className="text-gray-600">{estimatedDelivery}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Status Timeline */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-2">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-green-600 mb-1">Payment Confirmed</h3>
                  <p className="text-sm text-gray-500">Your payment has been processed</p>
                </div>

                <div className="flex-1 h-1 bg-blue-200 mx-4"></div>

                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-2">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-blue-600 mb-1">Processing</h3>
                  <p className="text-sm text-gray-500">We're preparing your items</p>
                </div>

                <div className="flex-1 h-1 bg-gray-200 mx-4"></div>

                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mb-2">
                    <Truck className="h-6 w-6 text-gray-600" />
                  </div>
                  <h3 className="font-semibold text-gray-600 mb-1">Shipping</h3>
                  <p className="text-sm text-gray-500">You'll receive tracking info</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Package className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Track Order</h3>
                <p className="text-sm text-gray-600">Monitor your order progress</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Download className="h-8 w-8 text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Download Invoice</h3>
                <p className="text-sm text-gray-600">Get your order receipt</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Star className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Rate Products</h3>
                <p className="text-sm text-gray-600">Share your experience</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Package className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Reorder</h3>
                <p className="text-sm text-gray-600">Buy these items again</p>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/orders">
              <Button size="lg" className="w-full sm:w-auto">
                <Package className="h-5 w-5 mr-2" />
                View All Orders
              </Button>
            </Link>
            <Link href="/category/all">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Continue Shopping
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Help Section */}
          <Card className="mt-8 bg-blue-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
              <p className="text-blue-700 mb-4">
                If you have any questions about your order, our customer support team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button variant="outline" size="sm">
                  Contact Support
                </Button>
                <Button variant="outline" size="sm">
                  Live Chat
                </Button>
                <Button variant="outline" size="sm">
                  FAQ
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
