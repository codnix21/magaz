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

    if (!orderId || refundAmount === undefined) {
      return NextResponse.json(
        { error: "Order ID and refund amount are required" },
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
    if (refundAmount > order.total) {
      return NextResponse.json(
        { error: "Refund amount cannot exceed order total" },
        { status: 400 }
      )
    }

    const orderReturn = await createOrderReturn({
      orderId,
      userId: session.user.id,
      reason,
      refundAmount,
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

