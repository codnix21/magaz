import pool from './db'

// Типы для таблиц (из Prisma schema)
export interface User {
  id: string
  email: string
  name: string | null
  password: string
  role: string
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
  const [rows] = await pool.execute(
    'SELECT * FROM User WHERE email = ?',
    [email]
  ) as any[]
  return rows[0] || null
}

export async function findUserById(id: string): Promise<User | null> {
  const [rows] = await pool.execute(
    'SELECT * FROM User WHERE id = ?',
    [id]
  ) as any[]
  return rows[0] || null
}

export async function createUser(data: {
  email: string
  password: string
  name?: string
  role?: string
}): Promise<User> {
  const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  await pool.execute(
    'INSERT INTO User (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
    [id, data.email, data.password, data.name || null, data.role || 'USER']
  )
  
  const [rows] = await pool.execute(
    'SELECT * FROM User WHERE id = ?',
    [id]
  ) as any[]
  
  return rows[0]
}

export async function findProducts(filters?: {
  category?: string
  search?: string
  limit?: number
}): Promise<Product[]> {
  try {
    let sql = 'SELECT * FROM Product WHERE 1=1'
    const params: any[] = []
    
    if (filters?.category) {
      sql += ' AND category = ?'
      params.push(filters.category)
    }
    
    if (filters?.search) {
      sql += ' AND (name LIKE ? OR description LIKE ?)'
      const searchTerm = `%${filters.search}%`
      params.push(searchTerm, searchTerm)
    }
    
    sql += ' ORDER BY createdAt DESC'
    
    if (filters?.limit) {
      // LIMIT не может быть параметром в MySQL, нужно вставлять число напрямую
      sql += ` LIMIT ${parseInt(filters.limit.toString())}`
    }
    
    const [rows] = await pool.execute(sql, params) as any[]
    return rows
  } catch (error: any) {
    console.error('Database error in findProducts:', error)
    throw error
  }
}

export async function findProductById(id: string): Promise<Product | null> {
  const [rows] = await pool.execute(
    'SELECT * FROM Product WHERE id = ?',
    [id]
  ) as any[]
  return rows[0] || null
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
  await pool.execute(
    'INSERT INTO Product (id, name, description, price, image, category, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, data.name, data.description, data.price, data.image, data.category, data.stock]
  )
  
  const product = await findProductById(id)
  return product!
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  const updates: string[] = []
  const params: any[] = []
  
  if (data.name !== undefined) {
    updates.push('name = ?')
    params.push(data.name)
  }
  if (data.description !== undefined) {
    updates.push('description = ?')
    params.push(data.description)
  }
  if (data.price !== undefined) {
    updates.push('price = ?')
    params.push(data.price)
  }
  if (data.image !== undefined) {
    updates.push('image = ?')
    params.push(data.image)
  }
  if (data.category !== undefined) {
    updates.push('category = ?')
    params.push(data.category)
  }
  if (data.stock !== undefined) {
    updates.push('stock = ?')
    params.push(data.stock)
  }
  
  if (updates.length > 0) {
    const updateParams = [...params, id]
    await pool.execute(
      `UPDATE Product SET ${updates.join(', ')} WHERE id = ?`,
      updateParams
    )
  }
  
  const product = await findProductById(id)
  if (!product) {
    throw new Error('Product not found')
  }
  return product
}

export async function deleteProduct(id: string): Promise<void> {
  await pool.execute('DELETE FROM Product WHERE id = ?', [id])
}

export async function findCartItems(userId: string): Promise<CartItem[]> {
  const [rows] = await pool.execute(
    `SELECT ci.*, p.id as p_id, p.name as p_name, p.price as p_price, 
            p.image as p_image, p.category as p_category, p.stock as p_stock,
            p.description as p_description, p.discountPercent, p.originalPrice,
            p.createdAt as p_createdAt, p.updatedAt as p_updatedAt,
            v.id as variant_id, v.name as variant_name, v.value as variant_value, 
            v.price as variant_price, v.stock as variant_stock, v.image as variant_image,
            v.createdAt as variant_createdAt, v.updatedAt as variant_updatedAt
     FROM CartItem ci
     JOIN Product p ON ci.productId = p.id
     LEFT JOIN ProductVariant v ON ci.variantId = v.id
     WHERE ci.userId = ?
     ORDER BY ci.createdAt DESC`,
    [userId]
  ) as any[]
  
  // Преобразуем результат в нужный формат
  return rows.map(row => ({
    id: row.id,
    userId: row.userId,
    productId: row.productId,
    quantity: row.quantity,
    variantId: row.variantId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    product: {
      id: row.p_id,
      name: row.p_name,
      price: row.p_price,
      image: row.p_image,
      category: row.p_category,
      stock: row.p_stock,
      description: row.p_description,
      discountPercent: row.discountPercent || 0,
      originalPrice: row.originalPrice,
      createdAt: row.p_createdAt,
      updatedAt: row.p_updatedAt,
    },
    variant: row.variant_id ? {
      id: row.variant_id,
      productId: row.productId,
      name: row.variant_name,
      value: row.variant_value,
      price: row.variant_price,
      stock: row.variant_stock,
      image: row.variant_image,
      createdAt: row.variant_createdAt,
      updatedAt: row.variant_updatedAt,
    } : undefined,
  }))
}

export async function addToCart(userId: string, productId: string, quantity: number = 1, variantId: string | null = null): Promise<CartItem> {
  // Проверяем, есть ли уже этот товар с таким же вариантом в корзине
  const [existing] = await pool.execute(
    'SELECT * FROM CartItem WHERE userId = ? AND productId = ? AND (variantId = ? OR (variantId IS NULL AND ? IS NULL))',
    [userId, productId, variantId, variantId]
  ) as any[]
  
  if (existing[0]) {
    // Обновляем количество
    await pool.execute(
      'UPDATE CartItem SET quantity = quantity + ? WHERE id = ?',
      [quantity, existing[0].id]
    )
    const items = await findCartItems(userId)
    return items.find(item => item.id === existing[0].id)!
  } else {
    // Создаем новую запись
    const id = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    await pool.execute(
      'INSERT INTO CartItem (id, userId, productId, quantity, variantId) VALUES (?, ?, ?, ?, ?)',
      [id, userId, productId, quantity, variantId]
    )
    const items = await findCartItems(userId)
    return items.find(item => item.id === id)!
  }
}

export async function updateCartItem(cartItemId: string, quantity: number): Promise<CartItem> {
  await pool.execute(
    'UPDATE CartItem SET quantity = ? WHERE id = ?',
    [quantity, cartItemId]
  )
  
  const [rows] = await pool.execute(
    'SELECT * FROM CartItem WHERE id = ?',
    [cartItemId]
  ) as any[]
  
  const items = await findCartItems(rows[0].userId)
  return items.find(item => item.id === cartItemId)!
}

export async function deleteCartItem(cartItemId: string): Promise<void> {
  await pool.execute('DELETE FROM CartItem WHERE id = ?', [cartItemId])
}

export async function clearCart(userId: string): Promise<void> {
  await pool.execute('DELETE FROM CartItem WHERE userId = ?', [userId])
}

export async function findOrders(userId?: string, admin: boolean = false): Promise<Order[]> {
  let sql = `SELECT o.*, 
                    u.email as 'user.email', u.name as 'user.name'
             FROM \`Order\` o
             JOIN User u ON o.userId = u.id
             WHERE 1=1`
  const params: any[] = []
  
  if (!admin && userId) {
    sql += ' AND o.userId = ?'
    params.push(userId)
  }
  
  sql += ' ORDER BY o.createdAt DESC'
  
  const [rows] = await pool.execute(sql, params) as any[]
  
  // Получаем orderItems для каждого заказа
  const orders = await Promise.all(rows.map(async (row: any) => {
    const [items] = await pool.execute(
      `SELECT oi.*, p.name as 'product.name'
       FROM OrderItem oi
       JOIN Product p ON oi.productId = p.id
       WHERE oi.orderId = ?`,
      [row.id]
    ) as any[]
    
    return {
      id: row.id,
      userId: row.userId,
      total: row.total,
      status: row.status,
      shippingAddress: row.shippingAddress,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      user: {
        email: row['user.email'],
        name: row['user.name'],
      },
      orderItems: items.map((item: any) => ({
        id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        createdAt: item.createdAt,
        product: {
          name: item['product.name'],
        },
      })),
    }
  }))
  
  return orders as any
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
  const connection = await pool.getConnection()
  await connection.beginTransaction()
  
  try {
    const subtotal = data.subtotal || data.total
    const discountAmount = data.discountAmount || 0
    const total = data.total
    const shippingCost = data.shippingCost || 0
    
    // Создаем заказ
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    await connection.execute(
      'INSERT INTO `Order` (id, userId, subtotal, discountAmount, total, shippingAddress, status, promoCodeId, addressId, shippingMethodId, shippingCost, comment, paymentMethod) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        orderId, 
        data.userId, 
        subtotal, 
        discountAmount, 
        total, 
        data.shippingAddress, 
        'PENDING', 
        data.promoCodeId || null,
        data.addressId || null,
        data.shippingMethodId || null,
        shippingCost,
        data.comment || null,
        data.paymentMethod || 'CASH'
      ]
    )
    
    // Увеличиваем счетчик использования промокода, если он был использован
    if (data.promoCodeId) {
      await connection.execute(
        'UPDATE PromoCode SET usedCount = usedCount + 1 WHERE id = ?',
        [data.promoCodeId]
      )
    }
    
    // Создаем элементы заказа
    for (const item of data.cartItems) {
      const itemId = `orderitem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Получаем название варианта, если есть
      let variantName = null
      if (item.variantId) {
        const [variantRows] = await connection.execute(
          'SELECT name, value FROM ProductVariant WHERE id = ?',
          [item.variantId]
        ) as any[]
        if (variantRows[0]) {
          variantName = `${variantRows[0].name}: ${variantRows[0].value}`
        }
      }
      
      await connection.execute(
        'INSERT INTO OrderItem (id, orderId, productId, variantId, variantName, quantity, price) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [itemId, orderId, item.productId, item.variantId || null, variantName, item.quantity, item.price]
      )
    }
    
    // Очищаем корзину
    await connection.execute('DELETE FROM CartItem WHERE userId = ?', [data.userId])
    
    await connection.commit()
    connection.release()
    
    // Получаем созданный заказ
    const order = await findOrderById(orderId)
    if (!order) {
      throw new Error('Failed to retrieve created order')
    }
    return order
  } catch (error) {
    await connection.rollback()
    connection.release()
    throw error
  }
}

export async function findOrderById(orderId: string, userId?: string): Promise<any | null> {
  let sql = `SELECT o.*, 
                    u.email as 'user.email', u.name as 'user.name'
             FROM \`Order\` o
             JOIN User u ON o.userId = u.id
             WHERE o.id = ?`
  const params: any[] = [orderId]
  
  if (userId) {
    sql += ' AND o.userId = ?'
    params.push(userId)
  }
  
  const [rows] = await pool.execute(sql, params) as any[]
  
  if (rows.length === 0) {
    return null
  }
  
  const row = rows[0]
  
  // Получаем orderItems
  const [items] = await pool.execute(
    `SELECT oi.*, p.name as 'product.name'
     FROM OrderItem oi
     JOIN Product p ON oi.productId = p.id
     WHERE oi.orderId = ?`,
    [orderId]
  ) as any[]
  
  return {
    id: row.id,
    userId: row.userId,
    total: row.total,
    status: row.status,
    shippingAddress: row.shippingAddress,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    user: {
      email: row['user.email'],
      name: row['user.name'],
    },
    orderItems: items.map((item: any) => ({
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      createdAt: item.createdAt,
      product: {
        name: item['product.name'],
      },
    })),
  }
}

export async function updateOrderStatus(orderId: string, status: string): Promise<any> {
  await pool.execute(
    'UPDATE `Order` SET status = ? WHERE id = ?',
    [status, orderId]
  )
  
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
    const [rows] = await pool.execute(
      'SELECT * FROM PromoCode WHERE code = ? AND isActive = true',
      [code]
    ) as any[]
    
    if (rows.length === 0) return null
    
    const promo = rows[0]
    
    // Проверяем валидность по датам
    const now = new Date()
    const validFrom = new Date(promo.validFrom)
    const validUntil = promo.validUntil ? new Date(promo.validUntil) : null
    
    if (now < validFrom) return null
    if (validUntil && now > validUntil) return null
    
    // Проверяем лимит использования
    if (promo.usageLimit !== null && promo.usedCount >= promo.usageLimit) return null
    
    return promo
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

export async function incrementPromoCodeUsage(promoCodeId: string): Promise<void> {
  await pool.execute(
    'UPDATE PromoCode SET usedCount = usedCount + 1 WHERE id = ?',
    [promoCodeId]
  )
}

export async function findPromoCodes(activeOnly: boolean = true): Promise<PromoCode[]> {
  try {
    const sql = activeOnly 
      ? 'SELECT * FROM PromoCode WHERE isActive = true ORDER BY createdAt DESC'
      : 'SELECT * FROM PromoCode ORDER BY createdAt DESC'
    
    const [rows] = await pool.execute(sql) as any[]
    return rows
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
  
  await pool.execute(
    'INSERT INTO PromoCode (id, code, description, discountType, discountValue, minPurchaseAmount, maxDiscountAmount, usageLimit, validFrom, validUntil) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      id,
      data.code.toUpperCase(),
      data.description || null,
      data.discountType,
      data.discountValue,
      data.minPurchaseAmount || null,
      data.maxDiscountAmount || null,
      data.usageLimit || null,
      data.validFrom || new Date(),
      data.validUntil || null,
    ]
  )
  
  const [rows] = await pool.execute(
    'SELECT * FROM PromoCode WHERE id = ?',
    [id]
  ) as any[]
  
  return rows[0]
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
    const [rows] = await pool.execute(
      `SELECT w.*, p.id as product_id, p.name, p.description, p.price, p.image, p.category, p.stock, 
              p.discountPercent, p.originalPrice, p.createdAt as product_createdAt, p.updatedAt as product_updatedAt
       FROM Wishlist w
       INNER JOIN Product p ON w.productId = p.id
       WHERE w.userId = ?
       ORDER BY w.createdAt DESC`,
      [userId]
    ) as any[]
    
    return rows.map((row: any) => ({
      id: row.id,
      userId: row.userId,
      productId: row.productId,
      createdAt: row.createdAt,
      product: {
        id: row.product_id,
        name: row.name,
        description: row.description,
        price: row.price,
        image: row.image,
        category: row.category,
        stock: row.stock,
        discountPercent: row.discountPercent || 0,
        originalPrice: row.originalPrice,
        createdAt: row.product_createdAt,
        updatedAt: row.product_updatedAt,
      },
    }))
  } catch (error) {
    console.error('Database error in findWishlistItems:', error)
    throw error
  }
}

export async function addToWishlist(userId: string, productId: string): Promise<WishlistItem> {
  try {
    // Проверяем, не существует ли уже
    const [existing] = await pool.execute(
      'SELECT * FROM Wishlist WHERE userId = ? AND productId = ?',
      [userId, productId]
    ) as any[]
    
    if (existing.length > 0) {
      return existing[0]
    }
    
    const id = `wish_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    await pool.execute(
      'INSERT INTO Wishlist (id, userId, productId) VALUES (?, ?, ?)',
      [id, userId, productId]
    )
    
    const [rows] = await pool.execute(
      'SELECT * FROM Wishlist WHERE id = ?',
      [id]
    ) as any[]
    
    return rows[0]
  } catch (error) {
    console.error('Database error in addToWishlist:', error)
    throw error
  }
}

export async function removeFromWishlist(userId: string, productId: string): Promise<void> {
  await pool.execute(
    'DELETE FROM Wishlist WHERE userId = ? AND productId = ?',
    [userId, productId]
  )
}

export async function isInWishlist(userId: string, productId: string): Promise<boolean> {
  const [rows] = await pool.execute(
    'SELECT COUNT(*) as count FROM Wishlist WHERE userId = ? AND productId = ?',
    [userId, productId]
  ) as any[]
  
  return rows[0]?.count > 0
}

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
    const [rows] = await pool.execute(
      `SELECT r.*, u.name, u.email
       FROM Review r
       INNER JOIN User u ON r.userId = u.id
       WHERE r.productId = ?
       ORDER BY r.createdAt DESC`,
      [productId]
    ) as any[]
    
    return rows.map((row: any) => ({
      id: row.id,
      userId: row.userId,
      productId: row.productId,
      rating: row.rating,
      comment: row.comment,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      user: {
        id: row.userId,
        name: row.name,
        email: row.email,
      },
    }))
  } catch (error) {
    console.error('Database error in findReviewsByProductId:', error)
    throw error
  }
}

export async function getProductRating(productId: string): Promise<{ average: number; count: number }> {
  try {
    const [rows] = await pool.execute(
      'SELECT AVG(rating) as average, COUNT(*) as count FROM Review WHERE productId = ?',
      [productId]
    ) as any[]
    
    return {
      average: rows[0]?.average ? parseFloat(rows[0].average.toFixed(2)) : 0,
      count: rows[0]?.count || 0,
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
  const [existing] = await pool.execute(
    'SELECT * FROM Review WHERE userId = ? AND productId = ?',
    [data.userId, data.productId]
  ) as any[]
  
  let id: string
  
  if (existing.length > 0) {
    // Обновляем существующий отзыв
    id = existing[0].id
    await pool.execute(
      'UPDATE Review SET rating = ?, comment = ?, updatedAt = NOW() WHERE id = ?',
      [data.rating, data.comment || null, id]
    )
  } else {
    // Создаем новый отзыв
    id = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    await pool.execute(
      'INSERT INTO Review (id, userId, productId, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [id, data.userId, data.productId, data.rating, data.comment || null]
    )
  }
  
  const [rows] = await pool.execute(
    `SELECT r.*, u.name, u.email
     FROM Review r
     INNER JOIN User u ON r.userId = u.id
     WHERE r.id = ?`,
    [id]
  ) as any[]
  
  return {
    id: rows[0].id,
    userId: rows[0].userId,
    productId: rows[0].productId,
    rating: rows[0].rating,
    comment: rows[0].comment,
    createdAt: rows[0].createdAt,
    updatedAt: rows[0].updatedAt,
    user: {
      id: rows[0].userId,
      name: rows[0].name,
      email: rows[0].email,
    },
  }
}

export async function deleteReview(reviewId: string, userId: string): Promise<void> {
  await pool.execute(
    'DELETE FROM Review WHERE id = ? AND userId = ?',
    [reviewId, userId]
  )
}

// ==================== ВАРИАНТЫ ТОВАРОВ ====================

export async function findProductVariants(productId: string): Promise<ProductVariant[]> {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM ProductVariant WHERE productId = ? ORDER BY name, value',
      [productId]
    ) as any[]
    return rows
  } catch (error) {
    console.error('Database error in findProductVariants:', error)
    throw error
  }
}

export async function findProductVariantById(variantId: string): Promise<ProductVariant | null> {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM ProductVariant WHERE id = ?',
      [variantId]
    ) as any[]
    return rows[0] || null
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
  
  await pool.execute(
    'INSERT INTO ProductVariant (id, productId, name, value, sku, price, stock, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, data.productId, data.name, data.value, data.sku || null, data.price || null, data.stock, data.image || null]
  )
  
  const [rows] = await pool.execute(
    'SELECT * FROM ProductVariant WHERE id = ?',
    [id]
  ) as any[]
  
  return rows[0]
}

// ==================== ГАЛЕРЕЯ ИЗОБРАЖЕНИЙ ====================

export async function findProductImages(productId: string): Promise<ProductImage[]> {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM ProductImage WHERE productId = ? ORDER BY `order`, createdAt',
      [productId]
    ) as any[]
    return rows
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
    await pool.execute(
      'UPDATE ProductImage SET isPrimary = false WHERE productId = ?',
      [data.productId]
    )
  }
  
  await pool.execute(
    'INSERT INTO ProductImage (id, productId, url, alt, `order`, isPrimary) VALUES (?, ?, ?, ?, ?, ?)',
    [id, data.productId, data.url, data.alt || null, data.order || 0, data.isPrimary || false]
  )
  
  const [rows] = await pool.execute(
    'SELECT * FROM ProductImage WHERE id = ?',
    [id]
  ) as any[]
  
  return rows[0]
}

// ==================== АТРИБУТЫ ТОВАРА ====================

export async function findProductAttributes(productId: string): Promise<ProductAttribute[]> {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM ProductAttribute WHERE productId = ? ORDER BY `order`, createdAt',
      [productId]
    ) as any[]
    return rows
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
  
  await pool.execute(
    'INSERT INTO ProductAttribute (id, productId, name, value, `order`) VALUES (?, ?, ?, ?, ?)',
    [id, data.productId, data.name, data.value, data.order || 0]
  )
  
  const [rows] = await pool.execute(
    'SELECT * FROM ProductAttribute WHERE id = ?',
    [id]
  ) as any[]
  
  return rows[0]
}

// ==================== АДРЕСНАЯ КНИГА ====================

export async function findUserAddresses(userId: string): Promise<Address[]> {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM Address WHERE userId = ? ORDER BY isDefault DESC, createdAt DESC',
      [userId]
    ) as any[]
    return rows
  } catch (error) {
    console.error('Database error in findUserAddresses:', error)
    throw error
  }
}

export async function findAddressById(addressId: string, userId: string): Promise<Address | null> {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM Address WHERE id = ? AND userId = ?',
      [addressId, userId]
    ) as any[]
    return rows[0] || null
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
    await pool.execute(
      'UPDATE Address SET isDefault = false WHERE userId = ? AND type = ?',
      [data.userId, data.type]
    )
  }
  
  await pool.execute(
    'INSERT INTO Address (id, userId, type, firstName, lastName, phone, country, region, city, postalCode, street, isDefault) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, data.userId, data.type, data.firstName, data.lastName, data.phone || null, data.country, data.region || null, data.city, data.postalCode || null, data.street, data.isDefault || false]
  )
  
  const [rows] = await pool.execute(
    'SELECT * FROM Address WHERE id = ?',
    [id]
  ) as any[]
  
  return rows[0]
}

export async function updateAddress(addressId: string, userId: string, data: Partial<Address>): Promise<Address> {
  const updates: string[] = []
  const values: any[] = []
  
  if (data.firstName !== undefined) {
    updates.push('firstName = ?')
    values.push(data.firstName)
  }
  if (data.lastName !== undefined) {
    updates.push('lastName = ?')
    values.push(data.lastName)
  }
  if (data.phone !== undefined) {
    updates.push('phone = ?')
    values.push(data.phone)
  }
  if (data.country !== undefined) {
    updates.push('country = ?')
    values.push(data.country)
  }
  if (data.region !== undefined) {
    updates.push('region = ?')
    values.push(data.region)
  }
  if (data.city !== undefined) {
    updates.push('city = ?')
    values.push(data.city)
  }
  if (data.postalCode !== undefined) {
    updates.push('postalCode = ?')
    values.push(data.postalCode)
  }
  if (data.street !== undefined) {
    updates.push('street = ?')
    values.push(data.street)
  }
  if (data.isDefault !== undefined) {
    if (data.isDefault) {
      // Снимаем флаг с других адресов
      const [current] = await pool.execute(
        'SELECT type FROM Address WHERE id = ?',
        [addressId]
      ) as any[]
      if (current[0]) {
        await pool.execute(
          'UPDATE Address SET isDefault = false WHERE userId = ? AND type = ? AND id != ?',
          [userId, current[0].type, addressId]
        )
      }
    }
    updates.push('isDefault = ?')
    values.push(data.isDefault)
  }
  
  if (updates.length === 0) {
    throw new Error('No fields to update')
  }
  
  values.push(addressId, userId)
  await pool.execute(
    `UPDATE Address SET ${updates.join(', ')} WHERE id = ? AND userId = ?`,
    values
  )
  
  const [rows] = await pool.execute(
    'SELECT * FROM Address WHERE id = ?',
    [addressId]
  ) as any[]
  
  return rows[0]
}

export async function deleteAddress(addressId: string, userId: string): Promise<void> {
  await pool.execute(
    'DELETE FROM Address WHERE id = ? AND userId = ?',
    [addressId, userId]
  )
}

// ==================== СПОСОБЫ ДОСТАВКИ ====================

export async function findShippingMethods(activeOnly: boolean = true): Promise<ShippingMethod[]> {
  try {
    const sql = activeOnly
      ? 'SELECT * FROM ShippingMethod WHERE isActive = true ORDER BY `order`, name'
      : 'SELECT * FROM ShippingMethod ORDER BY `order`, name'
    
    const [rows] = await pool.execute(sql) as any[]
    return rows
  } catch (error) {
    console.error('Database error in findShippingMethods:', error)
    throw error
  }
}

export async function findShippingMethodById(id: string): Promise<ShippingMethod | null> {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM ShippingMethod WHERE id = ?',
      [id]
    ) as any[]
    return rows[0] || null
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
  const reservations: ProductReservation[] = []
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 минут
  
  for (const item of items) {
    const id = `reserve_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    await pool.execute(
      'INSERT INTO ProductReservation (id, orderId, productId, variantId, quantity, status, expiresAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, orderId, item.productId, item.variantId || null, item.quantity, 'PENDING', expiresAt]
    )
    
    const [rows] = await pool.execute(
      'SELECT * FROM ProductReservation WHERE id = ?',
      [id]
    ) as any[]
    
    reservations.push(rows[0])
  }
  
  return reservations
}

export async function confirmReservations(orderId: string): Promise<void> {
  await pool.execute(
    'UPDATE ProductReservation SET status = "CONFIRMED" WHERE orderId = ? AND status = "PENDING"',
    [orderId]
  )
  
  // Списываем товары со склада
  const [reservations] = await pool.execute(
    'SELECT * FROM ProductReservation WHERE orderId = ? AND status = "CONFIRMED"',
    [orderId]
  ) as any[]
  
  for (const res of reservations) {
    if (res.variantId) {
      await pool.execute(
        'UPDATE ProductVariant SET stock = stock - ? WHERE id = ?',
        [res.quantity, res.variantId]
      )
    } else {
      await pool.execute(
        'UPDATE Product SET stock = stock - ? WHERE id = ?',
        [res.quantity, res.productId]
      )
    }
  }
}

export async function releaseReservations(orderId: string): Promise<void> {
  await pool.execute(
    'UPDATE ProductReservation SET status = "RELEASED" WHERE orderId = ? AND status IN ("PENDING", "CONFIRMED")',
    [orderId]
  )
}

export async function cleanupExpiredReservations(): Promise<void> {
  await pool.execute(
    'UPDATE ProductReservation SET status = "EXPIRED" WHERE status = "PENDING" AND expiresAt < NOW()'
  )
}

// ==================== УВЕДОМЛЕНИЯ ====================

export async function createNotification(data: {
  userId: string
  type: 'ORDER' | 'SHIPMENT' | 'PAYMENT' | 'RETURN' | 'REVIEW' | 'SYSTEM'
  title: string
  message: string
  link?: string | null
}): Promise<Notification> {
  const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  await pool.execute(
    'INSERT INTO Notification (id, userId, type, title, message, link) VALUES (?, ?, ?, ?, ?, ?)',
    [id, data.userId, data.type, data.title, data.message, data.link || null]
  )
  
  const [rows] = await pool.execute(
    'SELECT * FROM Notification WHERE id = ?',
    [id]
  ) as any[]
  
  return rows[0]
}

export async function findUserNotifications(userId: string, unreadOnly: boolean = false): Promise<Notification[]> {
  try {
    const sql = unreadOnly
      ? 'SELECT * FROM Notification WHERE userId = ? AND read = false ORDER BY createdAt DESC'
      : 'SELECT * FROM Notification WHERE userId = ? ORDER BY createdAt DESC LIMIT 50'
    
    const [rows] = await pool.execute(sql, [userId]) as any[]
    return rows
  } catch (error) {
    console.error('Database error in findUserNotifications:', error)
    throw error
  }
}

export async function markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
  await pool.execute(
    'UPDATE Notification SET read = true WHERE id = ? AND userId = ?',
    [notificationId, userId]
  )
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  await pool.execute(
    'UPDATE Notification SET read = true WHERE userId = ? AND read = false',
    [userId]
  )
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const [rows] = await pool.execute(
    'SELECT COUNT(*) as count FROM Notification WHERE userId = ? AND read = false',
    [userId]
  ) as any[]
  
  return rows[0]?.count || 0
}

