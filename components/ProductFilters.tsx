"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Star } from "lucide-react"

export default function ProductFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [priceRange, setPriceRange] = useState([
    Number(searchParams.get("minPrice")) || 0,
    Number(searchParams.get("maxPrice")) || 15000,
  ])
  const [selectedRating, setSelectedRating] = useState(searchParams.get("rating") || "")
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "")

  // Format price in Indian rupees
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price)
  }

  const updateURL = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === "" || value === "0") {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })

    const newURL = `${pathname}?${params.toString()}`
    router.push(newURL, { scroll: false })
  }

  const applyFilters = () => {
    updateURL({
      minPrice: priceRange[0] > 0 ? priceRange[0].toString() : null,
      maxPrice: priceRange[1] < 15000 ? priceRange[1].toString() : null,
      rating: selectedRating || null,
      sort: sortBy || null,
    })
  }

  const clearFilters = () => {
    setPriceRange([0, 15000])
    setSelectedRating("")
    setSortBy("")

    // Clear URL params
    router.push(pathname, { scroll: false })
  }

  // Handle sort change immediately
  const handleSortChange = (value: string) => {
    setSortBy(value)
    updateURL({
      minPrice: priceRange[0] > 0 ? priceRange[0].toString() : null,
      maxPrice: priceRange[1] < 15000 ? priceRange[1].toString() : null,
      rating: selectedRating || null,
      sort: value || null,
    })
  }

  // Handle rating change immediately
  const handleRatingChange = (value: string) => {
    setSelectedRating(value)
    updateURL({
      minPrice: priceRange[0] > 0 ? priceRange[0].toString() : null,
      maxPrice: priceRange[1] < 15000 ? priceRange[1].toString() : null,
      rating: value || null,
      sort: sortBy || null,
    })
  }

  // Debounced price range update
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateURL({
        minPrice: priceRange[0] > 0 ? priceRange[0].toString() : null,
        maxPrice: priceRange[1] < 15000 ? priceRange[1].toString() : null,
        rating: selectedRating || null,
        sort: sortBy || null,
      })
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [priceRange])

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-6">Filters</h3>

      {/* Sort by */}
      <div className="mb-6">
        <Label className="text-sm font-medium mb-2 block">Sort by</Label>
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select sorting" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Price range */}
      <div className="mb-6">
        <Label className="text-sm font-medium mb-2 block">Price Range</Label>
        <div className="px-2">
          <Slider value={priceRange} onValueChange={setPriceRange} max={15000} min={0} step={100} className="mb-4" />
          <div className="flex justify-between text-sm text-gray-600">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
        </div>

        {/* Quick price range buttons */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={() => setPriceRange([0, 1000])} className="text-xs">
            Under ₹1,000
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPriceRange([1000, 3000])} className="text-xs">
            ₹1,000 - ₹3,000
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPriceRange([3000, 7000])} className="text-xs">
            ₹3,000 - ₹7,000
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPriceRange([7000, 15000])} className="text-xs">
            Above ₹7,000
          </Button>
        </div>
      </div>

      {/* Rating filter */}
      <div className="mb-6">
        <Label className="text-sm font-medium mb-2 block">Minimum Rating</Label>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="rating"
              value=""
              checked={selectedRating === ""}
              onChange={(e) => handleRatingChange(e.target.value)}
              className="text-blue-600"
            />
            <span className="text-sm">All Ratings</span>
          </label>
          {[4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="rating"
                value={rating}
                checked={selectedRating === rating.toString()}
                onChange={(e) => handleRatingChange(e.target.value)}
                className="text-blue-600"
              />
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                  />
                ))}
                <span className="ml-2 text-sm">& up</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="space-y-2">
        <Button onClick={clearFilters} variant="outline" className="w-full bg-transparent">
          Clear All Filters
        </Button>
      </div>
    </div>
  )
}
