"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

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
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [allCategories, setAllCategories] = useState<string[]>([])
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [loading, setLoading] = useState(true)

  // Загружаем все категории один раз при монтировании
  useEffect(() => {
    fetchAllCategories()
  }, [])

  // Загружаем товары при изменении категории
  useEffect(() => {
    fetchProducts()
  }, [category])

  // Фильтруем товары по поиску
  useEffect(() => {
    if (!Array.isArray(products)) {
      setFilteredProducts([])
      return
    }
    
    if (!search || search.trim() === "") {
      setFilteredProducts(products)
      return
    }

    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase())
    )

    setFilteredProducts(filtered)
  }, [search, products])

  const fetchAllCategories = async () => {
    try {
      const response = await fetch("/api/products", {
        next: { revalidate: 60 } // Кешируем на 60 секунд
      })
      const data = await response.json()
      
      if (Array.isArray(data)) {
        const uniqueCategories = Array.from(new Set(data.map((p: Product) => p.category)))
        setAllCategories(uniqueCategories)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const url = category
        ? `/api/products?category=${encodeURIComponent(category)}`
        : "/api/products"
      const response = await fetch(url, {
        next: { revalidate: 60 } // Кешируем на 60 секунд
      })
      const data = await response.json()
      
      // Убеждаемся, что data - это массив
      if (Array.isArray(data)) {
        setProducts(data)
        // filteredProducts обновится автоматически через useEffect
      } else {
        console.error("Expected array but got:", data)
        setProducts([])
        setFilteredProducts([])
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      setProducts([])
      setFilteredProducts([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-modern bg-mesh">
    <div className="container py-8 sm:py-12 px-4 sm:px-6">
      <div className="mb-8 sm:mb-12 animate-fade-in">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-3 gradient-text animate-gradient">
          Каталог товаров
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground font-medium">Найдите то, что ищете</p>
      </div>

      <div className="mb-8 sm:mb-10 space-y-5 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <Card className="p-4 sm:p-5 card-glass border-emerald-200/60">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-600 h-5 w-5 sm:h-6 sm:w-6 z-10" />
              <Input
                placeholder="Поиск товаров..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 sm:pl-14 h-12 sm:h-14 border-2 border-emerald-200/60 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-base sm:text-lg rounded-xl transition-all duration-300"
              />
            </div>
          </div>
        </Card>
        <div className="flex gap-2 sm:gap-3 flex-wrap">
          <Button
            variant={category === "" ? "default" : "outline"}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setCategory("")
            }}
            className={category === "" ? "btn-gradient rounded-lg sm:rounded-xl px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 h-auto font-bold shadow-xl text-sm sm:text-base whitespace-nowrap min-h-[40px] sm:min-h-[44px]" : "rounded-lg sm:rounded-xl px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 h-auto border-2 hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-300 font-semibold text-sm sm:text-base whitespace-nowrap min-h-[40px] sm:min-h-[44px]"}
          >
            Все категории
          </Button>
          {allCategories.map((cat) => (
            <Button
              key={cat}
              variant={category === cat ? "default" : "outline"}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setCategory(cat)
              }}
              className={category === cat ? "btn-gradient rounded-lg sm:rounded-xl px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 h-auto font-bold shadow-xl text-sm sm:text-base whitespace-nowrap min-h-[40px] sm:min-h-[44px]" : "rounded-lg sm:rounded-xl px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 h-auto border-2 hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-300 font-semibold text-sm sm:text-base whitespace-nowrap min-h-[40px] sm:min-h-[44px]"}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <Card className="p-12 text-center">
          <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-xl font-semibold mb-2">Товары не найдены</p>
          <p className="text-muted-foreground mb-6">
            Попробуйте изменить критерии поиска или категорию
          </p>
          <Button 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setSearch("")
              setCategory("")
            }}
            className="btn-gradient rounded-xl font-semibold"
          >
            Сбросить фильтры
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredProducts.map((product, index) => {
            const hasDiscount = product.discountPercent && product.discountPercent > 0
            const finalPrice = hasDiscount
              ? Math.round(product.price * (1 - (product.discountPercent || 0) / 100))
              : product.price

            return (
                <Card 
                  key={product.id} 
                  className="flex flex-col group card-modern hover:border-emerald-300/80 overflow-hidden animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                <div className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden">
                  <Link href={`/products/${product.id}`}>
                    <Image
                      src={product.image || "/placeholder.jpg"}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                      unoptimized={process.env.NODE_ENV === 'development'}
                    />
                  </Link>
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-1.5 sm:gap-2 z-10">
                    {hasDiscount && (
                      <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold shadow-xl shadow-red-500/50 animate-pulse">
                        -{product.discountPercent}%
                      </span>
                    )}
                    {product.stock > 0 ? (
                      <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold shadow-lg shadow-green-500/30">
                        В наличии
                      </span>
                    ) : (
                      <span className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold shadow-lg shadow-red-500/30">
                        Нет в наличии
                      </span>
                    )}
                  </div>
                </div>
                <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                  <Link href={`/products/${product.id}`}>
                    <CardTitle className="text-lg sm:text-xl group-hover:text-emerald-600 transition-colors line-clamp-2 cursor-pointer">
                      {product.name}
                    </CardTitle>
                  </Link>
                  <CardDescription className="line-clamp-2 text-xs sm:text-sm mt-1 sm:mt-2">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between pb-3 sm:pb-4 px-4 sm:px-6">
                  <div>
                    <div className="flex items-baseline gap-1.5 sm:gap-2 mb-1 sm:mb-2 flex-wrap">
                      {hasDiscount && product.originalPrice && (
                        <span className="text-sm sm:text-lg text-muted-foreground line-through">
                          {product.originalPrice.toLocaleString("ru-RU")} ₽
                        </span>
                      )}
                      <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                        {finalPrice.toLocaleString("ru-RU")} ₽
                      </p>
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      В наличии: {product.stock} шт.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2 pt-0 pb-4 sm:pb-6 px-4 sm:px-6">
                  <Link href={`/products/${product.id}`} className="flex-1">
                    <Button className="w-full btn-gradient font-bold rounded-lg sm:rounded-xl text-sm sm:text-base py-4 sm:py-5 md:py-6 min-h-[44px] sm:min-h-[48px]">
                      Подробнее
                      <span className="ml-2 inline-block group-hover:translate-x-1 transition-transform">→</span>
                    </Button>
                  </Link>
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


