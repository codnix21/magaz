import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createProduct } from "@/lib/db-helpers"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      return NextResponse.json(
        { error: "Invalid CSV format" },
        { status: 400 }
      )
    }

    // Парсим CSV (простой парсер)
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = []
      let current = ''
      let inQuotes = false
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      result.push(current.trim())
      return result
    }

    const headers = parseCSVLine(lines[0])
    const dataRows = lines.slice(1).map(parseCSVLine)

    let imported = 0
    let errors = 0
    const errorMessages: string[] = []

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i]
      if (row.length < headers.length) continue

      try {
        const productData: any = {}
        headers.forEach((header, idx) => {
          const value = row[idx]?.replace(/^"|"$/g, '') || ''
          switch (header.toLowerCase()) {
            case 'id':
              // Пропускаем ID при импорте, создадим новый
              break
            case 'название':
            case 'name':
              productData.name = value
              break
            case 'описание':
            case 'description':
              productData.description = value.replace(/;/g, ',')
              break
            case 'цена':
            case 'price':
              productData.price = parseFloat(value) || 0
              break
            case 'категория':
            case 'category':
              productData.category = value
              break
            case 'остаток':
            case 'stock':
              productData.stock = parseInt(value) || 0
              break
            case 'скидка %':
            case 'discountpercent':
              productData.discountPercent = parseInt(value) || 0
              break
            case 'оригинальная цена':
            case 'originalprice':
              productData.originalPrice = value ? parseFloat(value) : null
              break
            case 'изображение':
            case 'image':
              productData.image = value
              break
          }
        })

        if (productData.name && productData.price !== undefined) {
          await createProduct({
            name: productData.name,
            description: productData.description || '',
            price: productData.price,
            image: productData.image || '/placeholder.jpg',
            category: productData.category || 'Другое',
            stock: productData.stock || 0,
            discountPercent: productData.discountPercent || 0,
            originalPrice: productData.originalPrice || null,
          })
          imported++
        } else {
          errors++
          errorMessages.push(`Строка ${i + 2}: отсутствуют обязательные поля`)
        }
      } catch (error: any) {
        errors++
        errorMessages.push(`Строка ${i + 2}: ${error.message}`)
      }
    }

    return NextResponse.json({
      message: `Импорт завершен: ${imported} товаров импортировано, ${errors} ошибок`,
      imported,
      errors,
      errorMessages: errorMessages.slice(0, 10), // Первые 10 ошибок
    })
  } catch (error) {
    console.error("Error importing products:", error)
    return NextResponse.json(
      { error: "Failed to import products" },
      { status: 500 }
    )
  }
}

