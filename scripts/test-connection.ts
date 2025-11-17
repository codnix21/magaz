import mysql from 'mysql2/promise'

async function testConnection() {
  console.log('🔍 Тестирование подключения к MySQL...\n')
  
  // Парсим DATABASE_URL или используем переменные окружения
  let config
  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL)
      config = {
        host: url.hostname,
        port: parseInt(url.port) || 3306,
        user: url.username,
        password: url.password,
        database: url.pathname.slice(1),
      }
    } catch (error) {
      // Fallback to defaults
      config = {
        host: process.env.DB_HOST || 'codnix.ru',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'mag',
        password: process.env.DB_PASSWORD || 'Magazin1337',
        database: process.env.DB_NAME || 'internet_magazin',
      }
    }
  } else {
    config = {
      host: process.env.DB_HOST || 'codnix.ru',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'mag',
      password: process.env.DB_PASSWORD || 'Magazin1337',
      database: process.env.DB_NAME || 'internet_magazin',
    }
  }

  console.log('📋 Параметры подключения:')
  console.log(`   Host: ${config.host}`)
  console.log(`   Port: ${config.port}`)
  console.log(`   User: ${config.user}`)
  console.log(`   Database: ${config.database}`)
  console.log(`   Password: ${config.password ? '***' : '(не указан)'}\n`)

  let connection: mysql.Connection | null = null

  try {
    console.log('⏳ Подключение к серверу...')
    connection = await mysql.createConnection(config)
    console.log('✅ Подключение установлено!\n')

    console.log('⏳ Проверка базы данных...')
    const [rows] = await connection.execute('SELECT DATABASE() as current_db')
    console.log(`✅ Текущая база данных: ${(rows as any[])[0]?.current_db}\n`)

    console.log('⏳ Проверка таблиц...')
    const [tables] = await connection.execute('SHOW TABLES')
    const tableNames = (tables as any[]).map((t: any) => Object.values(t)[0])
    console.log(`✅ Найдено таблиц: ${tableNames.length}`)
    if (tableNames.length > 0) {
      console.log(`   Таблицы: ${tableNames.join(', ')}\n`)
    } else {
      console.log('   ⚠️  Таблицы не найдены. Запустите: npm run db:seed\n')
    }

    console.log('✅ Все проверки пройдены успешно!')
    console.log('🎉 Подключение к базе данных работает корректно.\n')

  } catch (error: any) {
    console.error('❌ Ошибка подключения:\n')
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('🔴 ОШИБКА ДОСТУПА')
      console.error('   MySQL сервер отклоняет подключение.')
      console.error('   Ваш IP адрес: ' + (error.sqlMessage?.match(/@'([^']+)'/)?.[1] || 'неизвестен'))
      console.error('\n📖 Решение:')
      console.error('   1. Откройте файл: DATABASE_SETUP_GUIDE.md')
      console.error('   2. Выполните SQL команды на сервере MySQL')
      console.error('   3. Повторите проверку\n')
    } else if (error.code === 'ECONNREFUSED') {
      console.error('🔴 ОШИБКА ПОДКЛЮЧЕНИЯ')
      console.error('   Не удалось подключиться к серверу.')
      console.error('   Проверьте:')
      console.error('   - Хост и порт правильные')
      console.error('   - Сервер MySQL запущен')
      console.error('   - Файрвол разрешает подключения на порт 3306\n')
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('🔴 ОШИБКА БАЗЫ ДАННЫХ')
      console.error('   База данных не существует.')
      console.error('   Создайте базу данных или проверьте имя в .env\n')
    } else {
      console.error(`   Код ошибки: ${error.code}`)
      console.error(`   Сообщение: ${error.message}\n`)
    }

    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
      console.log('🔌 Соединение закрыто.')
    }
  }
}

testConnection()

