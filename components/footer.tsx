import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white mt-auto relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
      <div className="container py-8 sm:py-12 px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <div>
            <h3 className="font-bold text-xl mb-4 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Магазин
            </h3>
            <p className="text-sm text-gray-300">
              Лучшие товары по выгодным ценам. Качество и надежность на первом месте.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-lg">Каталог</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/products" className="hover:text-blue-400 transition-colors">
                  Все товары
                </Link>
              </li>
              <li>
                <Link href="/products?category=Электроника" className="hover:text-blue-400 transition-colors">
                  Электроника
                </Link>
              </li>
              <li>
                <Link href="/products?category=Одежда" className="hover:text-blue-400 transition-colors">
                  Одежда
                </Link>
              </li>
              <li>
                <Link href="/products?category=Спорт" className="hover:text-blue-400 transition-colors">
                  Спорт
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-lg">Информация</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/orders" className="hover:text-blue-400 transition-colors">
                  Мои заказы
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-blue-400 transition-colors">
                  Корзина
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-blue-400 transition-colors">
                  Избранное
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-lg">Контакты</h4>
            <div className="text-sm text-gray-300 space-y-2">
              <div>
                <span className="font-medium">Email: </span>
                <a href="mailto:info@magazin.ru" className="hover:text-blue-400 transition-colors">info@magazin.ru</a>
              </div>
              <div>
                <span className="font-medium">Телефон: </span>
                <a href="tel:+79991234567" className="hover:text-blue-400 transition-colors">+7 (999) 123-45-67</a>
              </div>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Интернет-магазин. Все права защищены.
        </div>
      </div>
    </footer>
  )
}


