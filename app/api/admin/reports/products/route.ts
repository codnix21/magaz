import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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
    const topProducts = await prisma.$queryRawUnsafe<Array<{
      id: string
      name: string
      category: string
      price: number
      stock: number
      totalSold: bigint
      totalRevenue: number
    }>>(`
      SELECT 
        p.id,
        p.name,
        p.category,
        p.price,
        p.stock,
        COALESCE(SUM(oi.quantity), 0) as totalSold,
        COALESCE(SUM(oi.quantity * oi.price), 0) as totalRevenue
      FROM Product p
      LEFT JOIN OrderItem oi ON p.id = oi.productId
      LEFT JOIN \`Order\` o ON oi.orderId = o.id AND o.status != 'CANCELLED'
      GROUP BY p.id, p.name, p.category, p.price, p.stock
      ORDER BY totalSold DESC
      LIMIT 20
    `)

    // Товары с низким остатком
    const lowStock = await prisma.product.findMany({
      where: {
        stock: { lt: 10 }
      },
      orderBy: {
        stock: 'asc'
      },
      take: 20
    })

    // Статистика по категориям
    const categoryStats = await prisma.$queryRawUnsafe<Array<{
      category: string
      productCount: bigint
      totalStock: number
      totalSold: bigint
    }>>(`
      SELECT 
        p.category,
        COUNT(DISTINCT p.id) as productCount,
        COALESCE(SUM(p.stock), 0) as totalStock,
        COALESCE(SUM(oi.quantity), 0) as totalSold
      FROM Product p
      LEFT JOIN OrderItem oi ON p.id = oi.productId
      LEFT JOIN \`Order\` o ON oi.orderId = o.id AND o.status != 'CANCELLED'
      GROUP BY p.category
      ORDER BY totalSold DESC
    `)

    return NextResponse.json({
      topProducts: topProducts.map(p => ({
        ...p,
        totalSold: Number(p.totalSold),
        totalRevenue: Number(p.totalRevenue)
      })),
      lowStock,
      categoryStats: categoryStats.map(c => ({
        ...c,
        productCount: Number(c.productCount),
        totalStock: Number(c.totalStock),
        totalSold: Number(c.totalSold)
      })),
    })
  } catch (error) {
    console.error("Error fetching products report:", error)
    return NextResponse.json(
      { error: "Failed to fetch products report" },
      { status: 500 }
    )
  }
}

