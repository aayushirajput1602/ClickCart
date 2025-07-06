"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./AuthContext"
import type { Product } from "@/lib/types"

interface WishlistContextType {
  items: Product[]
  addToWishlist: (product: Product) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
  syncWithServer: () => void
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>([])
  const { user, token } = useAuth()

  // Sync wishlist with server when user logs in
  useEffect(() => {
    if (user && token) {
      // Merge local wishlist with server wishlist when user logs in
      mergeLocalWishlistWithServer()
    } else {
      // Load from localStorage if not logged in
      const savedWishlist = localStorage.getItem("wishlist")
      if (savedWishlist) {
        setItems(JSON.parse(savedWishlist))
      }
    }
  }, [user, token])

  // Clear wishlist when user logs out
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
      localStorage.setItem("wishlist", JSON.stringify(items))
    }
  }, [items, user])

  const syncWithServer = async () => {
    if (!token) return

    try {
      const response = await fetch("/api/wishlist", {
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
            rating: item.rating,
            reviews: item.reviews,
            inStock: item.inStock,
            stock: item.stock,
            originalPrice: item.originalPrice,
            discount: item.discount,
          })),
        )
      }
    } catch (error) {
      console.error("Failed to sync wishlist:", error)
    }
  }

  const mergeLocalWishlistWithServer = async () => {
    if (!token) return

    try {
      // Get local wishlist items
      const localWishlistString = localStorage.getItem("wishlist")
      const localWishlistItems: Product[] = localWishlistString ? JSON.parse(localWishlistString) : []

      // Get server wishlist
      const response = await fetch("/api/wishlist", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      let serverWishlistItems: Product[] = []
      if (response.ok) {
        const data = await response.json()
        serverWishlistItems = data.items.map((item: any) => ({
          id: item.productId,
          name: item.name,
          price: item.price,
          image: item.image,
          description: item.description,
          category: item.category,
          rating: item.rating,
          reviews: item.reviews,
          inStock: item.inStock,
          stock: item.stock,
          originalPrice: item.originalPrice,
          discount: item.discount,
        }))
      }

      // Merge local and server items (remove duplicates)
      const mergedItems = [...serverWishlistItems]

      for (const localItem of localWishlistItems) {
        const exists = mergedItems.find((item) => item.id === localItem.id)
        if (!exists) {
          mergedItems.push(localItem)

          // Add to server
          const wishlistItem = {
            productId: localItem.id,
            name: localItem.name,
            price: localItem.price,
            image: localItem.image,
            description: localItem.description,
            category: localItem.category,
            rating: localItem.rating,
            reviews: localItem.reviews,
            inStock: localItem.inStock,
            stock: localItem.stock,
            originalPrice: localItem.originalPrice,
            discount: localItem.discount,
          }
          await updateServerWishlist("add", wishlistItem)
        }
      }

      // Set merged items and clear local storage
      setItems(mergedItems)
      localStorage.removeItem("wishlist")
    } catch (error) {
      console.error("Failed to merge wishlist:", error)
      // Fallback to just syncing with server
      syncWithServer()
    }
  }

  const updateServerWishlist = async (action: string, item?: any) => {
    if (!token) return

    try {
      await fetch("/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, item }),
      })
    } catch (error) {
      console.error("Failed to update server wishlist:", error)
    }
  }

  const addToWishlist = (product: Product) => {
    setItems((currentItems) => {
      const exists = currentItems.find((item) => item.id === product.id)
      if (exists) return currentItems

      const wishlistItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        description: product.description,
        category: product.category,
        rating: product.rating,
        reviews: product.reviews,
        inStock: product.inStock,
        stock: product.stock,
        originalPrice: product.originalPrice,
        discount: product.discount,
      }

      if (user && token) {
        updateServerWishlist("add", wishlistItem)
      }

      return [...currentItems, product]
    })
  }

  const removeFromWishlist = (productId: string) => {
    setItems((currentItems) => {
      const newItems = currentItems.filter((item) => item.id !== productId)

      if (user && token) {
        updateServerWishlist("remove", { productId })
      }

      return newItems
    })
  }

  const isInWishlist = (productId: string) => {
    return items.some((item) => item.id === productId)
  }

  const clearWishlist = () => {
    setItems([])

    if (user && token) {
      updateServerWishlist("clear")
    }
  }

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        syncWithServer,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
