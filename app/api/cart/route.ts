import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { findCartItems, addToCart, clearCart, deleteCartItem } from "@/lib/db-helpers"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ items: [] })
    }

    const cartItems = await findCartItems(session.user.id)

    return NextResponse.json({ items: cartItems })
  } catch (error) {
    console.error("Error fetching cart:", error)
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    )
  }
}

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
    const { productId, variantId, quantity } = body

    // Валидация входных данных
    if (!productId || typeof productId !== 'string' || productId.trim().length === 0) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      )
    }

    const quantityNum = quantity ? parseInt(quantity) : 1
    if (isNaN(quantityNum) || quantityNum < 1 || quantityNum > 999) {
      return NextResponse.json(
        { error: "Quantity must be between 1 and 999" },
        { status: 400 }
      )
    }

    if (variantId && (typeof variantId !== 'string' || variantId.trim().length === 0)) {
      return NextResponse.json(
        { error: "Variant ID must be a valid string if provided" },
        { status: 400 }
      )
    }

    const cartItem = await addToCart(
      session.user.id, 
      productId.trim(), 
      quantityNum, 
      variantId ? variantId.trim() : null
    )

    return NextResponse.json(cartItem, { status: 201 })
  } catch (error) {
    console.error("Error adding to cart:", error)
    return NextResponse.json(
      { error: "Failed to add to cart" },
      { status: 500 }
    )
  }
}

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
    const cartItemId = searchParams.get("cartItemId")

    if (cartItemId) {
      await deleteCartItem(cartItemId)
      return NextResponse.json({ message: "Item removed from cart" })
    }

    await clearCart(session.user.id)

    return NextResponse.json({ message: "Cart cleared" })
  } catch (error) {
    console.error("Error removing from cart:", error)
    return NextResponse.json(
      { error: "Failed to remove from cart" },
      { status: 500 }
    )
  }
}


