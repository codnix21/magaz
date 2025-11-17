import { NextResponse } from "next/server"
import { 
  findProductById, 
  updateProduct, 
  deleteProduct,
  findProductVariants,
  findProductImages,
  findProductAttributes
} from "@/lib/db-helpers"

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const product = await findProductById(resolvedParams.id)

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    // Получаем варианты, изображения и атрибуты
    const [variants, images, attributes] = await Promise.all([
      findProductVariants(resolvedParams.id),
      findProductImages(resolvedParams.id),
      findProductAttributes(resolvedParams.id)
    ])

    return NextResponse.json({
      ...product,
      variants,
      images,
      attributes
    })
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
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const body = await request.json()
    const { name, description, price, image, category, stock } = body

    const product = await updateProduct(resolvedParams.id, {
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
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    await deleteProduct(resolvedParams.id)

    return NextResponse.json({ message: "Product deleted" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    )
  }
}


