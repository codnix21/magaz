import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { findOrderReturns, createOrderReturn, findOrderById } from "@/lib/db-helpers"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const returns = await findOrderReturns(
      session.user.role !== "ADMIN" ? session.user.id : undefined,
      session.user.role === "ADMIN"
    )

    return NextResponse.json(returns)
  } catch (error) {
    console.error("Error fetching returns:", error)
    return NextResponse.json(
      { error: "Failed to fetch returns" },
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
    const { orderId, reason, refundAmount } = body

    // Валидация входных данных
    if (!orderId || typeof orderId !== 'string' || orderId.trim().length === 0) {
      return NextResponse.json(
        { error: "Order ID is required and must be a non-empty string" },
        { status: 400 }
      )
    }

    const refundAmountNum = parseFloat(refundAmount)
    if (isNaN(refundAmountNum) || refundAmountNum < 0) {
      return NextResponse.json(
        { error: "Refund amount must be a valid non-negative number" },
        { status: 400 }
      )
    }

    if (reason && (typeof reason !== 'string' || reason.trim().length > 1000)) {
      return NextResponse.json(
        { error: "Reason must be a string with maximum 1000 characters" },
        { status: 400 }
      )
    }

    // Проверяем, что заказ принадлежит пользователю
    const order = await findOrderById(orderId, session.user.id)
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    // Проверяем, что заказ доставлен (можно возвращать только доставленные заказы)
    if (order.status !== "DELIVERED") {
      return NextResponse.json(
        { error: "Only delivered orders can be returned" },
        { status: 400 }
      )
    }

    // Проверяем, что сумма возврата не превышает сумму заказа
    if (refundAmountNum > order.total) {
      return NextResponse.json(
        { error: "Refund amount cannot exceed order total" },
        { status: 400 }
      )
    }

    const orderReturn = await createOrderReturn({
      orderId: orderId.trim(),
      userId: session.user.id,
      reason: reason ? reason.trim() : null,
      refundAmount: refundAmountNum,
    })

    return NextResponse.json(orderReturn, { status: 201 })
  } catch (error) {
    console.error("Error creating return:", error)
    return NextResponse.json(
      { error: "Failed to create return" },
      { status: 500 }
    )
  }
}

