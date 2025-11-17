"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RotateCcw, AlertCircle } from "lucide-react"

interface OrderReturn {
  id: string
  orderId: string
  reason?: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSING' | 'COMPLETED'
  refundAmount: number
  refundStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  adminComment?: string | null
  createdAt: Date
  updatedAt: Date
  order: {
    id: string
    total: number
    status: string
  }
}

export default function ReturnsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [returns, setReturns] = useState<OrderReturn[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin")
      return
    }
    fetchReturns()
  }, [session])

  const fetchReturns = async () => {
    try {
      const response = await fetch("/api/returns")
      if (response.ok) {
        const data = await response.json()
        setReturns(data)
      }
    } catch (error) {
      console.error("Error fetching returns:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'PROCESSING':
        return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getRefundStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-600'
      case 'PROCESSING':
        return 'text-blue-600'
      case 'COMPLETED':
        return 'text-green-600'
      case 'FAILED':
        return 'text-red-600'
      default:
        return 'text-gray-600'
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
          <Link href="/profile">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад к профилю
            </Button>
          </Link>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Возвраты
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">История возвратов заказов</p>
        </div>

        {returns.length === 0 ? (
          <Card className="p-12 text-center shadow-xl border-2 border-blue-100">
            <RotateCcw className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-xl font-semibold mb-2">Нет возвратов</p>
            <p className="text-muted-foreground mb-6">
              Здесь будут отображаться ваши запросы на возврат
            </p>
            <Link href="/orders">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
                Перейти к заказам
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {returns.map((return_) => (
              <Card
                key={return_.id}
                className="shadow-xl border-2 transition-all hover:shadow-2xl border-blue-100 hover:border-blue-300"
              >
                <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b-2 border-blue-200/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <RotateCcw className="h-5 w-5 text-blue-600" />
                        Возврат #{return_.id.slice(-8)}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Заказ #{return_.order.id.slice(-8)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600 mb-2">
                        {return_.refundAmount.toLocaleString("ru-RU")} ₽
                      </p>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${getStatusColor(return_.status)}`}>
                        {return_.status === 'PENDING' && 'Ожидает рассмотрения'}
                        {return_.status === 'APPROVED' && 'Одобрен'}
                        {return_.status === 'PROCESSING' && 'Обрабатывается'}
                        {return_.status === 'COMPLETED' && 'Завершён'}
                        {return_.status === 'REJECTED' && 'Отклонён'}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {return_.reason && (
                    <div>
                      <p className="text-sm font-semibold mb-1">Причина возврата:</p>
                      <p className="text-muted-foreground">{return_.reason}</p>
                    </div>
                  )}
                  {return_.adminComment && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-semibold mb-1 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        Комментарий администратора:
                      </p>
                      <p className="text-sm text-muted-foreground">{return_.adminComment}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Статус возврата средств: <span className={`font-semibold ${getRefundStatusColor(return_.refundStatus)}`}>
                          {return_.refundStatus === 'PENDING' && 'Ожидает'}
                          {return_.refundStatus === 'PROCESSING' && 'Обрабатывается'}
                          {return_.refundStatus === 'COMPLETED' && 'Завершён'}
                          {return_.refundStatus === 'FAILED' && 'Ошибка'}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Создан: {new Date(return_.createdAt).toLocaleString("ru-RU")}
                      </p>
                    </div>
                    <Link href={`/orders`}>
                      <Button variant="outline" size="sm">
                        К заказу
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

