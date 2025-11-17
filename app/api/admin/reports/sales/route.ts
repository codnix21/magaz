import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import pool from "@/lib/db"

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

    let sql = `
      SELECT 
        DATE(createdAt) as date,
        COUNT(*) as orderCount,
        SUM(total) as totalRevenue,
        SUM(subtotal) as totalSubtotal,
        SUM(discountAmount) as totalDiscount,
        AVG(total) as avgOrderValue
      FROM \`Order\`
      WHERE status != 'CANCELLED'
    `
    const params: any[] = []

    if (startDate) {
      sql += ' AND DATE(createdAt) >= ?'
      params.push(startDate)
    }
    if (endDate) {
      sql += ' AND DATE(createdAt) <= ?'
      params.push(endDate)
    }

    sql += ' GROUP BY DATE(createdAt) ORDER BY date DESC LIMIT 30'

    const [rows] = await pool.execute(sql, params) as any[]

    // Общая статистика
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as totalOrders,
        SUM(total) as totalRevenue,
        SUM(subtotal) as totalSubtotal,
        SUM(discountAmount) as totalDiscount,
        AVG(total) as avgOrderValue
      FROM \`Order\`
      WHERE status != 'CANCELLED'
      ${startDate ? 'AND DATE(createdAt) >= ?' : ''}
      ${endDate ? 'AND DATE(createdAt) <= ?' : ''}
    `, params) as any[]

    return NextResponse.json({
      daily: rows,
      summary: stats[0] || {
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

