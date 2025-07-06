import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  name: string
  email: string
  password: string
  firstName?: string
  lastName?: string
  phone?: string
  dateOfBirth?: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  resetPasswordToken?: string
  resetPasswordExpires?: Date
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  _id?: ObjectId
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  stock: number
  inStock: boolean
  rating: number
  reviews: number
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  image: string
  description: string
  category: string
}

export interface Cart {
  _id?: ObjectId
  userId: ObjectId
  items: CartItem[]
  updatedAt: Date
}

export interface OrderItem {
  productId: string
  name: string
  description: string
  price: number
  quantity: number
  image: string
}

export interface ShippingAddress {
  firstName: string
  lastName: string
  email: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface Order {
  _id?: ObjectId
  userId: ObjectId
  orderNumber: string
  items: OrderItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded"
  paymentMethod: string
  paymentIntentId?: string
  shippingAddress: ShippingAddress
  refundId?: string
  refundedAt?: Date
  refundStatus?: string
  refundError?: string
  cancelledAt?: Date
  cancellationId?: ObjectId
  createdAt: Date
  updatedAt: Date
}

export interface OrderCancellation {
  _id?: ObjectId
  orderId: ObjectId
  userId: ObjectId
  orderNumber: string
  originalOrder: Order
  cancellationReason: string
  refundAmount: number
  refundId?: string
  stripeRefundStatus?: string
  refundError?: string
  cancelledBy: "customer" | "admin" | "system"
  cancelledAt: Date
  refundProcessedAt?: Date
  createdAt: Date
}

export interface Wishlist {
  _id?: ObjectId
  userId: ObjectId
  items: {
    productId: string
    name: string
    price: number
    image: string
    addedAt: Date
  }[]
  updatedAt: Date
}
