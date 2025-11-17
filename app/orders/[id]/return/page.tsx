"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, RotateCcw } from "lucide-react"

interface Order {
  id: string
  total: number
  status: string
  orderItems: Array<{
    product: {
      name: string
    }
    quantity: number
    price: number
  }>
}

export default function ReturnOrderPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [refundAmount, setRefundAmount] = useState("")
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin")
      return
    }
    fetchOrder()
  }, [session, orderId])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data)
        setRefundAmount(data.total.toString())
      } else {
        setError("Заказ не найден")
      }
    } catch (error) {
      console.error("Error fetching order:", error)
      setError("Ошибка при загрузке заказа")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    try {
      const amount = parseFloat(refundAmount)
      if (isNaN(amount) || amount <= 0) {
        setError("Введите корректную сумму возврата")
        setSubmitting(false)
        return
      }

      if (amount > (order?.total || 0)) {
        setError("Сумма возврата не может превышать сумму заказа")
        setSubmitting(false)
        return
      }

      const response = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          reason,
          refundAmount: amount,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push("/profile/returns")
      } else {
        setError(data.error || "Ошибка при создании возврата")
      }
    } catch (error) {
      console.error("Error creating return:", error)
      setError("Ошибка при создании возврата")
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

  if (error && !order) {
    return (
      <div className="container py-8">
        <Card className="p-12 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/orders">
            <Button>Вернуться к заказам</Button>
          </Link>
        </Card>
      </div>
    )
  }

  if (!order) {
    return null
  }

  if (order.status !== "DELIVERED") {
    return (
      <div className="container py-8">
        <Card className="p-12 text-center">
          <p className="text-red-600 mb-4">
            Возврат возможен только для доставленных заказов
          </p>
          <Link href="/orders">
            <Button>Вернуться к заказам</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container py-6 sm:py-8 px-4 sm:px-6">
        <div className="mb-6 sm:mb-8">
          <Link href="/orders">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад к заказам
            </Button>
          </Link>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Возврат заказа
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Заказ #{order.id.slice(-8)}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-2xl border-2 border-blue-200/50 bg-white/90 backdrop-blur-md">
            <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b-2 border-blue-200/50">
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-blue-600" />
                Информация о заказе
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold mb-2">Товары:</p>
                  {order.orderItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-2">
                      <span className="text-sm">
                        {item.product.name} × {item.quantity}
                      </span>
                      <span className="font-semibold text-blue-600">
                        {(item.price * item.quantity).toLocaleString("ru-RU")} ₽
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Сумма заказа:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {order.total.toLocaleString("ru-RU")} ₽
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-2xl border-2 border-blue-200/50 bg-white/90 backdrop-blur-md">
            <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b-2 border-blue-200/50">
              <CardTitle>Запрос на возврат</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="refundAmount">Сумма возврата (₽)</Label>
                  <Input
                    id="refundAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    max={order.total}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Максимальная сумма: {order.total.toLocaleString("ru-RU")} ₽
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Причина возврата</Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    placeholder="Опишите причину возврата..."
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
                  disabled={submitting}
                >
                  {submitting ? "Отправка..." : "Подать запрос на возврат"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

