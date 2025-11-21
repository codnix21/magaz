import prisma from '../lib/prisma'

async function testConnection() {
  console.log('🔍 Тестирование подключения к MySQL через Prisma...\n')

  try {
    console.log('⏳ Подключение к серверу...')
    
    // Тестируем подключение через простой запрос
    await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Подключение установлено!\n')

    console.log('⏳ Проверка базы данных...')
    const dbName = await prisma.$queryRaw<Array<{ current_db: string }>>`SELECT DATABASE() as current_db`
    console.log(`✅ Текущая база данных: ${dbName[0]?.current_db}\n`)

    console.log('⏳ Проверка таблиц...')
    const tables = await prisma.$queryRaw<Array<{ Tables_in_database: string }>>`SHOW TABLES`
    const tableNames = tables.map(t => Object.values(t)[0])
    console.log(`✅ Найдено таблиц: ${tableNames.length}`)
    if (tableNames.length > 0) {
      console.log(`   Таблицы: ${tableNames.join(', ')}\n`)
    } else {
      console.log('   ⚠️  Таблицы не найдены. Запустите: npm run db:seed\n')
    }

    // Проверка основных таблиц через Prisma
    console.log('⏳ Проверка основных таблиц через Prisma...')
    const userCount = await prisma.user.count()
    const productCount = await prisma.product.count()
    const orderCount = await prisma.order.count()
    console.log(`   👥 Пользователи: ${userCount}`)
    console.log(`   📦 Товары: ${productCount}`)
    console.log(`   🛒 Заказы: ${orderCount}\n`)

    console.log('✅ Все проверки пройдены успешно!')
    console.log('🎉 Подключение к базе данных работает корректно.\n')

  } catch (error: any) {
    console.error('❌ Ошибка подключения:\n')
    
    if (error.code === 'P1000' || error.message?.includes('Authentication failed')) {
      console.error('🔴 ОШИБКА ДОСТУПА')
      console.error('   MySQL сервер отклоняет подключение.')
      console.error('\n📖 Решение:')
      console.error('   1. Проверьте DATABASE_URL в .env')
      console.error('   2. Убедитесь, что пользователь имеет права доступа')
      console.error('   3. Повторите проверку\n')
    } else if (error.code === 'P1001' || error.message?.includes('Can\'t reach database server')) {
      console.error('🔴 ОШИБКА ПОДКЛЮЧЕНИЯ')
      console.error('   Не удалось подключиться к серверу.')
      console.error('   Проверьте:')
      console.error('   - Хост и порт правильные')
      console.error('   - Сервер MySQL запущен')
      console.error('   - Файрвол разрешает подключения на порт 3306\n')
    } else if (error.code === 'P1003' || error.message?.includes('database does not exist')) {
      console.error('🔴 ОШИБКА БАЗЫ ДАННЫХ')
      console.error('   База данных не существует.')
      console.error('   Создайте базу данных или проверьте имя в .env\n')
    } else {
      console.error(`   Код ошибки: ${error.code || 'неизвестен'}`)
      console.error(`   Сообщение: ${error.message}\n`)
    }

    process.exit(1)
  } finally {
    await prisma.$disconnect()
    console.log('🔌 Соединение закрыто.')
  }
}

testConnection()

