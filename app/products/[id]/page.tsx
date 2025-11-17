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
    fetchProduct()
  }, [params.id])

  useEffect(() => {
    if (session && product) {
      checkWishlist()
    }
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

  const handleAddToCart = async () => {
    if (!session) {
      router.push("/auth/signin")
      return
    }

    setAdding(true)
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product?.id,
          variantId: selectedVariant?.id || null,
          quantity,
        }),
      })

      if (response.ok) {
        await refreshCart()
        alert("Товар добавлен в корзину!")
      } else {
        alert("Ошибка при добавлении товара в корзину")
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <div className="container py-8">
      <Link href="/products">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад к товарам
        </Button>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Галерея изображений */}
        <div className="space-y-4">
          <div className="relative w-full h-[500px] rounded-lg overflow-hidden shadow-xl border-2 border-blue-100">
            {hasDiscount && (
              <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-lg font-bold shadow-lg">
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
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImageIndex === idx
                      ? 'border-blue-600 shadow-lg scale-105'
                      : 'border-gray-200 hover:border-blue-300'
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

        <Card className="shadow-xl border-2 border-blue-100">
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-3xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {product.name}
              </CardTitle>
              {session && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleWishlist}
                  disabled={wishlistLoading}
                  className={`hover:bg-red-50 ${isInWishlist ? 'text-red-500' : ''}`}
                >
                  <Heart className={`h-6 w-6 ${isInWishlist ? 'fill-red-500' : ''}`} />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-baseline gap-3 mb-2">
                {hasDiscount && product.originalPrice && (
                  <p className="text-xl text-muted-foreground line-through">
                    {product.originalPrice.toLocaleString("ru-RU")} ₽
                  </p>
                )}
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
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
              <div className="space-y-4">
                {Object.entries(variantGroups).map(([groupName, variants]) => (
                  <div key={groupName}>
                    <h3 className="font-semibold mb-2">{groupName}:</h3>
                    <div className="flex flex-wrap gap-2">
                      {variants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => {
                            setSelectedVariant(variant)
                            setQuantity(1)
                          }}
                          disabled={variant.stock === 0}
                          className={`px-4 py-2 rounded-lg border-2 transition-all ${
                            selectedVariant?.id === variant.id
                              ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold shadow-md'
                              : variant.stock === 0
                              ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
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
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="font-semibold">Количество:</label>
                  <Input
                    type="number"
                    min="1"
                    max={availableStock}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, Math.min(availableStock, parseInt(e.target.value) || 1)))
                    }
                    className="w-20"
                  />
                </div>
                <Button
                  onClick={handleAddToCart}
                  disabled={adding || !session}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
                  size="lg"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {adding ? "Добавление..." : "Добавить в корзину"}
                </Button>
                {!session && (
                  <p className="text-sm text-muted-foreground text-center">
                    <Link href="/auth/signin" className="text-blue-600 hover:underline font-semibold">
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


