import { NextResponse } from "next/server"
import { checkYooKassaPaymentStatus } from "@/lib/payment"
import { findOrderById, updateOrderStatus } from "@/lib/db-helpers"
import { findUserById } from "@/lib/db-helpers"
import { sendOrderStatusUpdateEmail } from "@/lib/email"

// YooKassa webhook handler
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { event, object } = body

    // Проверяем, что это уведомление о платеже
    if (event === 'payment.succeeded' || event === 'payment.waiting_for_capture') {
      const paymentId = object.id
      const orderId = object.metadata?.orderId

      if (!orderId) {
        console.error('Order ID not found in payment metadata')
        return NextResponse.json({ received: true })
      }

      // Получаем заказ
      const order = await findOrderById(orderId)
      
      if (!order) {
        console.error(`Order ${orderId} not found`)
        return NextResponse.json({ received: true })
      }

      // Обновляем статус заказа
      if (event === 'payment.succeeded') {
        await updateOrderStatus(orderId, 'PROCESSING')
        
        // Отправляем email уведомление
        const user = await findUserById(order.userId)
        if (user) {
          await sendOrderStatusUpdateEmail(
            user.email,
            user.name || user.email,
            order.id,
            'PROCESSING'
          )
        }
      }

      return NextResponse.json({ received: true })
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Error processing payment webhook:", error)
    return NextResponse.json(
      { error: error.message || "Failed to process webhook" },
      { status: 500 }
    )
  }
}

