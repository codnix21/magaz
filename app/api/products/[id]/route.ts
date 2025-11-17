import { NextResponse } from "next/server"
import { findProductById, updateProduct, deleteProduct } from "@/lib/db-helpers"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = await findProductById(params.id)

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, description, price, image, category, stock } = body

    const product = await updateProduct(params.id, {
      name,
      description,
      price: parseFloat(price),
      image,
      category,
      stock: parseInt(stock),
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteProduct(params.id)

    return NextResponse.json({ message: "Product deleted" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    )
  }
}


