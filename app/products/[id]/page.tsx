"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShoppingCart, ArrowLeft, Heart } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { ReviewsSection } from "@/components/reviews-section"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  stock: number
  discountPercent?: number
  originalPrice?: number | null
  variants?: ProductVariant[]
  images?: ProductImage[]
  attributes?: ProductAttribute[]
}

interface ProductVariant {
  id: string
  productId: string
  name: string
  value: string
  sku?: string | null
  price?: number | null
  stock: number
  image?: string | null
}

interface ProductImage {
  id: string
  url: string
  alt?: string | null
  isPrimary: boolean
}

interface ProductAttribute {
  id: string
  name: string
  value: string
}

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const { refreshCart } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    if (params.id) {
      fetchProduct()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  useEffect(() => {
    if (session && product) {
      checkWishlist()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, product])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setProduct(data)
      }
    } catch (error) {
      console.error("Error fetching product:", error)
    } finally {
      setLoading(false)
    }
  }

  const checkWishlist = async () => {
    if (!session || !product) return
    try {
      const res = await fetch("/api/wishlist")
      if (res.ok) {
        const wishlist = await res.json()
        setIsInWishlist(wishlist.some((item: any) => item.productId === params.id))
      }
    } catch (error) {
      console.error("Error checking wishlist:", error)
    }
  }

  const handleToggleWishlist = async () => {
    if (!session) {
      router.push("/auth/signin")
      return
    }

    setWishlistLoading(true)
    try {
      if (isInWishlist) {
        await fetch(`/api/wishlist?productId=${params.id}`, {
          method: "DELETE",
        })
        setIsInWishlist(false)
      } else {
        await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: params.id }),
        })
        setIsInWishlist(true)
      }
    } catch (error) {
      console.error("Error updating wishlist:", error)
    } finally {
      setWishlistLoading(false)
    }
  }

  const handleAddToCart = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    if (!session) {
      router.push("/auth/signin")
      return
    }

    if (!product?.id) {
      alert("Ошибка: товар не найден")
      return
    }

    setAdding(true)
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          variantId: selectedVariant?.id || null,
          quantity,
        }),
      })

      if (response.ok) {
        await refreshCart()
        alert("Товар добавлен в корзину!")
      } else {
        const errorData = await response.json().catch(() => ({}))
        alert(errorData.error || "Ошибка при добавлении товара в корзину")
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      alert("Ошибка при добавлении товара в корзину")
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center">Загрузка...</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container py-8">
        <div className="text-center">Товар не найден</div>
      </div>
    )
  }

  // Вычисляем цену с учетом варианта
  const basePrice = selectedVariant?.price || product.price
  const finalPrice = product.discountPercent && product.discountPercent > 0
    ? Math.round(basePrice * (1 - product.discountPercent / 100))
    : basePrice
  const hasDiscount = product.discountPercent && product.discountPercent > 0
  
  // Доступное количество с учетом варианта
  const availableStock = selectedVariant ? selectedVariant.stock : product.stock
  
  // Группируем варианты по имени (например, "Размер", "Цвет")
  const variantGroups = product.variants?.reduce((acc, variant) => {
    if (!acc[variant.name]) {
      acc[variant.name] = []
    }
    acc[variant.name].push(variant)
    return acc
  }, {} as Record<string, ProductVariant[]>) || {}

  return (
    <div className="min-h-screen bg-gradient-modern bg-mesh">
    <div className="container py-8 sm:py-12 px-4 sm:px-6">
      <Link href="/products" className="inline-block mb-6 animate-fade-in">
        <Button variant="ghost" className="rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-300 font-semibold">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Назад к товарам
        </Button>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
        {/* Галерея изображений */}
        <div className="space-y-3 sm:space-y-4 animate-fade-in">
          <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-200/60 card-glass">
            {hasDiscount && (
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-sm sm:text-lg font-bold shadow-lg">
                -{product.discountPercent}%
              </div>
            )}
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[selectedImageIndex]?.url || product.image || "/placeholder.jpg"}
                alt={product.images[selectedImageIndex]?.alt || product.name}
                fill
                className="object-cover"
                unoptimized={process.env.NODE_ENV === 'development'}
              />
            ) : (
              <Image
                src={product.image || "/placeholder.jpg"}
                alt={product.name}
                fill
                className="object-cover"
                unoptimized={process.env.NODE_ENV === 'development'}
              />
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImageIndex(idx)}
                    className={`relative h-16 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImageIndex === idx
                      ? 'border-emerald-600 shadow-lg scale-105'
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.alt || product.name}
                    fill
                    className="object-cover"
                    unoptimized={process.env.NODE_ENV === 'development'}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <Card className="card-glass border-emerald-200/60 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="gradient-bg-primary text-white rounded-t-lg sm:rounded-t-xl md:rounded-t-2xl shadow-xl p-4 sm:p-5 md:p-6">
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <CardTitle className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black text-white leading-tight pr-2">
                {product.name}
              </CardTitle>
              {session && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleWishlist}
                  disabled={wishlistLoading}
                  className={`hover:bg-red-50/20 h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 flex-shrink-0 ${isInWishlist ? 'text-red-200' : 'text-white'}`}
                >
                  <Heart className={`h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 ${isInWishlist ? 'fill-red-200' : ''}`} />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            <div>
              <div className="flex items-baseline gap-2 sm:gap-3 mb-2 flex-wrap">
                {hasDiscount && product.originalPrice && (
                  <p className="text-base sm:text-lg md:text-xl text-muted-foreground line-through">
                    {product.originalPrice.toLocaleString("ru-RU")} ₽
                  </p>
                )}
                <p className="text-3xl sm:text-4xl md:text-5xl font-black gradient-text animate-gradient">
                  {finalPrice.toLocaleString("ru-RU")} ₽
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                {availableStock > 0 ? (
                  <span className="text-green-600 font-semibold">В наличии: {availableStock} шт.</span>
                ) : (
                  <span className="text-red-600 font-semibold">Нет в наличии</span>
                )}
              </p>
            </div>

            {/* Варианты товара */}
            {Object.keys(variantGroups).length > 0 && (
              <div className="space-y-3 sm:space-y-4">
                {Object.entries(variantGroups).map(([groupName, variants]) => (
                  <div key={groupName}>
                    <h3 className="font-semibold mb-2 text-sm sm:text-base">{groupName}:</h3>
                    <div className="flex flex-wrap gap-2">
                      {variants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => {
                            setSelectedVariant(variant)
                            setQuantity(1)
                          }}
                          disabled={variant.stock === 0}
                          className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg border-2 transition-all text-sm sm:text-base min-h-[40px] sm:min-h-[44px] ${
                            selectedVariant?.id === variant.id
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-semibold shadow-md'
                              : variant.stock === 0
                              ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                              : 'border-gray-300 hover:border-emerald-400 hover:bg-emerald-50'
                          }`}
                        >
                          {variant.value}
                          {variant.stock === 0 && ' (нет)'}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-2">Описание</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {/* Атрибуты товара */}
            {product.attributes && product.attributes.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Характеристики</h3>
                <div className="space-y-2">
                  {product.attributes.map((attr) => (
                    <div key={attr.id} className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-muted-foreground">{attr.name}:</span>
                      <span className="font-medium">{attr.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-2">Категория</h3>
              <p className="text-muted-foreground">{product.category}</p>
            </div>

            {availableStock > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                  <label className="font-semibold text-sm sm:text-base">Количество:</label>
                  <Input
                    type="number"
                    min="1"
                    max={availableStock}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, Math.min(availableStock, parseInt(e.target.value) || 1)))
                    }
                    className="w-20 sm:w-24 h-10 sm:h-11 text-base"
                  />
                </div>
                <Button
                  onClick={handleAddToCart}
                  disabled={adding || !session}
                  className="w-full btn-gradient font-bold rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg py-4 sm:py-5 md:py-6 min-h-[48px] sm:min-h-[52px] md:min-h-[56px]"
                  size="lg"
                >
                  <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span className="hidden sm:inline">{adding ? "Добавление..." : "Добавить в корзину"}</span>
                  <span className="sm:hidden">{adding ? "..." : "В корзину"}</span>
                </Button>
                {!session && (
                  <p className="text-sm text-muted-foreground text-center">
                    <Link href="/auth/signin" className="text-emerald-600 hover:underline font-semibold">
                      Войдите
                    </Link>
                    , чтобы добавить товар в корзину
                  </p>
                )}
              </div>
            ) : (
              <Button disabled className="w-full" size="lg">
                Нет в наличии
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {product && <ReviewsSection productId={product.id} />}
    </div>
    </div>
  )
}


