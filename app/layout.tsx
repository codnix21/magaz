import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

const inter = Inter({ subsets: ["latin", "cyrillic"] })

export const metadata: Metadata = {
  title: "Интернет-магазин | Лучшие товары по выгодным ценам",
  description: "Полнофункциональный интернет-магазин с современным дизайном. Широкий ассортимент товаров, удобная корзина, быстрая доставка и безопасная оплата.",
  keywords: "интернет-магазин, покупки онлайн, товары, доставка, оплата",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}


