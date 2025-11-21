import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { findProducts } from "@/lib/db-helpers"
import { ShoppingBag, Gift, Sparkles } from "lucide-react"

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
    <div className="min-h-screen bg-gradient-modern bg-mesh">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-cyan-500 via-blue-500 to-indigo-600 text-white py-20 sm:py-24 md:py-32 lg:py-40 mb-12 sm:mb-16 md:mb-20 animate-gradient">
        {/* Animated background pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-20 animate-pulse"></div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10"></div>
        
        {/* Floating shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-400/25 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/25 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-400/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        
        <div className="container relative z-10">
          <div className="max-w-6xl mx-auto text-center animate-fade-in">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 sm:mb-8 md:mb-10 px-4 leading-tight tracking-tight">
              <span className="block mb-2 sm:mb-3 md:mb-4 animate-slide-in text-white/90 text-2xl sm:text-3xl md:text-4xl lg:text-5xl">Добро пожаловать в</span>
              <span className="block bg-gradient-to-r from-white via-emerald-100 via-cyan-100 to-blue-100 bg-clip-text text-transparent drop-shadow-2xl animate-slide-in glow-shadow-emerald" style={{ animationDelay: '0.2s' }}>
                наш магазин!
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-8 sm:mb-12 md:mb-16 text-white/95 px-4 max-w-4xl mx-auto leading-relaxed font-semibold animate-fade-in" style={{ animationDelay: '0.4s' }}>
              Откройте для себя лучшие товары по выгодным ценам
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 md:gap-6 justify-center px-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <Link href="/products" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-white text-emerald-600 hover:bg-emerald-50 hover:scale-105 sm:hover:scale-110 text-base sm:text-lg md:text-xl px-6 sm:px-8 md:px-12 py-6 sm:py-7 md:py-8 shadow-2xl shadow-emerald-500/50 transition-all duration-300 font-bold rounded-xl sm:rounded-2xl hover:shadow-emerald-500/70 glow-shadow-emerald">
                  Посмотреть все товары
                  <span className="ml-2 inline-block group-hover:translate-x-1 transition-transform">→</span>
                </Button>
              </Link>
              <Link href="/products?promo=true" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 sm:border-3 border-white/95 text-white hover:bg-white/25 hover:border-white hover:scale-105 sm:hover:scale-110 text-base sm:text-lg md:text-xl px-6 sm:px-8 md:px-12 py-6 sm:py-7 md:py-8 backdrop-blur-xl transition-all duration-300 font-bold rounded-xl sm:rounded-2xl bg-white/20 glass-effect">
                  <Gift className="h-5 w-5 sm:h-6 sm:w-6 mr-2 inline animate-float" />
                  Акции и скидки
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent"></div>
      </section>

      <div className="container py-8 sm:py-12 px-4 sm:px-6">
      <section className="animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-10 md:mb-12 gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-600 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl glow-shadow-emerald animate-pulse-glow">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 bg-clip-text text-transparent animate-gradient">
                Популярные товары
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1">Лучшие предложения для вас</p>
            </div>
          </div>
          <Link href="/products" className="w-full sm:w-auto">
            <Button variant="outline" className="group w-full sm:w-auto border-2 hover:bg-emerald-50 hover:border-emerald-400 hover:scale-105 transition-all duration-300 font-semibold rounded-lg sm:rounded-xl text-sm sm:text-base px-4 sm:px-6 py-2.5 sm:py-3 min-h-[44px]">
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
                  className="flex flex-col group card-modern hover:border-blue-300/80 overflow-hidden animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
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
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
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
                      <CardTitle className="text-lg sm:text-xl group-hover:text-blue-600 transition-colors line-clamp-2 cursor-pointer">
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
      </section>
      </div>
    </div>
  )
}


