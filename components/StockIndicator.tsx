import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, Clock } from "lucide-react"

interface StockIndicatorProps {
  stock: number
  inStock: boolean
  showIcon?: boolean
  size?: "sm" | "md" | "lg"
}

export default function StockIndicator({ stock, inStock, showIcon = true, size = "md" }: StockIndicatorProps) {
  const getStockStatus = () => {
    if (!inStock || stock === 0) {
      return {
        text: "Out of Stock",
        variant: "destructive" as const,
        icon: AlertTriangle,
        color: "text-red-600",
      }
    }

    if (stock <= 3) {
      return {
        text: `Only ${stock} left!`,
        variant: "secondary" as const,
        icon: AlertTriangle,
        color: "text-orange-600",
        bgColor: "bg-orange-100",
      }
    }

    if (stock <= 10) {
      return {
        text: `${stock} in stock`,
        variant: "secondary" as const,
        icon: Clock,
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
      }
    }

    return {
      text: "In Stock",
      variant: "secondary" as const,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    }
  }

  const status = getStockStatus()
  const Icon = status.icon

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2",
  }

  return (
    <Badge
      variant={status.variant}
      className={`${sizeClasses[size]} ${status.bgColor || ""} ${status.color} flex items-center gap-1`}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {status.text}
    </Badge>
  )
}
