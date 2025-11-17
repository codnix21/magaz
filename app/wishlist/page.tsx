"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingCart, Trash2 } from "lucide-react"
import { useCart } from "@/hooks/use-cart"

interface WishlistItem {
  id: string
  userId: string
  productId: string
  createdAt: string
  product: {
    id: string
    name: string
    description: string
    price: number
    image: string
    category: string
    stock: number
    discountPercent?: number
    originalPrice?: number | null
  }
}

export default function WishlistPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { refreshCart } = useCart()
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin")
      return
    }

    fetchWishlist()
  }, [session, router])

  const fetchWishlist = async () => {
    try {
      const res = await fetch("/api/wishlist")
      if (res.ok) {
        const data = await res.json()
        setWishlist(data)
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error)
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = async (productId: string) => {
    try {
      const res = await fetch(`/api/wishlist?productId=${productId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setWishlist(wishlist.filter(item => item.productId !== productId))
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error)
    }
  }

  const addToCart = async (productId: string) => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      })

      if (res.ok) {
        refreshCart()
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
    }
  }

  const calculatePrice = (product: WishlistItem["product"]) => {
    if (product.discountPercent && product.discountPercent > 0) {
      return Math.round(product.price * (1 - product.discountPercent / 100))
    }
    return product.price
  }

  if (!session) {
    return null
  }

  if (loading) {
    return (
      <div className="container py-12 text-center">
        <p className="text-lg text-muted-foreground">Загрузка избранного...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Избранное
          </h1>
          <p className="text-muted-foreground">
            Ваши любимые товары ({wishlist.length})
          </p>
        </div>

        {wishlist.length === 0 ? (
          <Card className="p-12 text-center">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-2xl font-semibold mb-2">Избранное пусто</h2>
            <p className="text-muted-foreground mb-6">
              Добавьте товары в избранное, чтобы быстро найти их позже
            </p>
            <Link href="/products">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Перейти к товарам
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => {
              const finalPrice = calculatePrice(item.product)
              const hasDiscount = item.product.discountPercent && item.product.discountPercent > 0

              return (
                <Card key={item.id} className="flex flex-col group hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 overflow-hidden">
                  <div className="relative w-full h-64 overflow-hidden">
                    <Link href={`/products/${item.product.id}`}>
                      <Image
                        src={item.product.image || "/placeholder.jpg"}
                        alt={item.product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                        unoptimized={process.env.NODE_ENV === 'development'}
                      />
                    </Link>
                    {hasDiscount && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        -{item.product.discountPercent}%
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-3 right-3 bg-white/90 hover:bg-red-500 hover:text-white"
                      onClick={() => removeFromWishlist(item.product.id)}
                    >
                      <Heart className="h-5 w-5 fill-red-500 text-red-500 group-hover:fill-white group-hover:text-white" />
                    </Button>
                  </div>

                  <CardHeader className="pb-3">
                    <Link href={`/products/${item.product.id}`}>
                      <CardTitle className="text-xl group-hover:text-blue-600 transition-colors line-clamp-2 cursor-pointer">
                        {item.product.name}
                      </CardTitle>
                    </Link>
                    <CardDescription className="line-clamp-2 text-sm">
                      {item.product.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col justify-between pb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {hasDiscount && item.product.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            {item.product.originalPrice.toLocaleString("ru-RU")} ₽
                          </span>
                        )}
                        <p className="text-3xl font-bold text-blue-600">
                          {finalPrice.toLocaleString("ru-RU")} ₽
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        В наличии: {item.product.stock} шт.
                      </p>
                    </div>
                  </CardContent>

                  <CardFooter className="flex gap-2 pt-0">
                    <Button
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      onClick={() => addToCart(item.product.id)}
                      disabled={item.product.stock === 0}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      В корзину
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeFromWishlist(item.product.id)}
                      className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

