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

    const product = await createProduct({
      name,
      description,
      price: parseFloat(price),
      image,
      category,
      stock: parseInt(stock),
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


