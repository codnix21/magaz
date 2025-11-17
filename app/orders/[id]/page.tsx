"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Package, MapPin, Calendar, CreditCard, Truck, RotateCcw } from "lucide-react"

interface OrderItem {
  id: string
  productId: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    image: string
  }
  variant?: {
    name: string
    value: string
  } | null
}

interface Order {
  id: string
  total: number
  status: string
  shippingAddress: string
  shippingCost: number
  paymentMethod: string
  comment?: string | null
  createdAt: string
  updatedAt: string
  orderItems: OrderItem[]
}

const statusLabels: Record<string, string> = {
  PENDING: "Ожидает обработки",
  PROCESSING: "В обработке",
  SHIPPED: "Отправлен",
  DELIVERED: "Доставлен",
  CANCELLED: "Отменен",
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
  PROCESSING: "bg-blue-100 text-blue-800 border-blue-300",
  SHIPPED: "bg-purple-100 text-purple-800 border-purple-300",
  DELIVERED: "bg-green-100 text-green-800 border-green-300",
  CANCELLED: "bg-red-100 text-red-800 border-red-300",
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin")
      return
    }
    fetchOrder()
  }, [session, params.id])

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setOrder(data)
      } else if (res.status === 404) {
        router.push("/orders")
      }
    } catch (error) {
      console.error("Error fetching order:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-modern bg-mesh flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Загрузка заказа...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-modern bg-mesh">
        <div className="container py-12 px-4 sm:px-6">
          <Card className="card-glass border-blue-200/60 p-12 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-2xl font-bold mb-2">Заказ не найден</h2>
            <p className="text-muted-foreground mb-6">
              Заказ с указанным ID не существует или у вас нет доступа к нему
            </p>
            <Link href="/orders">
              <Button className="btn-gradient rounded-xl font-bold px-8 py-6">
                Вернуться к заказам
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  const statusColor = statusColors[order.status] || "bg-gray-100 text-gray-800 border-gray-300"
  const subtotal = order.orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="min-h-screen bg-gradient-modern bg-mesh">
      <div className="container py-8 sm:py-12 px-4 sm:px-6">
        <Link href="/orders" className="inline-block mb-6 animate-fade-in">
          <Button variant="ghost" className="rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 font-semibold">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Назад к заказам
          </Button>
        </Link>

        <div className="mb-8 sm:mb-12 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-3 gradient-text animate-gradient">
            Заказ #{order.id.slice(-8)}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground font-medium">
            Детальная информация о вашем заказе
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Информация о заказе */}
            <Card className="card-glass border-blue-200/60 animate-fade-in">
              <CardHeader className="gradient-bg-primary text-white rounded-t-2xl shadow-xl">
                <CardTitle className="text-xl font-black text-white flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  Информация о заказе
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="text-muted-foreground font-medium">Статус:</span>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${statusColor}`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="text-muted-foreground font-medium">Дата создания:</span>
                  <span className="font-semibold">
                    {new Date(order.createdAt).toLocaleDateString("ru-RU", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {order.comment && (
                  <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                    <p className="text-sm font-semibold text-blue-900 mb-1">Комментарий к заказу:</p>
                    <p className="text-blue-800">{order.comment}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Товары в заказе */}
            <Card className="card-glass border-blue-200/60 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <CardHeader className="gradient-bg-primary text-white rounded-t-2xl shadow-xl">
                <CardTitle className="text-xl font-black text-white">Товары в заказе</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {order.orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <Link href={`/products/${item.product.id}`} className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden group">
                        <Image
                          src={item.product.image || "/placeholder.jpg"}
                          alt={item.product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                          unoptimized={process.env.NODE_ENV === 'development'}
                        />
                      </Link>
                      <div className="flex-1">
                        <Link href={`/products/${item.product.id}`}>
                          <h3 className="font-semibold text-lg hover:text-blue-600 transition-colors mb-1">
                            {item.product.name}
                          </h3>
                        </Link>
                        {item.variant && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {item.variant.name}: {item.variant.value}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Количество: {item.quantity} шт.
                          </span>
                          <span className="font-bold text-lg">
                            {(item.price * item.quantity).toLocaleString("ru-RU")} ₽
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Боковая панель с итогами */}
          <div className="space-y-6">
            <Card className="card-glass border-blue-200/60 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <CardHeader className="gradient-bg-primary text-white rounded-t-2xl shadow-xl">
                <CardTitle className="text-xl font-black text-white">Детали доставки</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Адрес доставки:</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{order.shippingAddress}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <Truck className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Стоимость доставки:</p>
                    <p className="text-lg font-bold">{order.shippingCost.toLocaleString("ru-RU")} ₽</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <CreditCard className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Способ оплаты:</p>
                    <p className="text-sm text-muted-foreground">
                      {order.paymentMethod === 'online' ? 'Онлайн оплата (YooKassa)' : 'Оплата при получении'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-glass border-blue-200/60 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <CardHeader className="gradient-bg-primary text-white rounded-t-2xl shadow-xl">
                <CardTitle className="text-xl font-black text-white">Итого</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex justify-between text-base">
                  <span className="text-muted-foreground">Товары:</span>
                  <span className="font-semibold">{subtotal.toLocaleString("ru-RU")} ₽</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-muted-foreground">Доставка:</span>
                  <span className="font-semibold">{order.shippingCost.toLocaleString("ru-RU")} ₽</span>
                </div>
                <div className="flex justify-between text-2xl font-black pt-4 border-t-2">
                  <span>Итого:</span>
                  <span className="text-blue-600">{order.total.toLocaleString("ru-RU")} ₽</span>
                </div>
              </CardContent>
            </Card>

            {order.status === 'DELIVERED' && (
              <Link href={`/orders/${order.id}/return`}>
                <Button className="w-full btn-gradient rounded-xl font-bold text-lg py-7">
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Вернуть заказ
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

