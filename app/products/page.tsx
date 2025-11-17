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
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [search, category, products])

  const fetchProducts = async () => {
    try {
      const url = category
        ? `/api/products?category=${category}`
        : "/api/products"
      const response = await fetch(url)
      const data = await response.json()
      
      // Убеждаемся, что data - это массив
      if (Array.isArray(data)) {
        setProducts(data)
        setFilteredProducts(data)
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

  const filterProducts = () => {
    if (!Array.isArray(products)) {
      setFilteredProducts([])
      return
    }
    
    let filtered = products

    if (search) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(search.toLowerCase()) ||
          product.description.toLowerCase().includes(search.toLowerCase())
      )
    }

    setFilteredProducts(filtered)
  }

  const categories = Array.isArray(products)
    ? Array.from(new Set(products.map((p) => p.category)))
    : []

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
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Каталог товаров
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">Найдите то, что ищете</p>
      </div>

      <div className="mb-6 sm:mb-8 space-y-4">
        <Card className="p-3 sm:p-4 border-2 border-blue-100 shadow-lg">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 h-4 w-4 sm:h-5 sm:w-5" />
              <Input
                placeholder="Поиск товаров..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 sm:pl-10 border-2 focus:border-blue-500 text-sm sm:text-base"
              />
            </div>
          </div>
        </Card>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={category === "" ? "default" : "outline"}
            onClick={() => setCategory("")}
            className={category === "" ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" : ""}
          >
            Все категории
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={category === cat ? "default" : "outline"}
              onClick={() => setCategory(cat)}
              className={category === cat ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" : ""}
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
            onClick={() => { setSearch(""); setCategory(""); }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
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
                  className="flex flex-col group hover:shadow-2xl transition-all duration-500 border-2 border-blue-100/50 hover:border-blue-400 overflow-hidden bg-white/80 backdrop-blur-sm hover:-translate-y-2"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                <div className="relative w-full h-64 overflow-hidden">
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
                  <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                    {hasDiscount && (
                      <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-xl shadow-red-500/50 animate-pulse">
                        -{product.discountPercent}%
                      </span>
                    )}
                    {product.stock > 0 ? (
                      <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-green-500/30">
                        В наличии
                      </span>
                    ) : (
                      <span className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-red-500/30">
                        Нет в наличии
                      </span>
                    )}
                  </div>
                </div>
                <CardHeader className="pb-3">
                  <Link href={`/products/${product.id}`}>
                    <CardTitle className="text-xl group-hover:text-blue-600 transition-colors line-clamp-2 cursor-pointer">
                      {product.name}
                    </CardTitle>
                  </Link>
                  <CardDescription className="line-clamp-2 text-sm">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between pb-4">
                  <div>
                    <div className="flex items-baseline gap-2 mb-1">
                      {hasDiscount && product.originalPrice && (
                        <span className="text-lg text-muted-foreground line-through">
                          {product.originalPrice.toLocaleString("ru-RU")} ₽
                        </span>
                      )}
                      <p className="text-3xl font-bold text-blue-600">
                        {finalPrice.toLocaleString("ru-RU")} ₽
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      В наличии: {product.stock} шт.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2 pt-0 pb-4">
                  <Link href={`/products/${product.id}`} className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 font-semibold">
                      Подробнее
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


