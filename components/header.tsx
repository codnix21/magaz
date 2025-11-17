"use client"

import Link from "next/link"
import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { ShoppingCart, User, Menu, X, Heart, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/use-cart"

export function Header() {
  const { data: session } = useSession()
  const { cartItemsCount } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
            <ShoppingCart className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Магазин
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
          <Link
            href="/"
            className="text-sm font-semibold transition-colors hover:text-blue-600 relative group"
          >
            Главная
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
          </Link>
          <Link
            href="/products"
            className="text-sm font-semibold transition-colors hover:text-blue-600 relative group"
          >
            Товары
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
          </Link>
          <Link
            href="/products?promo=true"
            className="text-sm font-semibold transition-colors hover:text-blue-600 relative group flex items-center gap-1"
          >
            <Gift className="h-4 w-4" />
            Акции
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
          </Link>
          {session?.user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="text-sm font-semibold transition-colors hover:text-blue-600 relative group"
            >
              Админ
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
            </Link>
          )}
        </nav>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {session && (
            <Link href="/wishlist" className="hidden sm:block">
              <Button variant="ghost" size="icon" className="relative hover:bg-blue-50 hover:text-blue-600">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>
          )}
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative hover:bg-blue-50 hover:text-blue-600">
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-xs font-bold text-white flex items-center justify-center shadow-lg">
                  {cartItemsCount > 9 ? '9+' : cartItemsCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Desktop user menu */}
          <div className="hidden md:flex items-center space-x-2">
            {session ? (
              <>
                <Link href="/profile">
                  <Button variant="ghost" size="sm" className="hover:bg-blue-50 hover:text-blue-600">
                    <User className="h-4 w-4 mr-2" />
                    <span className="hidden lg:inline">{session.user?.name || session.user?.email?.split('@')[0]}</span>
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut()}
                  className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                >
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm" className="hover:bg-blue-50 hover:text-blue-600">
                    Войти
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg">
                    Регистрация
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white animate-in slide-in-from-top">
          <div className="container py-4 space-y-2">
            <Link
              href="/"
              className="block px-4 py-2 text-sm font-semibold hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Главная
            </Link>
            <Link
              href="/products"
              className="block px-4 py-2 text-sm font-semibold hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Товары
            </Link>
            <Link
              href="/products?promo=true"
              className="block px-4 py-2 text-sm font-semibold hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Gift className="h-4 w-4" />
              Акции
            </Link>
            {session && (
              <Link
                href="/wishlist"
                className="block px-4 py-2 text-sm font-semibold hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Heart className="h-4 w-4" />
                Избранное
              </Link>
            )}
            {session?.user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="block px-4 py-2 text-sm font-semibold hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Админ-панель
              </Link>
            )}
            <div className="pt-4 border-t space-y-2">
              {session ? (
                <>
                  <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <User className="h-4 w-4 mr-2" />
                      Профиль
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                    onClick={() => {
                      signOut()
                      setMobileMenuOpen(false)
                    }}
                  >
                    Выйти
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full">
                      Войти
                    </Button>
                  </Link>
                  <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                      Регистрация
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}


