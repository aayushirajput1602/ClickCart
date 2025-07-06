export class StockManager {
  private static instance: StockManager
  private stockCache: Map<string, { stock: number; inStock: boolean; lastUpdated: number }> = new Map()
  private readonly CACHE_DURATION = 30000 // 30 seconds

  static getInstance(): StockManager {
    if (!StockManager.instance) {
      StockManager.instance = new StockManager()
    }
    return StockManager.instance
  }

  async getProductStock(productId: string): Promise<{ stock: number; inStock: boolean } | null> {
    const cached = this.stockCache.get(productId)
    const now = Date.now()

    // Return cached data if it's still fresh
    if (cached && now - cached.lastUpdated < this.CACHE_DURATION) {
      return { stock: cached.stock, inStock: cached.inStock }
    }

    try {
      const response = await fetch(`/api/products/${productId}`)
      if (response.ok) {
        const data = await response.json()
        const product = data.product

        // Update cache
        this.stockCache.set(productId, {
          stock: product.stock,
          inStock: product.inStock,
          lastUpdated: now,
        })

        return { stock: product.stock, inStock: product.inStock }
      }
    } catch (error) {
      console.error("Failed to fetch product stock:", error)
    }

    return null
  }

  async getMultipleProductsStock(productIds: string[]): Promise<Record<string, { stock: number; inStock: boolean }>> {
    try {
      const response = await fetch("/api/products/stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productIds }),
      })

      if (response.ok) {
        const data = await response.json()
        const now = Date.now()

        // Update cache for all products
        Object.entries(data.stockInfo).forEach(([productId, stockInfo]: [string, any]) => {
          this.stockCache.set(productId, {
            stock: stockInfo.stock,
            inStock: stockInfo.inStock,
            lastUpdated: now,
          })
        })

        return data.stockInfo
      }
    } catch (error) {
      console.error("Failed to fetch multiple products stock:", error)
    }

    return {}
  }

  invalidateCache(productId?: string) {
    if (productId) {
      this.stockCache.delete(productId)
    } else {
      this.stockCache.clear()
    }
  }

  updateLocalStock(productId: string, newStock: number) {
    this.stockCache.set(productId, {
      stock: newStock,
      inStock: newStock > 0,
      lastUpdated: Date.now(),
    })
  }
}

export const stockManager = StockManager.getInstance()
