import pool from '../lib/db'

async function checkData() {
  console.log('🔍 Проверка данных в базе...\n')

  try {
    // Проверка пользователей
    const [users] = await pool.execute('SELECT COUNT(*) as count FROM User')
    const userCount = (users as any[])[0]?.count || 0
    console.log(`👥 Пользователи: ${userCount}`)

    // Проверка товаров
    const [products] = await pool.execute('SELECT COUNT(*) as count FROM Product')
    const productCount = (products as any[])[0]?.count || 0
    console.log(`📦 Товары: ${productCount}`)

    // Проверка заказов
    const [orders] = await pool.execute('SELECT COUNT(*) as count FROM `Order`')
    const orderCount = (orders as any[])[0]?.count || 0
    console.log(`🛒 Заказы: ${orderCount}`)

    console.log('\n📋 Рекомендации:')

    if (userCount === 0) {
      console.log('   ⚠️  Нет пользователей. Запустите: npm run db:seed')
    } else {
      console.log('   ✅ Пользователи есть')
    }

    if (productCount === 0) {
      console.log('   ⚠️  Нет товаров. Запустите: npm run db:seed')
    } else {
      console.log('   ✅ Товары есть')
    }

    if (productCount > 0 && userCount > 0) {
      console.log('\n🎉 База данных готова к работе!')
      console.log('   Запустите: npm run dev')
    }

  } catch (error: any) {
    console.error('❌ Ошибка при проверке данных:', error.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

checkData()

