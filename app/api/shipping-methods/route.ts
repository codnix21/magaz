import { NextResponse } from "next/server"
import { findShippingMethods } from "@/lib/db-helpers"

export async function GET() {
  try {
    const methods = await findShippingMethods(true)
    return NextResponse.json(methods)
  } catch (error) {
    console.error("Error fetching shipping methods:", error)
    return NextResponse.json(
      { error: "Failed to fetch shipping methods" },
      { status: 500 }
    )
  }
}

