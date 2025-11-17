import { NextResponse } from "next/server"
import { findShippingMethodById, calculateShippingCost } from "@/lib/db-helpers"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const total = parseFloat(searchParams.get("total") || "0")
    
    const cost = await calculateShippingCost(params.id, total)
    
    return NextResponse.json({ cost })
  } catch (error) {
    console.error("Error calculating shipping cost:", error)
    return NextResponse.json(
      { error: "Failed to calculate shipping cost" },
      { status: 500 }
    )
  }
}

