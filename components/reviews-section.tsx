"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, Trash2, User as UserIcon } from "lucide-react"

interface Review {
  id: string
  userId: string
  rating: number
  comment: string | null
  createdAt: string
  user: {
    name: string | null
    email: string
  }
}

interface ReviewsSectionProps {
  productId: string
}

export function ReviewsSection({ productId }: ReviewsSectionProps) {
  const { data: session } = useSession()
  const [reviews, setReviews] = useState<Review[]>([])
  const [rating, setRating] = useState<{ average: number; count: number }>({ average: 0, count: 0 })
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [productId])

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/products/${productId}/reviews`)
      if (res.ok) {
        const data = await res.json()
        setReviews(data.reviews || [])
        setRating(data.rating || { average: 0, count: 0 })
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!session) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment || null,
        }),
      })

      if (res.ok) {
        await fetchReviews()
        setShowForm(false)
        setReviewRating(5)
        setReviewComment("")
      }
    } catch (error) {
      console.error("Error submitting review:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    try {
      const res = await fetch(`/api/products/${productId}/reviews?reviewId=${reviewId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        await fetchReviews()
      }
    } catch (error) {
      console.error("Error deleting review:", error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl mb-2">Отзывы и рейтинги</CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(rating.average)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-semibold">{rating.average.toFixed(1)}</span>
              <span className="text-muted-foreground">({rating.count} отзывов)</span>
            </div>
          </div>
          {session && !showForm && (
            <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              Написать отзыв
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {showForm && session && (
          <Card className="mb-6 border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg">Ваш отзыв</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">Оценка</label>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setReviewRating(i + 1)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${
                          i < reviewRating
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-gray-200 text-gray-200 hover:fill-yellow-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Комментарий</label>
                <Textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Поделитесь своими впечатлениями..."
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitReview}
                  disabled={submitting}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {submitting ? "Отправка..." : "Отправить"}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Отмена
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <p className="text-muted-foreground">Загрузка отзывов...</p>
        ) : reviews.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Пока нет отзывов. Будьте первым, кто оставит отзыв!
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 rounded-full p-2">
                        <UserIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold">
                          {review.user.name || review.user.email.split("@")[0]}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-gray-200 text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      {session?.user?.id === review.userId && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteReview(review.id)}
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-muted-foreground mt-2">{review.comment}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

