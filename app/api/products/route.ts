import { NextResponse } from "next/server"
import { findProducts, createProduct } from "@/lib/db-helpers"

export const dynamic = 'force-dynamic'
export const revalidate = 60 // Кешируем на 60 секунд

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    const products = await findProducts({
      category: category || undefined,
      search: search || undefined,
    })

    // Убеждаемся, что возвращаем массив
    return NextResponse.json(Array.isArray(products) ? products : [])
  } catch (error: any) {
    console.error("Error fetching products:", error)
    // При ошибке возвращаем пустой массив вместо объекта с ошибкой
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, price, image, category, stock } = body

    // Валидация входных данных
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Product name is required and must be a non-empty string" },
        { status: 400 }
      )
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return NextResponse.json(
        { error: "Product description is required and must be a non-empty string" },
        { status: 400 }
      )
    }

    const priceNum = parseFloat(price)
    if (isNaN(priceNum) || priceNum < 0) {
      return NextResponse.json(
        { error: "Price must be a valid positive number" },
        { status: 400 }
      )
    }

    if (!image || typeof image !== 'string' || image.trim().length === 0) {
      return NextResponse.json(
        { error: "Product image URL is required" },
        { status: 400 }
      )
    }

    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      return NextResponse.json(
        { error: "Product category is required" },
        { status: 400 }
      )
    }

    const stockNum = parseInt(stock)
    if (isNaN(stockNum) || stockNum < 0) {
      return NextResponse.json(
        { error: "Stock must be a valid non-negative integer" },
        { status: 400 }
      )
    }

    const product = await createProduct({
      name: name.trim(),
      description: description.trim(),
      price: priceNum,
      image: image.trim(),
      category: category.trim(),
      stock: stockNum,
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    )
  }
}


