"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react"
import { useCart } from "@/hooks/use-cart"

interface CartItem {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    image: string
    stock: number
  }
}

export default function CartPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { refreshCart } = useCart()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

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
      }
    } catch (error) {
      console.error("Error fetching cart:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemId)
      return
    }

    setUpdating(itemId)
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      })

      if (response.ok) {
        await fetchCart()
        await refreshCart()
      }
    } catch (error) {
      console.error("Error updating cart:", error)
    } finally {
      setUpdating(null)
    }
  }

  const removeItem = async (itemId: string) => {
    setUpdating(itemId)
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchCart()
        await refreshCart()
      }
    } catch (error) {
      console.error("Error removing item:", error)
    } finally {
      setUpdating(null)
    }
  }

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  if (!session) {
    return null
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center">Загрузка корзины...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <div className="container py-6 sm:py-8 px-4 sm:px-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Корзина
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {cartItems.length > 0 ? `${cartItems.reduce((sum, item) => sum + item.quantity, 0)} товаров в корзине` : "Ваша корзина пуста"}
        </p>
      </div>

      {cartItems.length === 0 ? (
        <Card className="p-12 text-center shadow-xl border-2 border-blue-100">
          <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-xl font-semibold mb-2">Ваша корзина пуста</p>
          <p className="text-muted-foreground mb-6">
            Добавьте товары из каталога, чтобы продолжить покупки
          </p>
          <Link href="/products">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              Перейти к товарам
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow border-2 border-blue-50">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    <Link href={`/products/${item.product.id}`} className="relative w-full sm:w-32 h-48 sm:h-32 flex-shrink-0 rounded-lg overflow-hidden group">
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
                        <h3 className="font-semibold text-xl mb-2 hover:text-blue-600 transition-colors">
                          {item.product.name}
                        </h3>
                      </Link>
                      <p className="text-2xl font-bold text-blue-600 mb-4">
                        {item.product.price.toLocaleString("ru-RU")} ₽
                      </p>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                        <div className="flex items-center gap-3 border-2 rounded-lg w-full sm:w-auto">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={updating === item.id}
                            className="h-10 w-10 hover:bg-blue-50"
                          >
                            -
                          </Button>
                          <span className="w-12 text-center font-semibold text-base sm:text-lg">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={updating === item.id || item.quantity >= item.product.stock}
                            className="h-10 w-10 hover:bg-blue-50"
                          >
                            +
                          </Button>
                        </div>
                        <div className="text-base sm:text-lg font-semibold text-muted-foreground">
                          Итого: {(item.product.price * item.quantity).toLocaleString("ru-RU")} ₽
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          disabled={updating === item.id}
                          className="sm:ml-auto text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="h-fit sticky top-24 shadow-xl border-2 border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="text-white">Итого</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex justify-between text-lg">
                <span className="text-muted-foreground">Товаров:</span>
                <span className="font-semibold">{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
              <div className="flex justify-between text-2xl font-bold pt-4 border-t">
                <span>Сумма:</span>
                <span className="text-blue-600">{total.toLocaleString("ru-RU")} ₽</span>
              </div>
              <Link href="/checkout" className="block pt-2">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg" size="lg">
                  Оформить заказ
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
    </div>
  )
}


