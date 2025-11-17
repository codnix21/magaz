-- MySQL Dump для интернет-магазина
-- Версия: 1.0
-- Дата создания: 2024

-- Создание базы данных (раскомментируйте, если нужно создать БД)
CREATE DATABASE IF NOT EXISTS `internet_magazin` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `internet_magazin`;

-- Удаление существующих таблиц (в обратном порядке зависимостей)
DROP TABLE IF EXISTS `OrderItem`;
DROP TABLE IF EXISTS `Order`;
DROP TABLE IF EXISTS `CartItem`;
DROP TABLE IF EXISTS `Product`;
DROP TABLE IF EXISTS `User`;

-- Создание таблицы User
CREATE TABLE `User` (
  `id` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NULL,
  `password` VARCHAR(191) NOT NULL,
  `role` VARCHAR(191) NOT NULL DEFAULT 'USER',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`),
  KEY `User_email_idx` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Создание таблицы Product
CREATE TABLE `Product` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `description` TEXT NOT NULL,
  `price` DOUBLE NOT NULL,
  `image` VARCHAR(191) NOT NULL,
  `category` VARCHAR(191) NOT NULL,
  `stock` INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Product_category_idx` (`category`),
  KEY `Product_name_idx` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Создание таблицы CartItem
CREATE TABLE `CartItem` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `productId` VARCHAR(191) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `CartItem_userId_productId_key` (`userId`, `productId`),
  KEY `CartItem_userId_idx` (`userId`),
  KEY `CartItem_productId_idx` (`productId`),
  CONSTRAINT `CartItem_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `CartItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Создание таблицы Order
CREATE TABLE `Order` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `total` DOUBLE NOT NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
  `shippingAddress` TEXT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Order_userId_idx` (`userId`),
  KEY `Order_status_idx` (`status`),
  KEY `Order_createdAt_idx` (`createdAt`),
  CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Создание таблицы OrderItem
CREATE TABLE `OrderItem` (
  `id` VARCHAR(191) NOT NULL,
  `orderId` VARCHAR(191) NOT NULL,
  `productId` VARCHAR(191) NOT NULL,
  `quantity` INT NOT NULL,
  `price` DOUBLE NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `OrderItem_orderId_idx` (`orderId`),
  KEY `OrderItem_productId_idx` (`productId`),
  CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `OrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Вставка тестовых данных
-- ВНИМАНИЕ: Пароли должны быть хешированы через bcrypt!
-- Для правильного создания пользователей с паролями используйте:
-- npm run db:seed
-- Это создаст пользователей с правильными bcrypt хешами:
-- Администратор: admin@example.com / admin123
-- Пользователь: user@example.com / user123

-- Пример создания администратора (хеш для пароля 'admin123'):
-- INSERT INTO `User` (`id`, `email`, `name`, `password`, `role`, `createdAt`, `updatedAt`) VALUES
-- ('admin_001', 'admin@example.com', 'Администратор', '$2a$10$YourBcryptHashHere', 'ADMIN', NOW(), NOW());

-- Пример создания пользователя (хеш для пароля 'user123'):
-- INSERT INTO `User` (`id`, `email`, `name`, `password`, `role`, `createdAt`, `updatedAt`) VALUES
-- ('user_001', 'user@example.com', 'Тестовый пользователь', '$2a$10$YourBcryptHashHere', 'USER', NOW(), NOW());

-- Вставка тестовых товаров
INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `category`, `stock`, `createdAt`, `updatedAt`) VALUES
('prod_001', 'Смартфон iPhone 15', 'Новейший смартфон от Apple с революционными возможностями', 79990.00, 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500', 'Электроника', 15, NOW(), NOW()),
('prod_002', 'Ноутбук MacBook Pro', 'Мощный ноутбук для профессионалов с процессором M3', 199990.00, 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500', 'Электроника', 8, NOW(), NOW()),
('prod_003', 'Джинсы классические', 'Качественные джинсы из премиального денима', 3990.00, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500', 'Одежда', 25, NOW(), NOW()),
('prod_004', 'Футболка базовая', 'Удобная хлопковая футболка универсального дизайна', 990.00, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', 'Одежда', 50, NOW(), NOW()),
('prod_005', 'Кофемашина автоматическая', 'Автоматическая кофемашина для идеального эспрессо', 45990.00, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500', 'Дом и сад', 12, NOW(), NOW()),
('prod_006', 'Беговая дорожка', 'Электрическая беговая дорожка для домашних тренировок', 89990.00, 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=500', 'Спорт', 5, NOW(), NOW()),
('prod_007', 'Наушники беспроводные', 'Премиальные беспроводные наушники с шумоподавлением', 12990.00, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', 'Электроника', 20, NOW(), NOW()),
('prod_008', 'Кроссовки спортивные', 'Удобные спортивные кроссовки для бега и тренировок', 4990.00, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', 'Спорт', 30, NOW(), NOW());

-- Примечания:
-- 1. Пароли в этом дампе НЕ являются реальными хешами bcrypt
-- 2. После импорта дампа вам нужно будет создать реальных пользователей через приложение
-- 3. Или обновите пароли вручную, используя bcrypt для хеширования
-- 4. Для генерации правильных хешей используйте скрипт seed.ts: npm run db:seed

