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
  createdAt: Date
  updatedAt: Date
  product?: Product
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
            p.description as p_description, p.createdAt as p_createdAt, 
            p.updatedAt as p_updatedAt
     FROM CartItem ci
     JOIN Product p ON ci.productId = p.id
     WHERE ci.userId = ?`,
    [userId]
  ) as any[]
  
  // Преобразуем результат в нужный формат
  return rows.map(row => ({
    id: row.id,
    userId: row.userId,
    productId: row.productId,
    quantity: row.quantity,
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
      createdAt: row.p_createdAt,
      updatedAt: row.p_updatedAt,
    }
  }))
}

export async function addToCart(userId: string, productId: string, quantity: number = 1): Promise<CartItem> {
  // Проверяем, есть ли уже этот товар в корзине
  const [existing] = await pool.execute(
    'SELECT * FROM CartItem WHERE userId = ? AND productId = ?',
    [userId, productId]
  ) as any[]
  
  if (existing[0]) {
    // Обновляем количество
    await pool.execute(
      'UPDATE CartItem SET quantity = quantity + ? WHERE id = ?',
      [quantity, existing[0].id]
    )
    const items = await findCartItems(userId)
    return items.find(item => item.productId === productId)!
  } else {
    // Создаем новую запись
    const id = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    await pool.execute(
      'INSERT INTO CartItem (id, userId, productId, quantity) VALUES (?, ?, ?, ?)',
      [id, userId, productId, quantity]
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
  cartItems: Array<{ productId: string; quantity: number; price: number }>
  promoCodeId?: string | null
  discountAmount?: number
  subtotal?: number
}): Promise<any> {
  const connection = await pool.getConnection()
  await connection.beginTransaction()
  
  try {
    const subtotal = data.subtotal || data.total
    const discountAmount = data.discountAmount || 0
    const total = data.total
    
    // Создаем заказ
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    await connection.execute(
      'INSERT INTO `Order` (id, userId, subtotal, discountAmount, total, shippingAddress, status, promoCodeId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [orderId, data.userId, subtotal, discountAmount, total, data.shippingAddress, 'PENDING', data.promoCodeId || null]
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
      await connection.execute(
        'INSERT INTO OrderItem (id, orderId, productId, quantity, price) VALUES (?, ?, ?, ?, ?)',
        [itemId, orderId, item.productId, item.quantity, item.price]
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

