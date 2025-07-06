import { Badge } from "@/components/ui/badge"

interface StockStatusProps {
  inStock: boolean
  stock: number
  className?: string
}

export default function StockStatus({ inStock, stock, className = "" }: StockStatusProps) {
  if (!inStock || stock === 0) {
    return (
      <Badge variant="destructive" className={className}>
        Out of Stock
      </Badge>
    )
  }

  if (stock <= 5) {
    return (
      <Badge variant="secondary" className={`bg-orange-100 text-orange-800 ${className}`}>
        Only {stock} left!
      </Badge>
    )
  }

  if (stock <= 10) {
    return (
      <Badge variant="secondary" className={`bg-yellow-100 text-yellow-800 ${className}`}>
        Low Stock ({stock} left)
      </Badge>
    )
  }

  return (
    <Badge variant="secondary" className={`bg-green-100 text-green-800 ${className}`}>
      In Stock ({stock} available)
    </Badge>
  )
}
