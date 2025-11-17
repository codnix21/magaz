import mysql from 'mysql2/promise'

// Парсим DATABASE_URL из переменной окружения или используем значения по умолчанию
function getDbConfig() {
  const dbUrl = process.env.DATABASE_URL
  
  if (dbUrl) {
    try {
      // Парсим URL формата: mysql://user:password@host:port/database
      const url = new URL(dbUrl)
      const config = {
        host: url.hostname,
        port: parseInt(url.port) || 3306,
        user: url.username,
        password: url.password,
        database: url.pathname.slice(1), // убираем первый /
        ssl: url.searchParams.has('sslmode') ? { rejectUnauthorized: false } : false,
      }
      
      // Отладочная информация отключена для чистоты консоли
      // Раскомментируйте для отладки:
      // if (process.env.NODE_ENV !== 'production' && process.env.DEBUG_DB === 'true') {
      //   console.log('[DB Config] Using DATABASE_URL:', {
      //     host: config.host,
      //     port: config.port,
      //     user: config.user,
      //     database: config.database,
      //     password: config.password ? '***' : '(empty)',
      //   })
      // }
      
      return config
    } catch (error) {
      console.error('[DB Config] Error parsing DATABASE_URL:', error)
      // Fallback to defaults
    }
  }
  
  // Значения по умолчанию - ТОЛЬКО для разработки
  // В продакшене ВСЕ значения должны быть в переменных окружения!
  if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
    throw new Error(
      'Database configuration is missing! Please set DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME environment variables.'
    )
  }

  const config = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  }
  
  // Отладочная информация отключена для чистоты консоли
  // Раскомментируйте для отладки:
  // if (process.env.NODE_ENV !== 'production' && process.env.DEBUG_DB === 'true') {
  //   console.log('[DB Config] Using default config:', {
  //     host: config.host,
  //     port: config.port,
  //     user: config.user,
  //     database: config.database,
  //     password: config.password ? '***' : '(empty)',
  //     source: dbUrl ? 'DATABASE_URL (failed parse)' : 'default values',
  //   })
  // }
  
  return config
}

const config = getDbConfig()

// Создаем pool соединений к MySQL с оптимизацией для быстрой работы
// Валидные опции для mysql2/promise Pool:
// - connectionLimit, queueLimit, waitForConnections
// - enableKeepAlive, keepAliveInitialDelay
// Таймауты настраиваются через опции соединения (в config), не в Pool
const pool = mysql.createPool({
  ...config,
  // Опции пула соединений
  waitForConnections: true,
  connectionLimit: 20, // Увеличено для лучшей производительности
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
})

export default pool

// Вспомогательные функции для работы с БД
export async function query(sql: string, params?: any[]) {
  const [rows] = await pool.execute(sql, params)
  return rows
}

export async function queryOne(sql: string, params?: any[]) {
  const rows = await query(sql, params) as any[]
  return rows[0] || null
}

