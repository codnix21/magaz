import pool from '../lib/db'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('🌱 Начало заполнения базы данных...')

  // Создание администратора
  const adminPassword = await bcrypt.hash('admin123', 10)
  const adminId = `admin_${Date.now()}`
  
  // Проверяем, существует ли уже пользователь
  const [existingAdmin] = await pool.execute(
    'SELECT * FROM User WHERE email = ?',
    ['admin@example.com']
  ) as any[]
  
  if (existingAdmin.length === 0) {
    await pool.execute(
      'INSERT INTO User (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
      [adminId, 'admin@example.com', adminPassword, 'Администратор', 'ADMIN']
    )
    console.log('✅ Администратор создан: admin@example.com')
  } else {
    console.log('⏭️  Администратор уже существует')
  }

  // Создание обычного пользователя
  const userPassword = await bcrypt.hash('user123', 10)
  const userId = `user_${Date.now()}`
  
  const [existingUser] = await pool.execute(
    'SELECT * FROM User WHERE email = ?',
    ['user@example.com']
  ) as any[]
  
  if (existingUser.length === 0) {
    await pool.execute(
      'INSERT INTO User (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
      [userId, 'user@example.com', userPassword, 'Тестовый пользователь', 'USER']
    )
    console.log('✅ Пользователь создан: user@example.com')
  } else {
    console.log('⏭️  Пользователь уже существует')
  }

  // Проверяем, есть ли уже товары
  const [existingProducts] = await pool.execute('SELECT COUNT(*) as count FROM Product') as any[]
  
  if (existingProducts[0].count === 0) {
    const products = [
      {
        name: 'Смартфон iPhone 15',
        description: 'Новейший смартфон от Apple с революционными возможностями',
        price: 79990,
        image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500',
        category: 'Электроника',
        stock: 15,
      },
      {
        name: 'Ноутбук MacBook Pro',
        description: 'Мощный ноутбук для профессионалов с процессором M3',
        price: 199990,
        image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500',
        category: 'Электроника',
        stock: 8,
      },
      {
        name: 'Джинсы классические',
        description: 'Качественные джинсы из премиального денима',
        price: 3990,
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
        category: 'Одежда',
        stock: 25,
      },
      {
        name: 'Футболка базовая',
        description: 'Удобная хлопковая футболка универсального дизайна',
        price: 990,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
        category: 'Одежда',
        stock: 50,
      },
      {
        name: 'Кофемашина автоматическая',
        description: 'Автоматическая кофемашина для идеального эспрессо',
        price: 45990,
        image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500',
        category: 'Дом и сад',
        stock: 12,
      },
      {
        name: 'Беговая дорожка',
        description: 'Электрическая беговая дорожка для домашних тренировок',
        price: 89990,
        image: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=500',
        category: 'Спорт',
        stock: 5,
      },
      {
        name: 'Наушники беспроводные',
        description: 'Премиальные беспроводные наушники с шумоподавлением',
        price: 12990,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
        category: 'Электроника',
        stock: 20,
      },
      {
        name: 'Кроссовки спортивные',
        description: 'Удобные спортивные кроссовки для бега и тренировок',
        price: 4990,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
        category: 'Спорт',
        stock: 30,
      },
    ]

    for (const product of products) {
      const productId = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      try {
        await pool.execute(
          'INSERT INTO Product (id, name, description, price, image, category, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [productId, product.name, product.description, product.price, product.image, product.category, product.stock]
        )
        console.log(`✅ Товар создан: ${product.name}`)
      } catch (error) {
        console.error(`❌ Ошибка при создании товара ${product.name}:`, error)
      }
    }
  } else {
    console.log('⏭️  Товары уже существуют, пропускаем создание')
  }

  console.log('🎉 Заполнение базы данных завершено!')
  console.log('\n📋 Учетные данные для входа:')
  console.log('Администратор: admin@example.com / admin123')
  console.log('Пользователь: user@example.com / user123')
  
  await pool.end()
}

main()
  .catch(async (e) => {
    console.error('❌ Ошибка при заполнении базы данных:', e)
    await pool.end()
    process.exit(1)
  })

