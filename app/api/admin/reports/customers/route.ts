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

    // Топ клиентов по сумме заказов
    const [topCustomers] = await pool.execute(`
      SELECT 
        u.id,
        u.email,
        u.name,
        COUNT(DISTINCT o.id) as orderCount,
        SUM(o.total) as totalSpent,
        MAX(o.createdAt) as lastOrderDate
      FROM User u
      INNER JOIN \`Order\` o ON u.id = o.userId
      WHERE o.status != 'CANCELLED'
      GROUP BY u.id, u.email, u.name
      ORDER BY totalSpent DESC
      LIMIT 20
    `) as any[]

    // Новые клиенты (за последние 30 дней)
    const [newCustomers] = await pool.execute(`
      SELECT 
        u.id,
        u.email,
        u.name,
        u.createdAt,
        COUNT(DISTINCT o.id) as orderCount,
        SUM(o.total) as totalSpent
      FROM User u
      LEFT JOIN \`Order\` o ON u.id = o.userId AND o.status != 'CANCELLED'
      WHERE u.createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY u.id, u.email, u.name, u.createdAt
      ORDER BY u.createdAt DESC
      LIMIT 20
    `) as any[]

    // Общая статистика клиентов
    const [customerStats] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT u.id) as totalCustomers,
        COUNT(DISTINCT CASE WHEN u.createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN u.id END) as newCustomers30d,
        COUNT(DISTINCT CASE WHEN o.id IS NOT NULL THEN u.id END) as customersWithOrders,
        AVG(customerOrders.orderCount) as avgOrdersPerCustomer,
        AVG(customerOrders.totalSpent) as avgSpentPerCustomer
      FROM User u
      LEFT JOIN (
        SELECT 
          userId,
          COUNT(*) as orderCount,
          SUM(total) as totalSpent
        FROM \`Order\`
        WHERE status != 'CANCELLED'
        GROUP BY userId
      ) customerOrders ON u.id = customerOrders.userId
      LEFT JOIN \`Order\` o ON u.id = o.userId AND o.status != 'CANCELLED'
    `) as any[]

    return NextResponse.json({
      topCustomers,
      newCustomers,
      stats: customerStats[0] || {
        totalCustomers: 0,
        newCustomers30d: 0,
        customersWithOrders: 0,
        avgOrdersPerCustomer: 0,
        avgSpentPerCustomer: 0,
      },
    })
  } catch (error) {
    console.error("Error fetching customers report:", error)
    return NextResponse.json(
      { error: "Failed to fetch customers report" },
      { status: 500 }
    )
  }
}

