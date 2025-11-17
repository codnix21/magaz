import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { findOrderReturnById, updateOrderReturnStatus, updateOrderReturnRefundStatus } from "@/lib/db-helpers"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const return_ = await findOrderReturnById(
      params.id,
      session.user.role !== "ADMIN" ? session.user.id : undefined
    )

    if (!return_) {
      return NextResponse.json(
        { error: "Return not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(return_)
  } catch (error) {
    console.error("Error fetching return:", error)
    return NextResponse.json(
      { error: "Failed to fetch return" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    if (!params.id || typeof params.id !== 'string' || params.id.trim().length === 0) {
      return NextResponse.json(
        { error: "Return ID is required" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { status, refundStatus, adminComment } = body

    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'PROCESSING', 'COMPLETED']
    const validRefundStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']

    if (status) {
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: `Status must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        )
      }
      if (adminComment && (typeof adminComment !== 'string' || adminComment.trim().length > 1000)) {
        return NextResponse.json(
          { error: "Admin comment must be a string with maximum 1000 characters" },
          { status: 400 }
        )
      }
      const return_ = await updateOrderReturnStatus(params.id.trim(), status, adminComment ? adminComment.trim() : null)
      return NextResponse.json(return_)
    }

    if (refundStatus) {
      if (!validRefundStatuses.includes(refundStatus)) {
        return NextResponse.json(
          { error: `Refund status must be one of: ${validRefundStatuses.join(', ')}` },
          { status: 400 }
        )
      }
      const return_ = await updateOrderReturnRefundStatus(params.id.trim(), refundStatus)
      return NextResponse.json(return_)
    }

    return NextResponse.json(
      { error: "Status or refundStatus is required" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Error updating return:", error)
    return NextResponse.json(
      { error: "Failed to update return" },
      { status: 500 }
    )
  }
}

