"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, Gift, X } from "lucide-react"

interface CartItem {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    image: string
  }
}

export default function CheckoutPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [shippingAddress, setShippingAddress] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const [appliedPromo, setAppliedPromo] = useState<any>(null)
  const [promoLoading, setPromoLoading] = useState(false)
  const [subtotal, setSubtotal] = useState(0)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [total, setTotal] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash'>('online')
  const [processingPayment, setProcessingPayment] = useState(false)

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin")
      return
    }
    fetchCart()
  }, [session])

  const fetchCart = async () => {
    try {
      const response = await fetch("/api/cart")
      if (response.ok) {
        const data = await response.json()
        setCartItems(data.items || [])
        if (data.items.length === 0) {
          router.push("/cart")
        } else {
          updateTotals(data.items, appliedPromo)
        }
      }
    } catch (error) {
      console.error("Error fetching cart:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateTotals = (items: CartItem[], promo: any = null) => {
    const newSubtotal = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    )
    setSubtotal(newSubtotal)

    if (promo) {
      setDiscountAmount(promo.discountAmount)
      setTotal(promo.total)
    } else {
      setDiscountAmount(0)
      setTotal(newSubtotal)
    }
  }

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) return

    setPromoLoading(true)
    try {
      const response = await fetch("/api/promo-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: promoCode.toUpperCase(),
          subtotal,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setAppliedPromo(data.promoCode)
        setDiscountAmount(data.discountAmount)
        setTotal(data.total)
      } else {
        const error = await response.json()
        alert(error.error || "Неверный промокод")
      }
    } catch (error) {
      console.error("Error applying promo code:", error)
      alert("Ошибка при применении промокода")
    } finally {
      setPromoLoading(false)
    }
  }

  const handleRemovePromoCode = () => {
    setAppliedPromo(null)
    setPromoCode("")
    updateTotals(cartItems, null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shippingAddress.trim()) {
      alert("Пожалуйста, укажите адрес доставки")
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress,
          cartItems: cartItems.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            product: item.product,
          })),
          promoCode: appliedPromo ? appliedPromo.code : null,
        }),
      })

      if (response.ok) {
        const order = await response.json()

        // Если выбрана онлайн оплата, создаем платеж
        if (paymentMethod === 'online') {
          setProcessingPayment(true)
          try {
            const paymentResponse = await fetch("/api/payments/create", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: order.id }),
            })

            if (paymentResponse.ok) {
              const payment = await paymentResponse.json()
              // Перенаправляем на страницу оплаты YooKassa
              window.location.href = payment.confirmationUrl
              return
            } else {
              const error = await paymentResponse.json()
              alert(error.error || "Ошибка при создании платежа. Заказ создан, вы сможете оплатить его позже.")
            }
          } catch (paymentError) {
            console.error("Error creating payment:", paymentError)
            alert("Ошибка при создании платежа. Заказ создан, вы сможете оплатить его позже.")
          } finally {
            setProcessingPayment(false)
          }
        }

        // Если оплата наличными или произошла ошибка с онлайн оплатой
        router.push(`/orders?order=${order.id}&status=created`)
      } else {
        const error = await response.json()
        alert(error.error || "Ошибка при оформлении заказа")
      }
    } catch (error) {
      console.error("Error creating order:", error)
      alert("Ошибка при оформлении заказа")
    } finally {
      setSubmitting(false)
    }
  }

  if (!session) {
    return null
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center">Загрузка...</div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <div className="container py-6 sm:py-8 px-4 sm:px-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Оформление заказа
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">Завершите оформление вашего заказа</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <Card className="shadow-xl border-2 border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-100">
              <CardTitle className="text-xl">Адрес доставки</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Адрес доставки</Label>
                <Textarea
                  id="address"
                  placeholder="Укажите полный адрес доставки"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  required
                  rows={4}
                />
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="promo">Промокод</Label>
                {appliedPromo ? (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <Gift className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <p className="font-semibold text-green-800">{appliedPromo.code}</p>
                      {appliedPromo.description && (
                        <p className="text-sm text-green-600">{appliedPromo.description}</p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleRemovePromoCode}
                      className="h-8 w-8 text-green-600 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      id="promo"
                      placeholder="Введите промокод"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleApplyPromoCode()
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={handleApplyPromoCode}
                      disabled={promoLoading || !promoCode.trim()}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      <Gift className="h-4 w-4 mr-2" />
                      Применить
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="payment">Способ оплаты</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="online"
                      name="payment"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'online' | 'cash')}
                      className="h-4 w-4 text-blue-600"
                    />
                    <Label htmlFor="online" className="font-normal cursor-pointer">
                      Онлайн оплата (YooKassa)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="cash"
                      name="payment"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'online' | 'cash')}
                      className="h-4 w-4 text-blue-600"
                    />
                    <Label htmlFor="cash" className="font-normal cursor-pointer">
                      Оплата при получении
                    </Label>
                  </div>
                </div>
                {paymentMethod === 'online' && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Вы будете перенаправлены на безопасную страницу оплаты YooKassa
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-2 border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-100">
              <CardTitle className="text-xl">Ваш заказ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center py-2 border-b"
                  >
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} × {item.product.price.toLocaleString("ru-RU")} ₽
                      </p>
                    </div>
                    <p className="font-semibold">
                      {(item.product.price * item.quantity).toLocaleString("ru-RU")} ₽
                    </p>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Подытог:</span>
                  <span>{subtotal.toLocaleString("ru-RU")} ₽</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Скидка:</span>
                    <span>-{discountAmount.toLocaleString("ru-RU")} ₽</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold pt-2 border-t">
                  <span>Итого:</span>
                  <span>{total.toLocaleString("ru-RU")} ₽</span>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                size="lg"
                disabled={submitting || processingPayment}
              >
                {processingPayment ? "Создание платежа..." : submitting ? "Оформление..." : paymentMethod === 'online' ? "Оплатить заказ" : "Подтвердить заказ"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
    </div>
  )
}


