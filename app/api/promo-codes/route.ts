import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { findPromoCodes, findPromoCodeByCode, createPromoCode, calculateDiscount } from "@/lib/db-helpers"

// Получить все промокоды (только админ)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get("activeOnly") !== "false"

    const promoCodes = await findPromoCodes(activeOnly)

    return NextResponse.json(promoCodes)
  } catch (error) {
    console.error("Error fetching promoCodes:", error)
    return NextResponse.json(
      { error: "Failed to fetch promoCodes" },
      { status: 500 }
    )
  }
}

// Создать промокод (только админ)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { code, description, discountType, discountValue, minPurchaseAmount, maxDiscountAmount, usageLimit, validFrom, validUntil } = body

    if (!code || !discountType || !discountValue) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Проверяем, не существует ли уже промокод с таким кодом
    const existing = await findPromoCodeByCode(code)
    if (existing) {
      return NextResponse.json(
        { error: "Promo code already exists" },
        { status: 400 }
      )
    }

    const promoCode = await createPromoCode({
      code,
      description,
      discountType,
      discountValue,
      minPurchaseAmount,
      maxDiscountAmount,
      usageLimit,
      validFrom: validFrom ? new Date(validFrom) : undefined,
      validUntil: validUntil ? new Date(validUntil) : undefined,
    })

    return NextResponse.json(promoCode, { status: 201 })
  } catch (error: any) {
    console.error("Error creating promo code:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create promo code" },
      { status: 500 }
    )
  }
}

