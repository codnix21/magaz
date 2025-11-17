import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createYooKassaPayment } from "@/lib/payment"
import { findOrderById } from "@/lib/db-helpers"

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
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      )
    }

    // Получаем заказ
    const order = await findOrderById(orderId, session.user.id)

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    // Проверяем, что заказ принадлежит пользователю
    if (order.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    // Проверяем, что заказ еще не оплачен
    if (order.status !== 'PENDING') {
      return NextResponse.json(
        { error: "Order is already processed" },
        { status: 400 }
      )
    }

    // Создаем платеж в YooKassa
    const payment = await createYooKassaPayment({
      amount: order.total,
      orderId: order.id,
      userId: session.user.id,
      description: `Заказ #${order.id}`,
    })

    if (!payment) {
      return NextResponse.json(
        { error: "Payment service is not configured" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      paymentId: payment.paymentId,
      confirmationUrl: payment.confirmationUrl,
    })
  } catch (error: any) {
    console.error("Error creating payment:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create payment" },
      { status: 500 }
    )
  }
}

