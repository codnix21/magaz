import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Формируем условия для WHERE
    let whereClause = "status != 'CANCELLED'"
    const params: any[] = []

    if (startDate) {
      whereClause += ' AND DATE(createdAt) >= ?'
      params.push(startDate)
    }
    if (endDate) {
      whereClause += ' AND DATE(createdAt) <= ?'
      params.push(endDate)
    }

    // Ежедневная статистика
    const dailySql = `
      SELECT 
        DATE(createdAt) as date,
        COUNT(*) as orderCount,
        SUM(total) as totalRevenue,
        SUM(subtotal) as totalSubtotal,
        SUM(discountAmount) as totalDiscount,
        AVG(total) as avgOrderValue
      FROM \`Order\`
      WHERE ${whereClause}
      GROUP BY DATE(createdAt) 
      ORDER BY date DESC 
      LIMIT 30
    `

    const rows = await prisma.$queryRawUnsafe<Array<{
      date: Date
      orderCount: bigint
      totalRevenue: number
      totalSubtotal: number
      totalDiscount: number
      avgOrderValue: number
    }>>(dailySql, ...params)

    // Общая статистика
    const statsSql = `
      SELECT 
        COUNT(*) as totalOrders,
        SUM(total) as totalRevenue,
        SUM(subtotal) as totalSubtotal,
        SUM(discountAmount) as totalDiscount,
        AVG(total) as avgOrderValue
      FROM \`Order\`
      WHERE ${whereClause}
    `

    const stats = await prisma.$queryRawUnsafe<Array<{
      totalOrders: bigint
      totalRevenue: number
      totalSubtotal: number
      totalDiscount: number
      avgOrderValue: number
    }>>(statsSql, ...params)

    return NextResponse.json({
      daily: rows.map(row => ({
        date: row.date,
        orderCount: Number(row.orderCount),
        totalRevenue: Number(row.totalRevenue || 0),
        totalSubtotal: Number(row.totalSubtotal || 0),
        totalDiscount: Number(row.totalDiscount || 0),
        avgOrderValue: Number(row.avgOrderValue || 0),
      })),
      summary: stats[0] ? {
        totalOrders: Number(stats[0].totalOrders),
        totalRevenue: Number(stats[0].totalRevenue || 0),
        totalSubtotal: Number(stats[0].totalSubtotal || 0),
        totalDiscount: Number(stats[0].totalDiscount || 0),
        avgOrderValue: Number(stats[0].avgOrderValue || 0),
      } : {
        totalOrders: 0,
        totalRevenue: 0,
        totalSubtotal: 0,
        totalDiscount: 0,
        avgOrderValue: 0,
      },
    })
  } catch (error) {
    console.error("Error fetching sales report:", error)
    return NextResponse.json(
      { error: "Failed to fetch sales report" },
      { status: 500 }
    )
  }
}

