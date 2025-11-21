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

    // Топ клиентов по сумме заказов
    const topCustomers = await prisma.$queryRawUnsafe<Array<{
      id: string
      email: string
      name: string | null
      orderCount: bigint
      totalSpent: number
      lastOrderDate: Date
    }>>(`
      SELECT 
        u.id,
        u.email,
        u.name,
        COUNT(DISTINCT o.id) as orderCount,
        COALESCE(SUM(o.total), 0) as totalSpent,
        MAX(o.createdAt) as lastOrderDate
      FROM User u
      INNER JOIN \`Order\` o ON u.id = o.userId
      WHERE o.status != 'CANCELLED'
      GROUP BY u.id, u.email, u.name
      ORDER BY totalSpent DESC
      LIMIT 20
    `)

    // Новые клиенты (за последние 30 дней)
    const newCustomers = await prisma.$queryRawUnsafe<Array<{
      id: string
      email: string
      name: string | null
      createdAt: Date
      orderCount: bigint
      totalSpent: number
    }>>(`
      SELECT 
        u.id,
        u.email,
        u.name,
        u.createdAt,
        COUNT(DISTINCT o.id) as orderCount,
        COALESCE(SUM(o.total), 0) as totalSpent
      FROM User u
      LEFT JOIN \`Order\` o ON u.id = o.userId AND o.status != 'CANCELLED'
      WHERE u.createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY u.id, u.email, u.name, u.createdAt
      ORDER BY u.createdAt DESC
      LIMIT 20
    `)

    // Общая статистика клиентов
    const customerStats = await prisma.$queryRawUnsafe<Array<{
      totalCustomers: bigint
      newCustomers30d: bigint
      customersWithOrders: bigint
      avgOrdersPerCustomer: number
      avgSpentPerCustomer: number
    }>>(`
      SELECT 
        COUNT(DISTINCT u.id) as totalCustomers,
        COUNT(DISTINCT CASE WHEN u.createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN u.id END) as newCustomers30d,
        COUNT(DISTINCT CASE WHEN o.id IS NOT NULL THEN u.id END) as customersWithOrders,
        COALESCE(AVG(customerOrders.orderCount), 0) as avgOrdersPerCustomer,
        COALESCE(AVG(customerOrders.totalSpent), 0) as avgSpentPerCustomer
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
    `)

    return NextResponse.json({
      topCustomers: topCustomers.map(c => ({
        ...c,
        orderCount: Number(c.orderCount),
        totalSpent: Number(c.totalSpent)
      })),
      newCustomers: newCustomers.map(c => ({
        ...c,
        orderCount: Number(c.orderCount),
        totalSpent: Number(c.totalSpent)
      })),
      stats: customerStats[0] ? {
        totalCustomers: Number(customerStats[0].totalCustomers),
        newCustomers30d: Number(customerStats[0].newCustomers30d),
        customersWithOrders: Number(customerStats[0].customersWithOrders),
        avgOrdersPerCustomer: Number(customerStats[0].avgOrdersPerCustomer || 0),
        avgSpentPerCustomer: Number(customerStats[0].avgSpentPerCustomer || 0),
      } : {
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

