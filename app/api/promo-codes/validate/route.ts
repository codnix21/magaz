import { NextResponse } from "next/server"
import { findPromoCodeByCode, calculateDiscount } from "@/lib/db-helpers"

// Проверить и вычислить скидку для промокода
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { code, subtotal } = body

    if (!code || !subtotal) {
      return NextResponse.json(
        { error: "Missing code or subtotal" },
        { status: 400 }
      )
    }

    const promoCode = await findPromoCodeByCode(code.toUpperCase())

    if (!promoCode) {
      return NextResponse.json(
        { error: "Invalid or expired promo code" },
        { status: 400 }
      )
    }

    const discountAmount = await calculateDiscount(promoCode, subtotal)
    const total = subtotal - discountAmount

    return NextResponse.json({
      valid: true,
      promoCode: {
        id: promoCode.id,
        code: promoCode.code,
        description: promoCode.description,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue,
      },
      discountAmount,
      subtotal,
      total,
    })
  } catch (error: any) {
    console.error("Error validating promo code:", error)
    return NextResponse.json(
      { error: error.message || "Failed to validate promo code" },
      { status: 500 }
    )
  }
}

