import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { 
  findOrders, 
  createOrder, 
  findPromoCodeByCode, 
  calculateDiscount, 
  findOrderById, 
  findUserById,
  reserveProducts,
  confirmReservations
} from "@/lib/db-helpers"
import { sendOrderConfirmationEmail } from "@/lib/email"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const orders = await findOrders(
      session.user.role !== "ADMIN" ? session.user.id : undefined,
      session.user.role === "ADMIN"
    )

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { error: "Failed to fetch orders" },
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
    const { 
      shippingAddress, 
      addressId,
      shippingMethodId,
      shippingCost = 0,
      comment,
      cartItems, 
      promoCode,
      paymentMethod = 'cash'
    } = body

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      )
    }

    // Вычисляем субтотал (сумма до скидки)
    const subtotal = cartItems.reduce(
      (sum: number, item: any) => {
        const itemPrice = item.variant?.price || item.product.price
        const discount = item.product.discountPercent || 0
        const finalPrice = discount > 0 
          ? Math.round(itemPrice * (1 - discount / 100))
          : itemPrice
        return sum + finalPrice * item.quantity
      },
      0
    )

    // Проверяем и применяем промокод
    let discountAmount = 0
    let promoCodeId = null
    let total = subtotal + shippingCost

    if (promoCode) {
      const promo = await findPromoCodeByCode(promoCode.toUpperCase())
      if (promo) {
        discountAmount = await calculateDiscount(promo, subtotal)
        total = subtotal - discountAmount + shippingCost
        promoCodeId = promo.id
      } else {
        return NextResponse.json(
          { error: "Invalid or expired promo code" },
          { status: 400 }
        )
      }
    }

    // Создаем заказ
    const order = await createOrder({
      userId: session.user.id,
      total,
      shippingAddress,
      addressId: addressId || null,
      shippingMethodId: shippingMethodId || null,
      shippingCost,
      comment: comment || null,
      paymentMethod,
      promoCodeId,
      discountAmount,
      subtotal,
      cartItems: cartItems.map((item: any) => ({
        productId: item.productId,
        variantId: item.variantId || null,
        quantity: item.quantity,
        price: item.variant?.price || item.product.price,
      })),
    })

    // Резервируем товары
    try {
      await reserveProducts(
        order.id,
        cartItems.map((item: any) => ({
          productId: item.productId,
          variantId: item.variantId || null,
          quantity: item.quantity,
        }))
      )
      
      // Если оплата онлайн, резервируем товары сразу
      // Если наличными, резервируем до подтверждения оплаты
      if (paymentMethod === 'online') {
        // Резервирование будет подтверждено после успешной оплаты через webhook
      }
    } catch (reserveError) {
      console.error('Error reserving products:', reserveError)
      // Не прерываем процесс, но логируем ошибку
    }

    // Отправляем email уведомление о создании заказа
    try {
      const user = await findUserById(session.user.id)
      if (user) {
        const orderWithItems = await findOrderById(order.id)
        
        await sendOrderConfirmationEmail({
          orderId: order.id,
          userName: user.name || user.email,
          userEmail: user.email,
          total: order.total,
          discountAmount: order.discountAmount || 0,
          subtotal: order.subtotal || order.total,
          shippingAddress: order.shippingAddress,
          items: orderWithItems?.items?.map((item: any) => ({
            name: item.product?.name || 'Товар',
            quantity: item.quantity,
            price: item.price,
          })) || [],
        })
      }
    } catch (emailError) {
      console.error('Error sending order confirmation email:', emailError)
      // Не прерываем процесс, если email не отправился
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    )
  }
}


