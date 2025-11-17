import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { findWishlistItems, addToWishlist, removeFromWishlist } from "@/lib/db-helpers"

// Получить избранное пользователя
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const wishlist = await findWishlistItems(session.user.id)

    return NextResponse.json(wishlist)
  } catch (error) {
    console.error("Error fetching wishlist:", error)
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 }
    )
  }
}

// Добавить товар в избранное
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { productId } = body

    if (!productId) {
      return NextResponse.json(
        { error: "Missing productId" },
        { status: 400 }
      )
    }

    const wishlistItem = await addToWishlist(session.user.id, productId)

    return NextResponse.json(wishlistItem, { status: 201 })
  } catch (error: any) {
    console.error("Error adding to wishlist:", error)
    return NextResponse.json(
      { error: error.message || "Failed to add to wishlist" },
      { status: 500 }
    )
  }
}

// Удалить товар из избранного
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")

    if (!productId) {
      return NextResponse.json(
        { error: "Missing productId" },
        { status: 400 }
      )
    }

    await removeFromWishlist(session.user.id, productId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error removing from wishlist:", error)
    return NextResponse.json(
      { error: error.message || "Failed to remove from wishlist" },
      { status: 500 }
    )
  }
}

