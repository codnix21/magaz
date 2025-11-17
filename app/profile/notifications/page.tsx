"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Bell, Check, CheckCheck } from "lucide-react"

interface Notification {
  id: string
  type: 'ORDER' | 'SHIPMENT' | 'PAYMENT' | 'RETURN' | 'REVIEW' | 'SYSTEM'
  title: string
  message: string
  link?: string | null
  read: boolean
  createdAt: Date
}

export default function NotificationsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin")
      return
    }
    fetchNotifications()
  }, [session])

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "POST",
      })
      if (response.ok) {
        await fetchNotifications()
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "POST",
      })
      if (response.ok) {
        await fetchNotifications()
      }
    } catch (error) {
      console.error("Error marking all as read:", error)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ORDER':
        return '📦'
      case 'SHIPMENT':
        return '🚚'
      case 'PAYMENT':
        return '💳'
      case 'RETURN':
        return '↩️'
      case 'REVIEW':
        return '⭐'
      default:
        return '🔔'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ORDER':
        return 'bg-blue-100 text-blue-700'
      case 'SHIPMENT':
        return 'bg-green-100 text-green-700'
      case 'PAYMENT':
        return 'bg-purple-100 text-purple-700'
      case 'RETURN':
        return 'bg-orange-100 text-orange-700'
      case 'REVIEW':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-700'
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

  const unreadCount = notifications.filter(n => !n.read).length

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Уведомления
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} непрочитанных` : "Все уведомления прочитаны"}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                variant="outline"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Отметить все как прочитанные
              </Button>
            )}
          </div>
        </div>

        {notifications.length === 0 ? (
          <Card className="p-12 text-center shadow-xl border-2 border-blue-100">
            <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-xl font-semibold mb-2">Нет уведомлений</p>
            <p className="text-muted-foreground">
              Здесь будут отображаться уведомления о ваших заказах и акциях
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`shadow-xl border-2 transition-all hover:shadow-2xl ${
                  notification.read
                    ? "border-gray-200 bg-white"
                    : "border-blue-400 bg-blue-50/50"
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`text-2xl p-3 rounded-lg ${getTypeColor(notification.type)}`}>
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg">{notification.title}</h3>
                        {!notification.read && (
                          <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-2">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleString("ru-RU")}
                      </p>
                      {notification.link && (
                        <Link href={notification.link}>
                          <Button variant="link" className="p-0 h-auto mt-2">
                            Подробнее →
                          </Button>
                        </Link>
                      )}
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => markAsRead(notification.id)}
                        className="h-8 w-8"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
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

