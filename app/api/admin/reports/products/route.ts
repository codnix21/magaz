import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import pool from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Топ продаваемых товаров
    const [topProducts] = await pool.execute(`
      SELECT 
        p.id,
        p.name,
        p.category,
        p.price,
        p.stock,
        SUM(oi.quantity) as totalSold,
        SUM(oi.quantity * oi.price) as totalRevenue
      FROM Product p
      LEFT JOIN OrderItem oi ON p.id = oi.productId
      LEFT JOIN \`Order\` o ON oi.orderId = o.id AND o.status != 'CANCELLED'
      GROUP BY p.id, p.name, p.category, p.price, p.stock
      ORDER BY totalSold DESC
      LIMIT 20
    `) as any[]

    // Товары с низким остатком
    const [lowStock] = await pool.execute(`
      SELECT * FROM Product
      WHERE stock < 10
      ORDER BY stock ASC
      LIMIT 20
    `) as any[]

    // Статистика по категориям
    const [categoryStats] = await pool.execute(`
      SELECT 
        p.category,
        COUNT(DISTINCT p.id) as productCount,
        SUM(p.stock) as totalStock,
        SUM(oi.quantity) as totalSold
      FROM Product p
      LEFT JOIN OrderItem oi ON p.id = oi.productId
      LEFT JOIN \`Order\` o ON oi.orderId = o.id AND o.status != 'CANCELLED'
      GROUP BY p.category
      ORDER BY totalSold DESC
    `) as any[]

    return NextResponse.json({
      topProducts,
      lowStock,
      categoryStats,
    })
  } catch (error) {
    console.error("Error fetching products report:", error)
    return NextResponse.json(
      { error: "Failed to fetch products report" },
      { status: 500 }
    )
  }
}

