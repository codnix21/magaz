import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Отключаем логирование запросов для ускорения (оставляем только ошибки)
    log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
    // Оптимизация connection pool
    datasources: {
      db: {
        url: process.env.DATABASE_URL || undefined,
      },
    },
    // Оптимизация для production
    ...(process.env.NODE_ENV === 'production' && {
      errorFormat: 'minimal',
    }),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

