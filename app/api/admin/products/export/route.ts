import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { findProducts } from "@/lib/db-helpers"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const products = await findProducts({ limit: 10000 })

    // Формируем CSV
    const headers = ['ID', 'Название', 'Описание', 'Цена', 'Категория', 'Остаток', 'Скидка %', 'Оригинальная цена', 'Изображение']
    const rows = products.map(p => [
      p.id,
      p.name,
      p.description.replace(/,/g, ';'), // Заменяем запятые в описании
      p.price,
      p.category,
      p.stock,
      p.discountPercent || 0,
      p.originalPrice || '',
      p.image
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="products_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("Error exporting products:", error)
    return NextResponse.json(
      { error: "Failed to export products" },
      { status: 500 }
    )
  }
}

