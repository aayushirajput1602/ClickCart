"use client"

import { useState } from "react"
import { Star, ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface Review {
  id: string
  user: string
  rating: number
  comment: string
  date: string
  helpful: number
}

const mockReviews: Review[] = [
  {
    id: "1",
    user: "John D.",
    rating: 5,
    comment: "Excellent product! Great quality and fast shipping.",
    date: "2024-01-15",
    helpful: 12,
  },
  {
    id: "2",
    user: "Sarah M.",
    rating: 4,
    comment: "Good value for money. Would recommend to others.",
    date: "2024-01-10",
    helpful: 8,
  },
  {
    id: "3",
    user: "Mike R.",
    rating: 5,
    comment: "Perfect! Exactly what I was looking for.",
    date: "2024-01-05",
    helpful: 15,
  },
]

interface ProductReviewsProps {
  productId: string
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews] = useState<Review[]>(mockReviews)
  const [newReview, setNewReview] = useState("")
  const [newRating, setNewRating] = useState(5)
  const { toast } = useToast()

  const handleSubmitReview = () => {
    if (newReview.trim()) {
      toast({
        title: "Review submitted",
        description: "Thank you for your review!",
      })
      setNewReview("")
      setNewRating(5)
    }
  }

  return (
    <div className="space-y-6">
      {/* Write a review */}
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Write a Review</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Rating</label>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} onClick={() => setNewRating(star)} className="focus:outline-none">
                <Star
                  className={`h-6 w-6 ${star <= newRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Your Review</label>
          <Textarea
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
            placeholder="Share your thoughts about this product..."
            rows={4}
          />
        </div>

        <Button onClick={handleSubmitReview}>Submit Review</Button>
      </div>

      {/* Reviews list */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Customer Reviews ({reviews.length})</h3>

        {reviews.map((review) => (
          <div key={review.id} className="border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="font-medium">{review.user}</span>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-sm text-gray-500">{review.date}</span>
            </div>

            <p className="text-gray-700 mb-3">{review.comment}</p>

            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <button className="flex items-center space-x-1 hover:text-gray-700">
                <ThumbsUp className="h-4 w-4" />
                <span>Helpful ({review.helpful})</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
