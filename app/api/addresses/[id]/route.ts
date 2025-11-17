import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { findAddressById, updateAddress, deleteAddress } from "@/lib/db-helpers"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (!params.id || typeof params.id !== 'string' || params.id.trim().length === 0) {
      return NextResponse.json(
        { error: "Address ID is required" },
        { status: 400 }
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
    const updates: any = {}

    if (type !== undefined) {
      if (!['SHIPPING', 'BILLING', 'BOTH'].includes(type)) {
        return NextResponse.json(
          { error: "Type must be 'SHIPPING', 'BILLING', or 'BOTH'" },
          { status: 400 }
        )
      }
      updates.type = type
    }

    if (firstName !== undefined) {
      if (typeof firstName !== 'string' || firstName.trim().length === 0) {
        return NextResponse.json(
          { error: "First name must be a non-empty string" },
          { status: 400 }
        )
      }
      updates.firstName = firstName.trim()
    }

    if (lastName !== undefined) {
      if (typeof lastName !== 'string' || lastName.trim().length === 0) {
        return NextResponse.json(
          { error: "Last name must be a non-empty string" },
          { status: 400 }
        )
      }
      updates.lastName = lastName.trim()
    }

    if (phone !== undefined) {
      if (phone !== null && (typeof phone !== 'string' || phone.trim().length === 0)) {
        return NextResponse.json(
          { error: "Phone must be null or a non-empty string" },
          { status: 400 }
        )
      }
      updates.phone = phone ? phone.trim() : null
    }

    if (city !== undefined) {
      if (typeof city !== 'string' || city.trim().length === 0) {
        return NextResponse.json(
          { error: "City must be a non-empty string" },
          { status: 400 }
        )
      }
      updates.city = city.trim()
    }

    if (street !== undefined) {
      if (typeof street !== 'string' || street.trim().length === 0) {
        return NextResponse.json(
          { error: "Street address must be a non-empty string" },
          { status: 400 }
        )
      }
      updates.street = street.trim()
    }

    if (country !== undefined) {
      updates.country = country ? country.trim() : "Россия"
    }

    if (region !== undefined) {
      updates.region = region ? region.trim() : null
    }

    if (postalCode !== undefined) {
      updates.postalCode = postalCode ? postalCode.trim() : null
    }

    if (isDefault !== undefined) {
      updates.isDefault = Boolean(isDefault)
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "At least one field must be provided for update" },
        { status: 400 }
      )
    }

    const address = await updateAddress(params.id.trim(), session.user.id, updates)

    return NextResponse.json(address)
  } catch (error) {
    console.error("Error updating address:", error)
    return NextResponse.json(
      { error: "Failed to update address" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (!params.id || typeof params.id !== 'string' || params.id.trim().length === 0) {
      return NextResponse.json(
        { error: "Address ID is required" },
        { status: 400 }
      )
    }

    await deleteAddress(params.id.trim(), session.user.id)

    return NextResponse.json({ message: "Address deleted" })
  } catch (error) {
    console.error("Error deleting address:", error)
    return NextResponse.json(
      { error: "Failed to delete address" },
      { status: 500 }
    )
  }
}

