-- Миграция для добавления новых функций:
-- 1. Скидки и промокоды (PromoCode)
-- 2. Избранное/вишлист (Wishlist)
-- 3. Отзывы и рейтинги (Review)

USE `internet_magazin`;

-- Таблица промокодов
CREATE TABLE IF NOT EXISTS `PromoCode` (
  `id` VARCHAR(191) NOT NULL,
  `code` VARCHAR(191) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `discountType` ENUM('PERCENTAGE', 'FIXED') NOT NULL DEFAULT 'PERCENTAGE',
  `discountValue` DOUBLE NOT NULL,
  `minPurchaseAmount` DOUBLE NULL DEFAULT 0,
  `maxDiscountAmount` DOUBLE NULL,
  `usageLimit` INT NULL,
  `usedCount` INT NOT NULL DEFAULT 0,
  `validFrom` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `validUntil` DATETIME(3) NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `PromoCode_code_key` (`code`),
  KEY `PromoCode_code_idx` (`code`),
  KEY `PromoCode_isActive_idx` (`isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица избранного (вишлист)
CREATE TABLE IF NOT EXISTS `Wishlist` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `productId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Wishlist_userId_productId_key` (`userId`, `productId`),
  KEY `Wishlist_userId_idx` (`userId`),
  KEY `Wishlist_productId_idx` (`productId`),
  CONSTRAINT `Wishlist_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Wishlist_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица отзывов
CREATE TABLE IF NOT EXISTS `Review` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `productId` VARCHAR(191) NOT NULL,
  `rating` INT NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
  `comment` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Review_userId_productId_key` (`userId`, `productId`),
  KEY `Review_productId_idx` (`productId`),
  KEY `Review_rating_idx` (`rating`),
  CONSTRAINT `Review_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Review_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Добавляем поля для скидок в Order (с проверкой существования)
-- Используем простой подход: проверяем через запрос и выполняем ALTER только если колонки нет

-- Проверка и добавление promoCodeId
SET @dbname = DATABASE();
SET @column_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = @dbname 
    AND TABLE_NAME = 'Order' 
    AND COLUMN_NAME = 'promoCodeId'
);

SET @sql = IF(@column_exists = 0,
  'ALTER TABLE `Order` ADD COLUMN `promoCodeId` VARCHAR(191) NULL',
  'SELECT 1 as skip'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Проверка и добавление discountAmount
SET @column_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = @dbname 
    AND TABLE_NAME = 'Order' 
    AND COLUMN_NAME = 'discountAmount'
);

SET @sql = IF(@column_exists = 0,
  'ALTER TABLE `Order` ADD COLUMN `discountAmount` DOUBLE NOT NULL DEFAULT 0',
  'SELECT 1 as skip'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Проверка и добавление subtotal
SET @column_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = @dbname 
    AND TABLE_NAME = 'Order' 
    AND COLUMN_NAME = 'subtotal'
);

SET @sql = IF(@column_exists = 0,
  'ALTER TABLE `Order` ADD COLUMN `subtotal` DOUBLE NOT NULL DEFAULT 0',
  'SELECT 1 as skip'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Проверка и создание индекса для promoCodeId
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = @dbname 
    AND TABLE_NAME = 'Order' 
    AND INDEX_NAME = 'Order_promoCodeId_idx'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX `Order_promoCodeId_idx` ON `Order` (`promoCodeId`)',
  'SELECT 1 as skip'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Добавляем поля скидки в Product
-- Проверка и добавление discountPercent
SET @column_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = @dbname 
    AND TABLE_NAME = 'Product' 
    AND COLUMN_NAME = 'discountPercent'
);

SET @sql = IF(@column_exists = 0,
  'ALTER TABLE `Product` ADD COLUMN `discountPercent` INT NOT NULL DEFAULT 0',
  'SELECT 1 as skip'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Проверка и добавление originalPrice
SET @column_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = @dbname 
    AND TABLE_NAME = 'Product' 
    AND COLUMN_NAME = 'originalPrice'
);

SET @sql = IF(@column_exists = 0,
  'ALTER TABLE `Product` ADD COLUMN `originalPrice` DOUBLE NULL',
  'SELECT 1 as skip'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

