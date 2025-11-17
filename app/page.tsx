import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { findProducts } from "@/lib/db-helpers"
import { ShoppingBag } from "lucide-react"

async function getProducts() {
  try {
    const products = await findProducts({ limit: 6 })
    return products
  } catch (error: any) {
    console.error("Error fetching products:", error)
    // Если ошибка доступа к БД, возвращаем пустой массив
    if (error?.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error("⚠️  Ошибка доступа к базе данных. Проверьте настройки подключения и разрешения IP.")
    }
    return []
  }
}

// Кеширование страницы на 60 секунд для ускорения
export const revalidate = 60

export default async function HomePage() {
  const products = await getProducts()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white py-12 sm:py-16 md:py-24 mb-8 sm:mb-12 md:mb-16">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10"></div>
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-4 sm:mb-6 px-4 leading-tight">
              <span className="block mb-2">Добро пожаловать в</span>
              <span className="block bg-gradient-to-r from-white via-blue-100 to-indigo-100 bg-clip-text text-transparent drop-shadow-lg">
                наш магазин!
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-10 text-blue-50 px-4 max-w-2xl mx-auto leading-relaxed">
              Откройте для себя лучшие товары по выгодным ценам
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
              <Link href="/products">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 hover:scale-105 text-lg px-8 py-6 shadow-xl shadow-blue-500/30 transition-all duration-300 font-semibold">
                  Посмотреть все товары
                </Button>
              </Link>
              <Link href="/products">
                <Button size="lg" variant="outline" className="border-2 border-white/80 text-white hover:bg-white/20 hover:border-white text-lg px-8 py-6 backdrop-blur-sm transition-all duration-300 font-semibold">
                  Новинки
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent"></div>
      </section>

      <div className="container py-6 sm:py-8 px-4 sm:px-6">
      <section>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Популярные товары
          </h2>
          <Link href="/products">
            <Button variant="outline" className="group w-full sm:w-auto">
              Все товары
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Button>
          </Link>
        </div>
        {products.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground mb-4">
              Товары пока отсутствуют
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Войдите как администратор, чтобы добавить товары
            </p>
            <p className="text-xs text-destructive mt-4">
              ⚠️ Если видите ошибку в консоли о доступе к БД, нужно разрешить ваш IP на MySQL сервере
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {products.map((product, index) => {
              const hasDiscount = product.discountPercent && product.discountPercent > 0
              const finalPrice = hasDiscount
                ? Math.round(product.price * (1 - (product.discountPercent || 0) / 100))
                : product.price

              return (
                <Card 
                  key={product.id} 
                  className="flex flex-col group hover:shadow-2xl transition-all duration-500 border-2 border-blue-100/50 hover:border-blue-400 overflow-hidden bg-white/80 backdrop-blur-sm hover:-translate-y-2"
                  style={{ animationDelay: `${index * 100}ms` }}
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
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
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
      </section>
      </div>
    </div>
  )
}


