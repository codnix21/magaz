"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Package, ShoppingBag, Heart, Settings, MapPin, Bell, RotateCcw } from "lucide-react"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-modern bg-mesh">
    <div className="container py-8 sm:py-12 px-4 sm:px-6">
      <div className="mb-8 sm:mb-12 animate-fade-in">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-3 gradient-text animate-gradient">
          Профиль
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">Ваша личная информация</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        <Card className="card-glass border-blue-200/60 animate-fade-in">
          <CardHeader className="gradient-bg-primary text-white rounded-t-2xl shadow-xl">
            <CardTitle className="flex items-center gap-3 text-xl font-black text-white">
              <div className="bg-white/20 backdrop-blur-md p-3 rounded-xl shadow-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              Информация о профиле
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-muted-foreground mb-1">Имя</p>
              <p className="text-xl font-bold text-gray-900">
                {session.user?.name || "Не указано"}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-muted-foreground mb-1">Email</p>
              <p className="text-xl font-bold text-gray-900">{session.user?.email}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <p className="text-sm text-blue-600 mb-1 font-semibold">Роль</p>
              <p className="text-xl font-bold text-blue-700">
                {session.user?.role === "ADMIN" ? "Администратор" : "Пользователь"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass border-blue-200/60 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="gradient-bg-primary text-white rounded-t-2xl shadow-xl">
            <CardTitle className="text-xl font-black text-white">Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            <Link href="/orders" className="block">
              <Button variant="outline" className="w-full justify-start hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors h-12 text-lg">
                <Package className="h-5 w-5 mr-2" />
                Мои заказы
              </Button>
            </Link>
            <Link href="/cart" className="block">
              <Button variant="outline" className="w-full justify-start hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors h-12 text-lg">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Корзина
              </Button>
            </Link>
            <Link href="/wishlist" className="block">
              <Button variant="outline" className="w-full justify-start hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors h-12 text-lg">
                <Heart className="h-5 w-5 mr-2" />
                Избранное
              </Button>
            </Link>
            <Link href="/profile/addresses" className="block">
              <Button variant="outline" className="w-full justify-start hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors h-12 text-lg">
                <MapPin className="h-5 w-5 mr-2" />
                Адресная книга
              </Button>
            </Link>
            <Link href="/profile/notifications" className="block">
              <Button variant="outline" className="w-full justify-start hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors h-12 text-lg">
                <Bell className="h-5 w-5 mr-2" />
                Уведомления
              </Button>
            </Link>
            <Link href="/profile/returns" className="block">
              <Button variant="outline" className="w-full justify-start hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors h-12 text-lg">
                <RotateCcw className="h-5 w-5 mr-2" />
                Возвраты
              </Button>
            </Link>
            {session.user?.role === "ADMIN" && (
              <Link href="/admin" className="block">
                <Button variant="outline" className="w-full justify-start hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors h-12 text-lg border-2">
                  <Settings className="h-5 w-5 mr-2" />
                  Админ-панель
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  )
}


