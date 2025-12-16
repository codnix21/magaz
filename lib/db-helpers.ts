import { prisma } from './prisma'

// Типы для таблиц (из Prisma schema)
export interface User {
  id: string
  email: string
  name: string | null
  password: string
  role: string
  phone?: string | null
  emailVerified?: boolean
  phoneVerified?: boolean
  oauthProvider?: string | null
  oauthId?: string | null
  avatar?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  stock: number
  discountPercent?: number
  originalPrice?: number | null
  createdAt: Date
  updatedAt: Date
}

export interface CartItem {
  id: string
  userId: string
  productId: string
  quantity: number
  variantId?: string | null
  createdAt: Date
  updatedAt: Date
  product?: Product
  variant?: ProductVariant
}

export interface Order {
  id: string
  userId: string
  total: number
  status: string
  shippingAddress: string
  promoCodeId?: string | null
  discountAmount?: number
  subtotal?: number
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  price: number
  variantId?: string | null
  variantName?: string | null
  createdAt: Date
}

// Новые интерфейсы для расширенного функционала
export interface ProductVariant {
  id: string
  productId: string
  name: string
  value: string
  sku?: string | null
  price?: number | null
  stock: number
  image?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ProductImage {
  id: string
  productId: string
  url: string
  alt?: string | null
  order: number
  isPrimary: boolean
  createdAt: Date
}

export interface ProductAttribute {
  id: string
  productId: string
  name: string
  value: string
  order: number
  createdAt: Date
}

export interface Address {
  id: string
  userId: string
  type: 'SHIPPING' | 'BILLING' | 'BOTH'
  firstName: string
  lastName: string
  phone?: string | null
  country: string
  region?: string | null
  city: string
  postalCode?: string | null
  street: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ShippingMethod {
  id: string
  name: string
  description?: string | null
  price: number
  freeShippingThreshold?: number | null
  estimatedDays?: number | null
  isActive: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface ProductReservation {
  id: string
  orderId?: string | null
  productId: string
  variantId?: string | null
  quantity: number
  status: 'PENDING' | 'CONFIRMED' | 'RELEASED' | 'EXPIRED'
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface OrderReturn {
  id: string
  orderId: string
  userId: string
  reason: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSING' | 'COMPLETED'
  refundAmount: number
  refundStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  adminComment?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Ticket {
  id: string
  userId: string
  orderId?: string | null
  subject: string
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING' | 'RESOLVED' | 'CLOSED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  assignedTo?: string | null
  createdAt: Date
  updatedAt: Date
  closedAt?: Date | null
}

export interface TicketMessage {
  id: string
  ticketId: string
  userId: string
  message: string
  isInternal: boolean
  attachments?: any
  createdAt: Date
}

export interface Notification {
  id: string
  userId: string
  type: 'ORDER' | 'SHIPMENT' | 'PAYMENT' | 'RETURN' | 'REVIEW' | 'SYSTEM'
  title: string
  message: string
  link?: string | null
  read: boolean
  createdAt: Date
}

export interface Tag {
  id: string
  name: string
  slug: string
  description?: string | null
  createdAt: Date
}

// Вспомогательные функции для работы с БД
export async function findUserByEmail(email: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { email }
  }) as User | null
}

export async function findUserById(id: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { id }
  }) as User | null
}

export async function createUser(data: {
  email: string
  password: string
  name?: string
  role?: string
  oauthProvider?: string | null
  oauthId?: string | null
}): Promise<User> {
  const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  return await prisma.user.create({
    data: {
      id,
      email: data.email,
      password: data.password,
      name: data.name || null,
      role: data.role || 'USER',
      oauthProvider: data.oauthProvider || null,
      oauthId: data.oauthId || null,
      emailVerified: data.oauthProvider ? true : false
    }
  }) as User
}

export async function findProducts(filters?: {
  category?: string
  search?: string
  limit?: number
}): Promise<Product[]> {
  try {
    const where: any = {}
    
    if (filters?.category) {
      where.category = filters.category
    }
    
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { description: { contains: filters.search } }
      ]
    }
    
    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit
    })
    
    return products as Product[]
  } catch (error: any) {
    console.error('Database error in findProducts:', error)
    throw error
  }
}

export async function findProductById(id: string): Promise<Product | null> {
  return await prisma.product.findUnique({
    where: { id }
  }) as Product | null
}

export async function createProduct(data: {
  name: string
  description: string
  price: number
  image: string
  category: string
  stock: number
}): Promise<Product> {
  const id = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  return await prisma.product.create({
    data: {
      id,
      name: data.name,
      description: data.description,
      price: data.price,
      image: data.image,
      category: data.category,
      stock: data.stock
    }
  }) as Product
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  const updateData: any = {}
  
  if (data.name !== undefined) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description
  if (data.price !== undefined) updateData.price = data.price
  if (data.image !== undefined) updateData.image = data.image
  if (data.category !== undefined) updateData.category = data.category
  if (data.stock !== undefined) updateData.stock = data.stock
  if (data.discountPercent !== undefined) updateData.discountPercent = data.discountPercent
  if (data.originalPrice !== undefined) updateData.originalPrice = data.originalPrice
  
  return await prisma.product.update({
    where: { id },
    data: updateData
  }) as Product
}

export async function deleteProduct(id: string): Promise<void> {
  await prisma.product.delete({
    where: { id }
  })
}

export async function findCartItems(userId: string): Promise<CartItem[]> {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          image: true,
          category: true,
          stock: true,
          discountPercent: true,
          originalPrice: true,
          createdAt: true,
          updatedAt: true,
        }
      },
      variant: {
        select: {
          id: true,
          productId: true,
          name: true,
          value: true,
          price: true,
          stock: true,
          sku: true,
          createdAt: true,
          updatedAt: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
  
  return items.map(item => ({
    id: item.id,
    userId: item.userId,
    productId: item.productId,
    quantity: item.quantity,
    variantId: item.variantId,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    product: item.product as Product,
    variant: item.variant as ProductVariant | undefined,
  })) as CartItem[]
}

export async function addToCart(userId: string, productId: string, quantity: number = 1, variantId: string | null = null): Promise<CartItem> {
  // Проверяем, есть ли уже этот товар с таким же вариантом в корзине
  const existing = await prisma.cartItem.findFirst({
    where: {
      userId,
      productId,
      variantId: variantId || null
    }
  })
  
  if (existing) {
    // Обновляем количество
    const updated = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
      include: {
        product: true,
        variant: true
      }
    })
    
    return {
      id: updated.id,
      userId: updated.userId,
      productId: updated.productId,
      quantity: updated.quantity,
      variantId: updated.variantId,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      product: updated.product as Product,
      variant: updated.variant as ProductVariant | undefined,
    } as CartItem
  } else {
    // Создаем новую запись
    const id = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newItem = await prisma.cartItem.create({
      data: {
        id,
        userId,
        productId,
        quantity,
        variantId: variantId || null
      },
      include: {
        product: true,
        variant: true
      }
    })
    
    return {
      id: newItem.id,
      userId: newItem.userId,
      productId: newItem.productId,
      quantity: newItem.quantity,
      variantId: newItem.variantId,
      createdAt: newItem.createdAt,
      updatedAt: newItem.updatedAt,
      product: newItem.product as Product,
      variant: newItem.variant as ProductVariant | undefined,
    } as CartItem
  }
}

export async function updateCartItem(cartItemId: string, quantity: number): Promise<CartItem> {
  const updated = await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
    include: {
      product: true,
      variant: true
    }
  })
  
  return {
    id: updated.id,
    userId: updated.userId,
    productId: updated.productId,
    quantity: updated.quantity,
    variantId: updated.variantId,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
    product: updated.product as Product,
    variant: updated.variant as ProductVariant | undefined,
  } as CartItem
}

export async function deleteCartItem(cartItemId: string): Promise<void> {
  await prisma.cartItem.delete({
    where: { id: cartItemId }
  })
}

export async function clearCart(userId: string): Promise<void> {
  await prisma.cartItem.deleteMany({
    where: { userId }
  })
}

export async function findOrders(userId?: string, admin: boolean = false): Promise<Order[]> {
  const where: any = {}
  
  if (!admin && userId) {
    where.userId = userId
  }
  
  const orders = await prisma.order.findMany({
    where,
    include: {
      user: {
        select: {
          email: true,
          name: true
        }
      },
      orderItems: {
        select: {
          id: true,
          orderId: true,
          productId: true,
          variantId: true,
          quantity: true,
          price: true,
          product: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: admin ? undefined : 100 // Ограничиваем для обычных пользователей
  })
  
  return orders.map(order => ({
    id: order.id,
    userId: order.userId,
    total: order.total,
    status: order.status,
    shippingAddress: order.shippingAddress,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    user: {
      email: order.user.email,
      name: order.user.name,
    },
    orderItems: order.orderItems.map(item => ({
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      variantId: item.variantId,
      variantName: item.variantName,
      createdAt: item.createdAt,
      product: {
        name: item.product.name,
      },
    })),
  })) as any
}

export async function createOrder(data: {
  userId: string
  total: number
  shippingAddress: string
  cartItems: Array<{ productId: string; variantId?: string | null; quantity: number; price: number }>
  promoCodeId?: string | null
  discountAmount?: number
  subtotal?: number
  addressId?: string | null
  shippingMethodId?: string | null
  shippingCost?: number
  comment?: string | null
  paymentMethod?: string
}): Promise<any> {
  const subtotal = data.subtotal || data.total
  const discountAmount = data.discountAmount || 0
  const total = data.total
  const shippingCost = data.shippingCost || 0
  
  // Создаем заказ с транзакцией
  const order = await prisma.$transaction(async (tx) => {
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Получаем названия вариантов для элементов заказа
    const variantNames = new Map<string, string>()
    for (const item of data.cartItems) {
      if (item.variantId) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          select: { name: true, value: true }
        })
        if (variant) {
          variantNames.set(item.variantId, `${variant.name}: ${variant.value}`)
        }
      }
    }
    
    // Создаем заказ
    const newOrder = await tx.order.create({
      data: {
        id: orderId,
        userId: data.userId,
        subtotal,
        discountAmount,
        total,
        shippingAddress: data.shippingAddress,
        status: 'PENDING',
        promoCodeId: data.promoCodeId || null,
        addressId: data.addressId || null,
        shippingMethodId: data.shippingMethodId || null,
        shippingCost,
        comment: data.comment || null,
        paymentMethod: data.paymentMethod || 'CASH',
        orderItems: {
          create: data.cartItems.map(item => ({
            id: `orderitem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            productId: item.productId,
            variantId: item.variantId || null,
            variantName: item.variantId ? variantNames.get(item.variantId) || null : null,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    })
    
    // Увеличиваем счетчик использования промокода
    if (data.promoCodeId) {
      await tx.promoCode.update({
        where: { id: data.promoCodeId },
        data: {
          usedCount: { increment: 1 }
        }
      })
    }
    
    // Очищаем корзину
    await tx.cartItem.deleteMany({
      where: { userId: data.userId }
    })
    
    return newOrder
  })
  
  // Получаем созданный заказ с полной информацией
  return await findOrderById(order.id)
}

export async function findOrderById(orderId: string, userId?: string): Promise<any | null> {
  const where: any = { id: orderId }
  if (userId) {
    where.userId = userId
  }
  
  const order = await prisma.order.findFirst({
    where,
    include: {
      user: {
        select: {
          email: true,
          name: true
        }
      },
      orderItems: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          variant: {
            select: {
              id: true,
              name: true,
              value: true
            }
          }
        }
      }
    }
  })
  
  if (!order) {
    return null
  }
  
  return {
    id: order.id,
    userId: order.userId,
    total: order.total,
    status: order.status,
    shippingAddress: order.shippingAddress,
    shippingCost: order.shippingCost || 0,
    paymentMethod: order.paymentMethod || 'cash',
    comment: order.comment,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    user: {
      email: order.user.email,
      name: order.user.name,
    },
    orderItems: order.orderItems.map(item => ({
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      price: item.price,
      createdAt: item.createdAt,
      product: {
        id: item.product.id,
        name: item.product.name,
        image: item.product.image,
      },
      variant: item.variant ? {
        id: item.variant.id,
        name: item.variant.name,
        value: item.variant.value,
      } : null,
    })),
  }
}

export async function updateOrderStatus(orderId: string, status: string): Promise<any> {
  await prisma.order.update({
    where: { id: orderId },
    data: { status }
  })
  
  const order = await findOrderById(orderId)
  return order!
}

// ==================== ПРОМОКОДЫ ====================

export interface PromoCode {
  id: string
  code: string
  description: string | null
  discountType: 'PERCENTAGE' | 'FIXED'
  discountValue: number
  minPurchaseAmount: number | null
  maxDiscountAmount: number | null
  usageLimit: number | null
  usedCount: number
  validFrom: Date
  validUntil: Date | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export async function findPromoCodeByCode(code: string): Promise<PromoCode | null> {
  try {
    const promo = await prisma.promoCode.findFirst({
      where: {
        code: code.toUpperCase(),
        isActive: true
      }
    })
    
    if (!promo) return null
    
    // Проверяем валидность по датам
    const now = new Date()
    const validFrom = new Date(promo.validFrom)
    const validUntil = promo.validUntil ? new Date(promo.validUntil) : null
    
    if (now < validFrom) return null
    if (validUntil && now > validUntil) return null
    
    // Проверяем лимит использования
    if (promo.usageLimit !== null && promo.usedCount >= promo.usageLimit) return null
    
    return promo as PromoCode
  } catch (error) {
    console.error('Database error in findPromoCodeByCode:', error)
    throw error
  }
}

export async function calculateDiscount(promoCode: PromoCode, subtotal: number): Promise<number> {
  // Проверяем минимальную сумму покупки
  if (promoCode.minPurchaseAmount && subtotal < promoCode.minPurchaseAmount) {
    return 0
  }
  
  let discount = 0
  
  if (promoCode.discountType === 'PERCENTAGE') {
    discount = (subtotal * promoCode.discountValue) / 100
    // Применяем максимальную скидку если указана
    if (promoCode.maxDiscountAmount && discount > promoCode.maxDiscountAmount) {
      discount = promoCode.maxDiscountAmount
    }
  } else {
    discount = promoCode.discountValue
    // Скидка не может быть больше суммы покупки
    if (discount > subtotal) {
      discount = subtotal
    }
  }
  
  return Math.round(discount * 100) / 100
}

// Функция incrementPromoCodeUsage удалена как неиспользуемая

export async function findPromoCodes(activeOnly: boolean = true): Promise<PromoCode[]> {
  try {
    const promoCodes = await prisma.promoCode.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { createdAt: 'desc' }
    })
    return promoCodes as PromoCode[]
  } catch (error) {
    console.error('Database error in findPromoCodes:', error)
    throw error
  }
}

export async function createPromoCode(data: {
  code: string
  description?: string | null
  discountType: 'PERCENTAGE' | 'FIXED'
  discountValue: number
  minPurchaseAmount?: number | null
  maxDiscountAmount?: number | null
  usageLimit?: number | null
  validFrom?: Date
  validUntil?: Date | null
}): Promise<PromoCode> {
  const id = `promo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  return await prisma.promoCode.create({
    data: {
      id,
      code: data.code.toUpperCase(),
      description: data.description || null,
      discountType: data.discountType,
      discountValue: data.discountValue,
      minPurchaseAmount: data.minPurchaseAmount || null,
      maxDiscountAmount: data.maxDiscountAmount || null,
      usageLimit: data.usageLimit || null,
      validFrom: data.validFrom || new Date(),
      validUntil: data.validUntil || null,
    }
  }) as PromoCode
}

// ==================== ИЗБРАННОЕ ====================

export interface WishlistItem {
  id: string
  userId: string
  productId: string
  createdAt: Date
  product?: Product
}

export async function findWishlistItems(userId: string): Promise<WishlistItem[]> {
  try {
    const items = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return items.map(item => ({
      id: item.id,
      userId: item.userId,
      productId: item.productId,
      createdAt: item.createdAt,
      product: item.product as Product,
    })) as WishlistItem[]
  } catch (error) {
    console.error('Database error in findWishlistItems:', error)
    throw error
  }
}

export async function addToWishlist(userId: string, productId: string): Promise<WishlistItem> {
  try {
    // Проверяем, не существует ли уже
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    })
    
    if (existing) {
      const item = await prisma.wishlist.findUnique({
        where: { id: existing.id },
        include: { product: true }
      })
      return {
        id: item!.id,
        userId: item!.userId,
        productId: item!.productId,
        createdAt: item!.createdAt,
        product: item!.product as Product,
      } as WishlistItem
    }
    
    const id = `wish_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const newItem = await prisma.wishlist.create({
      data: {
        id,
        userId,
        productId
      },
      include: {
        product: true
      }
    })
    
    return {
      id: newItem.id,
      userId: newItem.userId,
      productId: newItem.productId,
      createdAt: newItem.createdAt,
      product: newItem.product as Product,
    } as WishlistItem
  } catch (error) {
    console.error('Database error in addToWishlist:', error)
    throw error
  }
}

export async function removeFromWishlist(userId: string, productId: string): Promise<void> {
  await prisma.wishlist.deleteMany({
    where: {
      userId,
      productId
    }
  })
}

// Функция isInWishlist удалена как неиспользуемая (используется прямой запрос через API)

// ==================== ОТЗЫВЫ ====================

export interface Review {
  id: string
  userId: string
  productId: string
  rating: number
  comment: string | null
  createdAt: Date
  updatedAt: Date
  user?: {
    id: string
    name: string | null
    email: string
  }
}

export async function findReviewsByProductId(productId: string): Promise<Review[]> {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return reviews.map(review => ({
      id: review.id,
      userId: review.userId,
      productId: review.productId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      user: {
        id: review.user.id,
        name: review.user.name,
        email: review.user.email,
      },
    })) as Review[]
  } catch (error) {
    console.error('Database error in findReviewsByProductId:', error)
    throw error
  }
}

export async function getProductRating(productId: string): Promise<{ average: number; count: number }> {
  try {
    const result = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { id: true }
    })
    
    return {
      average: result._avg.rating ? parseFloat(result._avg.rating.toFixed(2)) : 0,
      count: result._count.id || 0,
    }
  } catch (error) {
    console.error('Database error in getProductRating:', error)
    return { average: 0, count: 0 }
  }
}

export async function createReview(data: {
  userId: string
  productId: string
  rating: number
  comment?: string | null
}): Promise<Review> {
  if (data.rating < 1 || data.rating > 5) {
    throw new Error('Rating must be between 1 and 5')
  }
  
  // Проверяем, не существует ли уже отзыв от этого пользователя
  const existing = await prisma.review.findFirst({
    where: {
      userId: data.userId,
      productId: data.productId
    }
  })
  
  let review
  
  if (existing) {
    // Обновляем существующий отзыв
    review = await prisma.review.update({
      where: { id: existing.id },
      data: {
        rating: data.rating,
        comment: data.comment || null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
  } else {
    // Создаем новый отзыв
    const id = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    review = await prisma.review.create({
      data: {
        id,
        userId: data.userId,
        productId: data.productId,
        rating: data.rating,
        comment: data.comment || null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
  }
  
  return {
    id: review.id,
    userId: review.userId,
    productId: review.productId,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
    user: {
      id: review.user.id,
      name: review.user.name,
      email: review.user.email,
    },
  } as Review
}

export async function deleteReview(reviewId: string, userId: string): Promise<void> {
  await prisma.review.deleteMany({
    where: {
      id: reviewId,
      userId: userId
    }
  })
}

// ==================== ВАРИАНТЫ ТОВАРОВ ====================

export async function findProductVariants(productId: string): Promise<ProductVariant[]> {
  try {
    return await prisma.productVariant.findMany({
      where: { productId },
      orderBy: [
        { name: 'asc' },
        { value: 'asc' }
      ]
    }) as ProductVariant[]
  } catch (error) {
    console.error('Database error in findProductVariants:', error)
    throw error
  }
}

export async function findProductVariantById(variantId: string): Promise<ProductVariant | null> {
  try {
    return await prisma.productVariant.findUnique({
      where: { id: variantId }
    }) as ProductVariant | null
  } catch (error) {
    console.error('Database error in findProductVariantById:', error)
    throw error
  }
}

export async function createProductVariant(data: {
  productId: string
  name: string
  value: string
  sku?: string | null
  price?: number | null
  stock: number
  image?: string | null
}): Promise<ProductVariant> {
  const id = `variant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  return await prisma.productVariant.create({
    data: {
      id,
      productId: data.productId,
      name: data.name,
      value: data.value,
      sku: data.sku || null,
      price: data.price || null,
      stock: data.stock,
      image: data.image || null
    }
  }) as ProductVariant
}

// ==================== ГАЛЕРЕЯ ИЗОБРАЖЕНИЙ ====================

export async function findProductImages(productId: string): Promise<ProductImage[]> {
  try {
    return await prisma.productImage.findMany({
      where: { productId },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'asc' }
      ]
    }) as ProductImage[]
  } catch (error) {
    console.error('Database error in findProductImages:', error)
    throw error
  }
}

export async function createProductImage(data: {
  productId: string
  url: string
  alt?: string | null
  order?: number
  isPrimary?: boolean
}): Promise<ProductImage> {
  const id = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  // Если это первичное изображение, снимаем флаг с других
  if (data.isPrimary) {
    await prisma.productImage.updateMany({
      where: { productId: data.productId },
      data: { isPrimary: false }
    })
  }
  
  return await prisma.productImage.create({
    data: {
      id,
      productId: data.productId,
      url: data.url,
      alt: data.alt || null,
      order: data.order || 0,
      isPrimary: data.isPrimary || false
    }
  }) as ProductImage
}

// ==================== АТРИБУТЫ ТОВАРА ====================

export async function findProductAttributes(productId: string): Promise<ProductAttribute[]> {
  try {
    return await prisma.productAttribute.findMany({
      where: { productId },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'asc' }
      ]
    }) as ProductAttribute[]
  } catch (error) {
    console.error('Database error in findProductAttributes:', error)
    throw error
  }
}

export async function createProductAttribute(data: {
  productId: string
  name: string
  value: string
  order?: number
}): Promise<ProductAttribute> {
  const id = `attr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  return await prisma.productAttribute.create({
    data: {
      id,
      productId: data.productId,
      name: data.name,
      value: data.value,
      order: data.order || 0
    }
  }) as ProductAttribute
}

// ==================== АДРЕСНАЯ КНИГА ====================

export async function findUserAddresses(userId: string): Promise<Address[]> {
  try {
    return await prisma.address.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    }) as Address[]
  } catch (error) {
    console.error('Database error in findUserAddresses:', error)
    throw error
  }
}

export async function findAddressById(addressId: string, userId: string): Promise<Address | null> {
  try {
    return await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: userId
      }
    }) as Address | null
  } catch (error) {
    console.error('Database error in findAddressById:', error)
    throw error
  }
}

export async function createAddress(data: {
  userId: string
  type: 'SHIPPING' | 'BILLING' | 'BOTH'
  firstName: string
  lastName: string
  phone?: string | null
  country: string
  region?: string | null
  city: string
  postalCode?: string | null
  street: string
  isDefault?: boolean
}): Promise<Address> {
  const id = `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  // Если это адрес по умолчанию, снимаем флаг с других адресов того же типа
  if (data.isDefault) {
    await prisma.address.updateMany({
      where: {
        userId: data.userId,
        type: data.type
      },
      data: { isDefault: false }
    })
  }
  
  return await prisma.address.create({
    data: {
      id,
      userId: data.userId,
      type: data.type,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone || null,
      country: data.country,
      region: data.region || null,
      city: data.city,
      postalCode: data.postalCode || null,
      street: data.street,
      isDefault: data.isDefault || false
    }
  }) as Address
}

export async function updateAddress(addressId: string, userId: string, data: Partial<Address>): Promise<Address> {
  // Проверяем, что адрес принадлежит пользователю
  const existing = await prisma.address.findFirst({
    where: { id: addressId, userId }
  })

  if (!existing) {
    throw new Error('Address not found')
  }

  const updateData: any = {}

  if (data.firstName !== undefined) updateData.firstName = data.firstName
  if (data.lastName !== undefined) updateData.lastName = data.lastName
  if (data.phone !== undefined) updateData.phone = data.phone
  if (data.country !== undefined) updateData.country = data.country
  if (data.region !== undefined) updateData.region = data.region
  if (data.city !== undefined) updateData.city = data.city
  if (data.postalCode !== undefined) updateData.postalCode = data.postalCode
  if (data.street !== undefined) updateData.street = data.street

  if (data.isDefault !== undefined) {
    if (data.isDefault) {
      // Снимаем флаг с других адресов этого же типа
      await prisma.address.updateMany({
        where: {
          userId,
          type: existing.type,
          id: { not: addressId }
        },
        data: { isDefault: false }
      })
    }
    updateData.isDefault = data.isDefault
  }

  if (Object.keys(updateData).length === 0) {
    throw new Error('No fields to update')
  }

  return await prisma.address.update({
    where: { id: addressId },
    data: updateData
  }) as Address
}

export async function deleteAddress(addressId: string, userId: string): Promise<void> {
  await prisma.address.deleteMany({
    where: {
      id: addressId,
      userId: userId
    }
  })
}

// ==================== СПОСОБЫ ДОСТАВКИ ====================

export async function findShippingMethods(activeOnly: boolean = true): Promise<ShippingMethod[]> {
  try {
    return await prisma.shippingMethod.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }
      ]
    }) as ShippingMethod[]
  } catch (error) {
    console.error('Database error in findShippingMethods:', error)
    throw error
  }
}

export async function findShippingMethodById(id: string): Promise<ShippingMethod | null> {
  try {
    return await prisma.shippingMethod.findUnique({
      where: { id }
    }) as ShippingMethod | null
  } catch (error) {
    console.error('Database error in findShippingMethodById:', error)
    throw error
  }
}

export async function calculateShippingCost(methodId: string, orderTotal: number): Promise<number> {
  const method = await findShippingMethodById(methodId)
  if (!method) return 0
  
  // Если есть порог бесплатной доставки и сумма заказа его превышает
  if (method.freeShippingThreshold && orderTotal >= method.freeShippingThreshold) {
    return 0
  }
  
  return method.price
}

// ==================== РЕЗЕРВИРОВАНИЕ ТОВАРОВ ====================

export async function reserveProducts(orderId: string, items: Array<{ productId: string; variantId?: string | null; quantity: number }>): Promise<ProductReservation[]> {
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 минут
  
  const reservations = await Promise.all(
    items.map(item => {
      const id = `reserve_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      return prisma.productReservation.create({
        data: {
          id,
          orderId,
          productId: item.productId,
          variantId: item.variantId || null,
          quantity: item.quantity,
          status: 'PENDING',
          expiresAt
        }
      })
    })
  )
  
  return reservations as ProductReservation[]
}

export async function confirmReservations(orderId: string): Promise<void> {
  // Обновляем статус резерваций
  await prisma.productReservation.updateMany({
    where: {
      orderId,
      status: 'PENDING'
    },
    data: {
      status: 'CONFIRMED'
    }
  })
  
  // Списываем товары со склада
  const reservations = await prisma.productReservation.findMany({
    where: {
      orderId,
      status: 'CONFIRMED'
    }
  })
  
  for (const res of reservations) {
    if (res.variantId) {
      await prisma.productVariant.update({
        where: { id: res.variantId },
        data: {
          stock: { decrement: res.quantity }
        }
      })
    } else {
      await prisma.product.update({
        where: { id: res.productId },
        data: {
          stock: { decrement: res.quantity }
        }
      })
    }
  }
}

// Функции releaseReservations и cleanupExpiredReservations удалены как неиспользуемые

// ==================== УВЕДОМЛЕНИЯ ====================

export async function createNotification(data: {
  userId: string
  type: 'ORDER' | 'SHIPMENT' | 'PAYMENT' | 'RETURN' | 'REVIEW' | 'SYSTEM'
  title: string
  message: string
  link?: string | null
}): Promise<Notification> {
  const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  return await prisma.notification.create({
    data: {
      id,
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link || null
    }
  }) as Notification
}

export async function findUserNotifications(userId: string, unreadOnly: boolean = false): Promise<Notification[]> {
  try {
    return await prisma.notification.findMany({
      where: unreadOnly
        ? { userId, read: false }
        : { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    }) as Notification[]
  } catch (error) {
    console.error('Database error in findUserNotifications:', error)
    throw error
  }
}

export async function markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId: userId
    },
    data: { read: true }
  })
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: {
      userId,
      read: false
    },
    data: { read: true }
  })
}

// Функция getUnreadNotificationCount удалена как неиспользуемая

// ==================== ВОЗВРАТЫ ====================

export async function createOrderReturn(data: {
  orderId: string
  userId: string
  reason?: string | null
  refundAmount: number
}): Promise<OrderReturn> {
  const id = `return_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  return await prisma.orderReturn.create({
    data: {
      id,
      orderId: data.orderId,
      userId: data.userId,
      reason: data.reason || null,
      refundAmount: data.refundAmount,
      status: 'PENDING',
      refundStatus: 'PENDING'
    }
  }) as OrderReturn
}

export async function findOrderReturns(userId?: string, admin: boolean = false): Promise<OrderReturn[]> {
  const where: any = {}
  
  if (!admin && userId) {
    where.userId = userId
  }
  
  const returns = await prisma.orderReturn.findMany({
    where,
    include: {
      order: {
        select: {
          id: true,
          total: true,
          status: true
        }
      },
      user: {
        select: {
          email: true,
          name: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
  
  return returns.map(ret => ({
    id: ret.id,
    orderId: ret.orderId,
    userId: ret.userId,
    reason: ret.reason,
    status: ret.status,
    refundAmount: ret.refundAmount,
    refundStatus: ret.refundStatus,
    adminComment: ret.adminComment,
    createdAt: ret.createdAt,
    updatedAt: ret.updatedAt,
    order: {
      id: ret.order.id,
      total: ret.order.total,
      status: ret.order.status,
    },
    user: {
      email: ret.user.email,
      name: ret.user.name,
    },
  })) as any[]
}

export async function findOrderReturnById(id: string, userId?: string): Promise<OrderReturn | null> {
  const where: any = { id }
  if (userId) {
    where.userId = userId
  }
  
  const return_ = await prisma.orderReturn.findFirst({
    where,
    include: {
      order: {
        select: {
          id: true,
          total: true,
          status: true
        }
      },
      user: {
        select: {
          email: true,
          name: true
        }
      }
    }
  })
  
  if (!return_) {
    return null
  }
  
  return {
    id: return_.id,
    orderId: return_.orderId,
    userId: return_.userId,
    reason: return_.reason,
    status: return_.status,
    refundAmount: return_.refundAmount,
    refundStatus: return_.refundStatus,
    adminComment: return_.adminComment,
    createdAt: return_.createdAt,
    updatedAt: return_.updatedAt,
    order: {
      id: return_.order.id,
      total: return_.order.total,
      status: return_.order.status,
    },
    user: {
      email: return_.user.email,
      name: return_.user.name,
    },
  } as any
}

export async function updateOrderReturnStatus(
  id: string,
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSING' | 'COMPLETED',
  adminComment?: string | null
): Promise<OrderReturn> {
  await prisma.orderReturn.update({
    where: { id },
    data: {
      status,
      adminComment: adminComment || null
    }
  })
  
  const return_ = await findOrderReturnById(id)
  if (!return_) {
    throw new Error('Return not found')
  }
  
  return return_
}

export async function updateOrderReturnRefundStatus(
  id: string,
  refundStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
): Promise<OrderReturn> {
  await prisma.orderReturn.update({
    where: { id },
    data: { refundStatus }
  })
  
  const return_ = await findOrderReturnById(id)
  if (!return_) {
    throw new Error('Return not found')
  }
  
  return return_
}

