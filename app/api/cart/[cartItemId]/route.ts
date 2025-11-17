import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { updateCartItem, deleteCartItem } from "@/lib/db-helpers"

export async function PUT(
  request: Request,
  { params }: { params: { cartItemId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { quantity } = body

    // Валидация входных данных
    if (!params.cartItemId || typeof params.cartItemId !== 'string' || params.cartItemId.trim().length === 0) {
      return NextResponse.json(
        { error: "Cart item ID is required" },
        { status: 400 }
      )
    }

    const quantityNum = parseInt(quantity)
    if (isNaN(quantityNum) || quantityNum < 1 || quantityNum > 999) {
      return NextResponse.json(
        { error: "Quantity must be between 1 and 999" },
        { status: 400 }
      )
    }

    const cartItem = await updateCartItem(params.cartItemId.trim(), quantityNum)

    return NextResponse.json(cartItem)
  } catch (error) {
    console.error("Error updating cart item:", error)
    return NextResponse.json(
      { error: "Failed to update cart item" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { cartItemId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Валидация входных данных
    if (!params.cartItemId || typeof params.cartItemId !== 'string' || params.cartItemId.trim().length === 0) {
      return NextResponse.json(
        { error: "Cart item ID is required" },
        { status: 400 }
      )
    }

    await deleteCartItem(params.cartItemId.trim())

    return NextResponse.json({ message: "Item removed from cart" })
  } catch (error) {
    console.error("Error removing from cart:", error)
    return NextResponse.json(
      { error: "Failed to remove from cart" },
      { status: 500 }
    )
  }
}


