import { NextResponse } from "next/server"
import { 
  findProductById, 
  updateProduct, 
  deleteProduct,
  findProductVariants,
  findProductImages,
  findProductAttributes
} from "@/lib/db-helpers"

// Используем ISR для кеширования
export const revalidate = 60

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
    
    if (!resolvedParams.id || typeof resolvedParams.id !== 'string' || resolvedParams.id.trim().length === 0) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, description, price, image, category, stock } = body

    // Валидация входных данных
    const updates: any = {}
    
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: "Product name must be a non-empty string" },
          { status: 400 }
        )
      }
      updates.name = name.trim()
    }

    if (description !== undefined) {
      if (typeof description !== 'string' || description.trim().length === 0) {
        return NextResponse.json(
          { error: "Product description must be a non-empty string" },
          { status: 400 }
        )
      }
      updates.description = description.trim()
    }

    if (price !== undefined) {
      const priceNum = parseFloat(price)
      if (isNaN(priceNum) || priceNum < 0) {
        return NextResponse.json(
          { error: "Price must be a valid positive number" },
          { status: 400 }
        )
      }
      updates.price = priceNum
    }

    if (image !== undefined) {
      if (typeof image !== 'string' || image.trim().length === 0) {
        return NextResponse.json(
          { error: "Product image URL must be a non-empty string" },
          { status: 400 }
        )
      }
      updates.image = image.trim()
    }

    if (category !== undefined) {
      if (typeof category !== 'string' || category.trim().length === 0) {
        return NextResponse.json(
          { error: "Product category must be a non-empty string" },
          { status: 400 }
        )
      }
      updates.category = category.trim()
    }

    if (stock !== undefined) {
      const stockNum = parseInt(stock)
      if (isNaN(stockNum) || stockNum < 0) {
        return NextResponse.json(
          { error: "Stock must be a valid non-negative integer" },
          { status: 400 }
        )
      }
      updates.stock = stockNum
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "At least one field must be provided for update" },
        { status: 400 }
      )
    }

    const product = await updateProduct(resolvedParams.id.trim(), updates)

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
    
    if (!resolvedParams.id || typeof resolvedParams.id !== 'string' || resolvedParams.id.trim().length === 0) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      )
    }

    await deleteProduct(resolvedParams.id.trim())

    return NextResponse.json({ message: "Product deleted" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    )
  }
}


