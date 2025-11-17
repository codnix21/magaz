import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { findUserAddresses, createAddress } from "@/lib/db-helpers"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const addresses = await findUserAddresses(session.user.id)
    return NextResponse.json(addresses)
  } catch (error) {
    console.error("Error fetching addresses:", error)
    return NextResponse.json(
      { error: "Failed to fetch addresses" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      type,
      firstName,
      lastName,
      phone,
      country,
      region,
      city,
      postalCode,
      street,
      isDefault
    } = body

    // Валидация входных данных
    if (!type || !['SHIPPING', 'BILLING', 'BOTH'].includes(type)) {
      return NextResponse.json(
        { error: "Type must be 'SHIPPING', 'BILLING', or 'BOTH'" },
        { status: 400 }
      )
    }

    if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0) {
      return NextResponse.json(
        { error: "First name is required" },
        { status: 400 }
      )
    }

    if (!lastName || typeof lastName !== 'string' || lastName.trim().length === 0) {
      return NextResponse.json(
        { error: "Last name is required" },
        { status: 400 }
      )
    }

    if (!city || typeof city !== 'string' || city.trim().length === 0) {
      return NextResponse.json(
        { error: "City is required" },
        { status: 400 }
      )
    }

    if (!street || typeof street !== 'string' || street.trim().length === 0) {
      return NextResponse.json(
        { error: "Street address is required" },
        { status: 400 }
      )
    }

    const address = await createAddress({
      userId: session.user.id,
      type,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone ? phone.trim() : null,
      country: country ? country.trim() : "Россия",
      region: region ? region.trim() : null,
      city: city.trim(),
      postalCode: postalCode ? postalCode.trim() : null,
      street: street.trim(),
      isDefault: Boolean(isDefault)
    })

    return NextResponse.json(address, { status: 201 })
  } catch (error) {
    console.error("Error creating address:", error)
    return NextResponse.json(
      { error: "Failed to create address" },
      { status: 500 }
    )
  }
}

