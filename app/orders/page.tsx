"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Package, Truck, CheckCircle, Clock, Eye, X, RefreshCw, Download, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

interface Order {
  _id: string
  orderNumber: string
  items: Array<{
    productId: string
    name: string
    price: number
    quantity: number
    image: string
  }>
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded"
  createdAt: string
  refundId?: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null)
  const [reorderingOrder, setReorderingOrder] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState("")
  const { user, token } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user && token) {
      fetchOrders()
    }
  }, [user, token])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
      } else {
        throw new Error("Failed to fetch orders")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    setCancellingOrder(orderId)
    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: cancelReason }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Order cancelled",
          description: data.refundId
            ? "Your order has been cancelled and refund has been processed."
            : "Your order has been cancelled successfully.",
        })

        // Refresh orders to show updated status
        await fetchOrders()
        setCancelReason("")
      } else {
        throw new Error(data.error || "Failed to cancel order")
      }
    } catch (error: any) {
      toast({
        title: "Cancellation failed",
        description: error.message || "Failed to cancel order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setCancellingOrder(null)
    }
  }

  const handleReorderItems = async (orderId: string) => {
    setReorderingOrder(orderId)
    try {
      const response = await fetch(`/api/orders/${orderId}/reorder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        const { addedItems, unavailableItems, totalItemsAdded } = data

        if (totalItemsAdded > 0) {
          toast({
            title: "Items added to cart",
            description: `${totalItemsAdded} items have been added to your cart.`,
          })

          if (unavailableItems.length > 0) {
            toast({
              title: "Some items unavailable",
              description: `${unavailableItems.length} items could not be added due to stock limitations.`,
              variant: "destructive",
            })
          }
        } else {
          toast({
            title: "No items added",
            description: "All items from this order are currently unavailable.",
            variant: "destructive",
          })
        }
      } else {
        throw new Error(data.error || "Failed to reorder items")
      }
    } catch (error: any) {
      toast({
        title: "Reorder failed",
        description: error.message || "Failed to reorder items. Please try again.",
        variant: "destructive",
      })
    } finally {
      setReorderingOrder(null)
    }
  }

  const handleDownloadInvoice = async (orderId: string, orderNumber: string) => {
    try {
      console.log("📄 Downloading invoice for order:", orderId)

      // Create a temporary link with token in URL
      const invoiceUrl = `/api/orders/${orderId}/invoice?token=${encodeURIComponent(token)}`

      // Open in new tab
      const newWindow = window.open(invoiceUrl, "_blank")

      if (!newWindow) {
        toast({
          title: "Popup blocked",
          description: "Please allow popups for this site to download invoices.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("❌ Invoice download error:", error)
      toast({
        title: "Download failed",
        description: "Failed to download invoice. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
      case "processing":
        return <Clock className="h-4 w-4" />
      case "shipped":
        return <Truck className="h-4 w-4" />
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <X className="h-4 w-4" />
      case "refunded":
        return <RefreshCw className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      case "refunded":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const canCancelOrder = (order: Order) => {
    return order.status === "pending" || order.status === "processing"
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Package className="h-24 w-24 mx-auto text-gray-300 mb-6" />
        <h1 className="text-3xl font-bold mb-4">Please log in</h1>
        <p className="text-gray-600 mb-8">You need to be logged in to view your orders.</p>
        <Link href="/login">
          <Button size="lg">Log In</Button>
        </Link>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your orders...</p>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Package className="h-24 w-24 mx-auto text-gray-300 mb-6" />
        <h1 className="text-3xl font-bold mb-4">No orders yet</h1>
        <p className="text-gray-600 mb-8">When you place orders, they'll appear here.</p>
        <Link href="/category/all">
          <Button size="lg">Start Shopping</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{order.orderNumber}</h3>
                <p className="text-gray-600">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                {order.refundId && <p className="text-sm text-orange-600 mt-1">Refund ID: {order.refundId}</p>}
              </div>
              <Badge className={`${getStatusColor(order.status)} flex items-center space-x-1 w-fit`}>
                {getStatusIcon(order.status)}
                <span className="capitalize">{order.status}</span>
              </Badge>
            </div>

            {/* Order Items */}
            <div className="mb-4">
              <h4 className="font-medium mb-3">Items Ordered:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      width={50}
                      height={50}
                      className="rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold">${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <span className="text-sm text-gray-600">Total</span>
                <p className="font-semibold">${order.total.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Items</span>
                <p className="font-semibold">
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)} item
                  {order.items.reduce((sum, item) => sum + item.quantity, 0) > 1 ? "s" : ""}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Delivery</span>
                <p className="font-semibold">
                  {order.status === "delivered"
                    ? "Delivered"
                    : order.status === "cancelled"
                      ? "Cancelled"
                      : order.status === "refunded"
                        ? "Refunded"
                        : "Estimated: 3-5 days"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href={`/orders/${order._id}`}>
                <Button variant="outline" size="sm" className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>View Details</span>
                </Button>
              </Link>

              {order.status === "shipped" && (
                <Button variant="outline" size="sm">
                  Track Package
                </Button>
              )}

              {order.status === "delivered" && (
                <Button variant="outline" size="sm">
                  Write Review
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReorderItems(order._id)}
                disabled={reorderingOrder === order._id}
                className="flex items-center space-x-1"
              >
                <RotateCcw className="h-4 w-4" />
                <span>{reorderingOrder === order._id ? "Adding..." : "Reorder Items"}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownloadInvoice(order._id, order.orderNumber)}
                className="flex items-center space-x-1"
              >
                <Download className="h-4 w-4" />
                <span>Download Invoice</span>
              </Button>

              {canCancelOrder(order) && (
                <Dialog>
                  <DialogTrigger asChild>
                    {/* <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <X className="h-4 w-4 mr-1" />
                      Cancel Order
                    </Button> */}
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cancel Order</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to cancel order {order.orderNumber}? This action cannot be undone.
                        {order.status === "processing" && " A refund will be processed if payment was made."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cancelReason">Reason for cancellation (optional)</Label>
                        <Textarea
                          id="cancelReason"
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          placeholder="Please let us know why you're cancelling this order..."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setCancelReason("")}>
                        Keep Order
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleCancelOrder(order._id)}
                        disabled={cancellingOrder === order._id}
                      >
                        {cancellingOrder === order._id ? "Cancelling..." : "Cancel Order"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
