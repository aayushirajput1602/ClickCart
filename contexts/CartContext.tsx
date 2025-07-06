"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./AuthContext"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/lib/types"
import { stockManager } from "@/lib/stockManager"

interface CartItem extends Product {
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  updateProductStock: (productId: string, quantityPurchased: number) => void
  syncWithServer: () => void
  refreshStock: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const { user, token } = useAuth()
  const { toast } = useToast()

  // Sync cart with server when user logs in
  useEffect(() => {
    if (user && token) {
      // Merge local cart with server cart when user logs in
      mergeLocalCartWithServer()
    } else {
      // Load from localStorage if not logged in
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        setItems(JSON.parse(savedCart))
      }
    }
  }, [user, token])

  // Clear cart when user logs out
  useEffect(() => {
    const handleLogout = () => {
      setItems([])
    }

    window.addEventListener("userLogout", handleLogout)
    return () => window.removeEventListener("userLogout", handleLogout)
  }, [])

  // Save to localStorage when items change (for non-logged in users)
  useEffect(() => {
    if (!user) {
      localStorage.setItem("cart", JSON.stringify(items))
    }
  }, [items, user])

  const syncWithServer = async () => {
    if (!token) return

    try {
      const response = await fetch("/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setItems(
          data.items.map((item: any) => ({
            id: item.productId,
            name: item.name,
            price: item.price,
            image: item.image,
            description: item.description,
            category: item.category,
            quantity: item.quantity,
            rating: 4.5, // Default values for missing fields
            reviews: 0,
            inStock: true,
            stock: 10,
          })),
        )
      }
    } catch (error) {
      console.error("Failed to sync cart:", error)
    }
  }

  const refreshStock = async () => {
    if (items.length === 0) return

    try {
      const productIds = items.map((item) => item.id)
      console.log("Refreshing stock for products:", productIds)

      const stockInfo = await stockManager.getMultipleProductsStock(productIds)
      console.log("Received stock info:", stockInfo)

      setItems((currentItems) => {
        const updatedItems = currentItems
          .map((item) => {
            const stockData = stockInfo[item.id]
            if (stockData) {
              const updatedItem = {
                ...item,
                stock: stockData.stock,
                inStock: stockData.inStock,
              }

              // If item is out of stock, show notification and remove
              if (!stockData.inStock && item.inStock) {
                toast({
                  title: "Item out of stock",
                  description: `${item.name} is no longer available and has been removed from your cart.`,
                  variant: "destructive",
                })
                return null // Will be filtered out
              }

              // If stock is less than cart quantity, adjust quantity
              if (stockData.stock < item.quantity && stockData.stock > 0) {
                toast({
                  title: "Quantity adjusted",
                  description: `${item.name} quantity reduced to ${stockData.stock} (available stock).`,
                })
                updatedItem.quantity = stockData.stock
              }

              // If stock is 0 but item was previously in stock, remove it
              if (stockData.stock === 0 && item.quantity > 0) {
                toast({
                  title: "Item out of stock",
                  description: `${item.name} is now out of stock and has been removed from your cart.`,
                  variant: "destructive",
                })
                return null // Will be filtered out
              }

              return updatedItem
            }
            return item
          })
          .filter(Boolean) as CartItem[] // Remove null items (out of stock)

        return updatedItems
      })
    } catch (error) {
      console.error("Failed to refresh stock:", error)
    }
  }

  const mergeLocalCartWithServer = async () => {
    if (!token) return

    try {
      // Get local cart items
      const localCartString = localStorage.getItem("cart")
      const localCartItems: CartItem[] = localCartString ? JSON.parse(localCartString) : []

      // Get server cart
      const response = await fetch("/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      let serverCartItems: CartItem[] = []
      if (response.ok) {
        const data = await response.json()
        serverCartItems = data.items.map((item: any) => ({
          id: item.productId,
          name: item.name,
          price: item.price,
          image: item.image,
          description: item.description,
          category: item.category,
          quantity: item.quantity,
          rating: 4.5,
          reviews: 0,
          inStock: true,
          stock: 10,
        }))
      }

      // Merge local and server items
      const mergedItems = [...serverCartItems]

      for (const localItem of localCartItems) {
        const existingIndex = mergedItems.findIndex((item) => item.id === localItem.id)
        if (existingIndex > -1) {
          // If item exists in both, use the higher quantity
          mergedItems[existingIndex].quantity = Math.max(mergedItems[existingIndex].quantity, localItem.quantity)
        } else {
          // Add local item to merged cart
          mergedItems.push(localItem)
        }
      }

      // Update server with merged cart
      for (const item of localCartItems) {
        const cartItem = {
          productId: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          description: item.description,
          category: item.category,
        }
        await updateServerCart("add", cartItem)
      }

      // Set merged items and clear local storage
      setItems(mergedItems)
      localStorage.removeItem("cart")

      // Refresh stock after merging
      setTimeout(() => refreshStock(), 1000)
    } catch (error) {
      console.error("Failed to merge cart:", error)
      // Fallback to just syncing with server
      syncWithServer()
    }
  }

  const updateServerCart = async (action: string, item?: any) => {
    if (!token) return

    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, item }),
      })
    } catch (error) {
      console.error("Failed to update server cart:", error)
    }
  }

  const addToCart = async (product: Product) => {
    if (!product.inStock || product.stock === 0) {
      toast({
        title: "Out of stock",
        description: "This product is currently out of stock.",
        variant: "destructive",
      })
      return
    }

    // Check current cart quantity for this product
    const currentCartItem = items.find((item) => item.id === product.id)
    const currentQuantityInCart = currentCartItem ? currentCartItem.quantity : 0

    if (currentQuantityInCart >= product.stock) {
      toast({
        title: "Cannot add more",
        description: `You already have the maximum available quantity (${product.stock}) in your cart.`,
        variant: "destructive",
      })
      return
    }

    const cartItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.description,
      category: product.category,
    }

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id)

      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          return currentItems
        }
        const updatedItems = currentItems.map((item) =>
          item.id === product.id ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) } : item,
        )

        if (user && token) {
          updateServerCart("add", cartItem)
        }

        return updatedItems
      }

      const newItems = [...currentItems, { ...product, quantity: 1 }]

      if (user && token) {
        updateServerCart("add", cartItem)
      }

      return newItems
    })
  }

  const removeFromCart = (productId: string) => {
    setItems((currentItems) => {
      const newItems = currentItems.filter((item) => item.id !== productId)

      if (user && token) {
        updateServerCart("remove", { productId })
      }

      return newItems
    })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(productId)
      return
    }

    setItems((currentItems) => {
      const newItems = currentItems.map((item) => {
        if (item.id === productId) {
          const maxQuantity = item.stock
          const newQuantity = Math.min(quantity, maxQuantity)

          if (user && token) {
            updateServerCart("updateQuantity", { productId, quantity: newQuantity })
          }

          return { ...item, quantity: newQuantity }
        }
        return item
      })

      return newItems
    })
  }

  const clearCart = () => {
    setItems([])

    if (user && token) {
      updateServerCart("clear")
    }
  }

  const updateProductStock = (productId: string, quantityPurchased: number) => {
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id === productId) {
          const newStock = Math.max(0, item.stock - quantityPurchased)
          return {
            ...item,
            stock: newStock,
            inStock: newStock > 0,
          }
        }
        return item
      }),
    )
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        updateProductStock,
        syncWithServer,
        refreshStock,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
