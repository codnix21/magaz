"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, RotateCcw } from "lucide-react"
import Image from "next/image"

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    image: string
  }
}

interface Order {
  id: string
  total: number
  status: string
  shippingAddress: string
  createdAt: string
  orderItems: OrderItem[]
}

export default function OrdersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin")
      return
    }
    fetchOrders()
  }, [session])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders")
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: "Ожидает обработки",
      PROCESSING: "В обработке",
      SHIPPED: "Отправлен",
      DELIVERED: "Доставлен",
      CANCELLED: "Отменён",
    }
    return labels[status] || status
  }

  if (!session) {
    return null
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center">Загрузка заказов...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-modern bg-mesh">
    <div className="container py-6 sm:py-8 px-4 sm:px-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Мои заказы
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          История всех ваших заказов
        </p>
      </div>

      {orders.length === 0 ? (
        <Card className="p-12 text-center card-glass border-blue-200/60 animate-fade-in">
          <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-xl font-bold mb-2">У вас пока нет заказов</p>
          <p className="text-muted-foreground mb-6">
            Начните делать покупки, чтобы увидеть свои заказы здесь
          </p>
          <Link href="/products">
            <Button className="btn-gradient rounded-xl font-bold px-8 py-6">
              Перейти к товарам
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const statusColors: Record<string, string> = {
              PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
              PROCESSING: "bg-blue-100 text-blue-800 border-blue-300",
              SHIPPED: "bg-purple-100 text-purple-800 border-purple-300",
              DELIVERED: "bg-green-100 text-green-800 border-green-300",
              CANCELLED: "bg-red-100 text-red-800 border-red-300",
            }
            const statusColor = statusColors[order.status] || "bg-gray-100 text-gray-800 border-gray-300"
            
            return (
              <Card key={order.id} className="card-modern hover:border-blue-300/80 overflow-hidden animate-fade-in">
                <div className="gradient-bg-primary text-white border-b-2 border-white/20">
                  <CardHeader>
                    <div className="flex justify-between items-start flex-wrap gap-4">
                      <div>
                        <Link href={`/orders/${order.id}`}>
                          <CardTitle className="text-2xl mb-2 font-black text-white hover:text-blue-200 transition-colors cursor-pointer">
                            Заказ #{order.id.slice(-8)}
                          </CardTitle>
                        </Link>
                        <p className="text-sm text-white/90">
                          {new Date(order.createdAt).toLocaleDateString("ru-RU", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-black text-white mb-2">
                          {order.total.toLocaleString("ru-RU")} ₽
                        </p>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${statusColor}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                </div>
                <CardContent className="pt-6">
                  <div className="space-y-3 mb-6">
                    <p className="font-semibold text-lg mb-3">Товары в заказе:</p>
                    {order.orderItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {item.product.image && (
                            <div className="relative w-12 h-12 rounded overflow-hidden">
                              <Image
                                src={item.product.image}
                                alt={item.product.name}
                                fill
                                className="object-cover"
                                unoptimized={process.env.NODE_ENV === 'development'}
                              />
                            </div>
                          )}
                          <div>
                            <span className="font-medium">{item.product.name}</span>
                            <span className="text-sm text-muted-foreground ml-2">× {item.quantity}</span>
                          </div>
                        </div>
                        <span className="font-semibold text-blue-600">
                          {(item.price * item.quantity).toLocaleString("ru-RU")} ₽
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t bg-blue-50 rounded-lg p-4">
                    <p className="text-sm">
                      <span className="font-semibold">Адрес доставки:</span>{" "}
                      <span className="text-muted-foreground">{order.shippingAddress}</span>
                    </p>
                  </div>
                  {order.status === "DELIVERED" && (
                    <div className="pt-4 border-t">
                      <Link href={`/orders/${order.id}/return`}>
                        <Button variant="outline" className="w-full hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600">
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Вернуть заказ
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
    </div>
  )
}


