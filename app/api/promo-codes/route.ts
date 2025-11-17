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

    // Валидация входных данных
    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return NextResponse.json(
        { error: "Promo code is required and must be a non-empty string" },
        { status: 400 }
      )
    }

    if (!discountType || !['PERCENTAGE', 'FIXED'].includes(discountType)) {
      return NextResponse.json(
        { error: "Discount type must be 'PERCENTAGE' or 'FIXED'" },
        { status: 400 }
      )
    }

    const discountValueNum = parseFloat(discountValue)
    if (isNaN(discountValueNum) || discountValueNum <= 0) {
      return NextResponse.json(
        { error: "Discount value must be a valid positive number" },
        { status: 400 }
      )
    }

    if (discountType === 'PERCENTAGE' && discountValueNum > 100) {
      return NextResponse.json(
        { error: "Percentage discount cannot exceed 100%" },
        { status: 400 }
      )
    }

    if (minPurchaseAmount !== undefined && minPurchaseAmount !== null) {
      const minPurchaseAmountNum = parseFloat(minPurchaseAmount)
      if (isNaN(minPurchaseAmountNum) || minPurchaseAmountNum < 0) {
        return NextResponse.json(
          { error: "Minimum purchase amount must be a valid non-negative number" },
          { status: 400 }
        )
      }
    }

    if (maxDiscountAmount !== undefined && maxDiscountAmount !== null) {
      const maxDiscountAmountNum = parseFloat(maxDiscountAmount)
      if (isNaN(maxDiscountAmountNum) || maxDiscountAmountNum < 0) {
        return NextResponse.json(
          { error: "Maximum discount amount must be a valid non-negative number" },
          { status: 400 }
        )
      }
    }

    if (usageLimit !== undefined && usageLimit !== null) {
      const usageLimitNum = parseInt(usageLimit)
      if (isNaN(usageLimitNum) || usageLimitNum < 1) {
        return NextResponse.json(
          { error: "Usage limit must be a valid positive integer" },
          { status: 400 }
        )
      }
    }

    // Проверяем, не существует ли уже промокод с таким кодом
    const existing = await findPromoCodeByCode(code.toUpperCase().trim())
    if (existing) {
      return NextResponse.json(
        { error: "Promo code already exists" },
        { status: 400 }
      )
    }

    const promoCode = await createPromoCode({
      code: code.toUpperCase().trim(),
      description: description ? description.trim() : null,
      discountType,
      discountValue: discountValueNum,
      minPurchaseAmount: minPurchaseAmount !== undefined && minPurchaseAmount !== null ? parseFloat(minPurchaseAmount) : null,
      maxDiscountAmount: maxDiscountAmount !== undefined && maxDiscountAmount !== null ? parseFloat(maxDiscountAmount) : null,
      usageLimit: usageLimit !== undefined && usageLimit !== null ? parseInt(usageLimit) : null,
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

