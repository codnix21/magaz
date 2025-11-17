import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { findReviewsByProductId, getProductRating, createReview, deleteReview } from "@/lib/db-helpers"

export const dynamic = 'force-dynamic'

// Получить отзывы товара
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const { id: productId } = resolvedParams

    const [reviews, rating] = await Promise.all([
      findReviewsByProductId(productId),
      getProductRating(productId),
    ])

    return NextResponse.json({ reviews, rating })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    )
  }
}

// Создать отзыв
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const resolvedParams = await Promise.resolve(params)
    const { id: productId } = resolvedParams
    const body = await request.json()
    const { rating, comment } = body

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      )
    }

    const review = await createReview({
      userId: session.user.id,
      productId,
      rating,
      comment,
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error: any) {
    console.error("Error creating review:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create review" },
      { status: 500 }
    )
  }
}

// Удалить отзыв
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const reviewId = searchParams.get("reviewId")

    if (!reviewId) {
      return NextResponse.json(
        { error: "Missing reviewId" },
        { status: 400 }
      )
    }

    await deleteReview(reviewId, session.user.id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting review:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete review" },
      { status: 500 }
    )
  }
}

