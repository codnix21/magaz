-- Расширенная миграция для полноценного интернет-магазина
-- Версия: 2.0
-- Дата: 2025

USE `internet_magazin`;

-- ============================================
-- РАСШИРЕНИЕ ТАБЛИЦЫ USER
-- ============================================

-- Добавляем поля для расширенной авторизации
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'User' AND COLUMN_NAME = 'phone');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `User` ADD COLUMN `phone` VARCHAR(20) NULL', 'SELECT 1 as skip');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'User' AND COLUMN_NAME = 'emailVerified');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `User` ADD COLUMN `emailVerified` BOOLEAN NOT NULL DEFAULT false', 'SELECT 1 as skip');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'User' AND COLUMN_NAME = 'phoneVerified');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `User` ADD COLUMN `phoneVerified` BOOLEAN NOT NULL DEFAULT false', 'SELECT 1 as skip');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'User' AND COLUMN_NAME = 'oauthProvider');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `User` ADD COLUMN `oauthProvider` VARCHAR(50) NULL', 'SELECT 1 as skip');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'User' AND COLUMN_NAME = 'oauthId');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `User` ADD COLUMN `oauthId` VARCHAR(191) NULL', 'SELECT 1 as skip');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'User' AND COLUMN_NAME = 'avatar');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `User` ADD COLUMN `avatar` VARCHAR(500) NULL', 'SELECT 1 as skip');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Индексы для User
SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'User' AND INDEX_NAME = 'User_phone_idx');
SET @sql = IF(@index_exists = 0, 'CREATE INDEX `User_phone_idx` ON `User` (`phone`)', 'SELECT 1 as skip');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- ВАРИАНТЫ ТОВАРОВ (Size, Color и т.д.)
-- ============================================

CREATE TABLE IF NOT EXISTS `ProductVariant` (
  `id` VARCHAR(191) NOT NULL,
  `productId` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL COMMENT 'Название варианта (например: "Размер: L", "Цвет: Красный")',
  `value` VARCHAR(191) NOT NULL COMMENT 'Значение варианта (например: "L", "red")',
  `sku` VARCHAR(191) NULL COMMENT 'Артикул варианта',
  `price` DOUBLE NULL COMMENT 'Цена варианта (если отличается от базовой)',
  `stock` INT NOT NULL DEFAULT 0,
  `image` VARCHAR(500) NULL COMMENT 'Изображение варианта',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `ProductVariant_productId_idx` (`productId`),
  KEY `ProductVariant_sku_idx` (`sku`),
  CONSTRAINT `ProductVariant_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ГАЛЕРЕЯ ИЗОБРАЖЕНИЙ ТОВАРА
-- ============================================

CREATE TABLE IF NOT EXISTS `ProductImage` (
  `id` VARCHAR(191) NOT NULL,
  `productId` VARCHAR(191) NOT NULL,
  `url` VARCHAR(500) NOT NULL,
  `alt` VARCHAR(255) NULL,
  `order` INT NOT NULL DEFAULT 0 COMMENT 'Порядок отображения',
  `isPrimary` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `ProductImage_productId_idx` (`productId`),
  KEY `ProductImage_order_idx` (`order`),
  CONSTRAINT `ProductImage_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- АТРИБУТЫ И ХАРАКТЕРИСТИКИ ТОВАРА
-- ============================================

CREATE TABLE IF NOT EXISTS `ProductAttribute` (
  `id` VARCHAR(191) NOT NULL,
  `productId` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL COMMENT 'Название атрибута (например: "Материал", "Вес")',
  `value` TEXT NOT NULL COMMENT 'Значение атрибута',
  `order` INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `ProductAttribute_productId_idx` (`productId`),
  CONSTRAINT `ProductAttribute_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- АДРЕСНАЯ КНИГА
-- ============================================

CREATE TABLE IF NOT EXISTS `Address` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `type` ENUM('SHIPPING', 'BILLING', 'BOTH') NOT NULL DEFAULT 'SHIPPING',
  `firstName` VARCHAR(191) NOT NULL,
  `lastName` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(20) NULL,
  `country` VARCHAR(100) NOT NULL DEFAULT 'Россия',
  `region` VARCHAR(100) NULL COMMENT 'Область/Регион',
  `city` VARCHAR(100) NOT NULL,
  `postalCode` VARCHAR(20) NULL,
  `street` VARCHAR(255) NOT NULL COMMENT 'Улица, дом, квартира',
  `isDefault` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Address_userId_idx` (`userId`),
  CONSTRAINT `Address_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- СПОСОБЫ ДОСТАВКИ
-- ============================================

CREATE TABLE IF NOT EXISTS `ShippingMethod` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `price` DOUBLE NOT NULL DEFAULT 0,
  `freeShippingThreshold` DOUBLE NULL COMMENT 'Бесплатная доставка при заказе от суммы',
  `estimatedDays` INT NULL COMMENT 'Примерное количество дней доставки',
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `order` INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `ShippingMethod_isActive_idx` (`isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- РАСШИРЕНИЕ ТАБЛИЦЫ ORDER
-- ============================================

SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Order' AND COLUMN_NAME = 'shippingMethodId');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `Order` ADD COLUMN `shippingMethodId` VARCHAR(191) NULL', 'SELECT 1 as skip');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Order' AND COLUMN_NAME = 'shippingCost');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `Order` ADD COLUMN `shippingCost` DOUBLE NOT NULL DEFAULT 0', 'SELECT 1 as skip');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Order' AND COLUMN_NAME = 'paymentMethod');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `Order` ADD COLUMN `paymentMethod` VARCHAR(50) NOT NULL DEFAULT "CASH"', 'SELECT 1 as skip');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Order' AND COLUMN_NAME = 'comment');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `Order` ADD COLUMN `comment` TEXT NULL', 'SELECT 1 as skip');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Order' AND COLUMN_NAME = 'addressId');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `Order` ADD COLUMN `addressId` VARCHAR(191) NULL', 'SELECT 1 as skip');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Order' AND COLUMN_NAME = 'trackingNumber');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `Order` ADD COLUMN `trackingNumber` VARCHAR(100) NULL', 'SELECT 1 as skip');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Order' AND COLUMN_NAME = 'deliveryDate');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `Order` ADD COLUMN `deliveryDate` DATETIME(3) NULL', 'SELECT 1 as skip');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Индексы для Order
SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Order' AND INDEX_NAME = 'Order_shippingMethodId_idx');
SET @sql = IF(@index_exists = 0, 'CREATE INDEX `Order_shippingMethodId_idx` ON `Order` (`shippingMethodId`)', 'SELECT 1 as skip');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Внешний ключ для shippingMethodId
SET @fk_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Order' AND CONSTRAINT_NAME = 'Order_shippingMethodId_fkey');
SET @sql = IF(@fk_exists = 0, 'ALTER TABLE `Order` ADD CONSTRAINT `Order_shippingMethodId_fkey` FOREIGN KEY (`shippingMethodId`) REFERENCES `ShippingMethod` (`id`) ON DELETE SET NULL ON UPDATE CASCADE', 'SELECT 1 as skip');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- РАСШИРЕНИЕ CARTITEM (добавляем variantId)
-- ============================================

SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'CartItem' AND COLUMN_NAME = 'variantId');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `CartItem` ADD COLUMN `variantId` VARCHAR(191) NULL', 'SELECT 1 as skip');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'CartItem' AND INDEX_NAME = 'CartItem_variantId_idx');
SET @sql = IF(@index_exists = 0, 'CREATE INDEX `CartItem_variantId_idx` ON `CartItem` (`variantId`)', 'SELECT 1 as skip');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- РАСШИРЕНИЕ ORDERITEM (добавляем variantId)
-- ============================================

SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'OrderItem' AND COLUMN_NAME = 'variantId');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `OrderItem` ADD COLUMN `variantId` VARCHAR(191) NULL', 'SELECT 1 as skip');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'OrderItem' AND COLUMN_NAME = 'variantName');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `OrderItem` ADD COLUMN `variantName` VARCHAR(191) NULL COMMENT "Название варианта на момент заказа"', 'SELECT 1 as skip');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- РЕЗЕРВИРОВАНИЕ ТОВАРОВ
-- ============================================

CREATE TABLE IF NOT EXISTS `ProductReservation` (
  `id` VARCHAR(191) NOT NULL,
  `orderId` VARCHAR(191) NULL COMMENT 'ID заказа, для которого резервируется товар',
  `productId` VARCHAR(191) NOT NULL,
  `variantId` VARCHAR(191) NULL,
  `quantity` INT NOT NULL,
  `status` ENUM('PENDING', 'CONFIRMED', 'RELEASED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
  `expiresAt` DATETIME(3) NOT NULL COMMENT 'Время истечения резерва',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `ProductReservation_orderId_idx` (`orderId`),
  KEY `ProductReservation_productId_idx` (`productId`),
  KEY `ProductReservation_status_idx` (`status`),
  KEY `ProductReservation_expiresAt_idx` (`expiresAt`),
  CONSTRAINT `ProductReservation_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ProductReservation_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ВОЗВРАТЫ ТОВАРОВ
-- ============================================

CREATE TABLE IF NOT EXISTS `OrderReturn` (
  `id` VARCHAR(191) NOT NULL,
  `orderId` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `reason` TEXT NOT NULL COMMENT 'Причина возврата',
  `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'PROCESSING', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
  `refundAmount` DOUBLE NOT NULL DEFAULT 0,
  `refundStatus` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING',
  `adminComment` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `OrderReturn_orderId_idx` (`orderId`),
  KEY `OrderReturn_userId_idx` (`userId`),
  KEY `OrderReturn_status_idx` (`status`),
  CONSTRAINT `OrderReturn_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `OrderReturn_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `OrderReturnItem` (
  `id` VARCHAR(191) NOT NULL,
  `returnId` VARCHAR(191) NOT NULL,
  `orderItemId` VARCHAR(191) NOT NULL,
  `quantity` INT NOT NULL,
  `reason` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `OrderReturnItem_returnId_idx` (`returnId`),
  KEY `OrderReturnItem_orderItemId_idx` (`orderItemId`),
  CONSTRAINT `OrderReturnItem_returnId_fkey` FOREIGN KEY (`returnId`) REFERENCES `OrderReturn` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `OrderReturnItem_orderItemId_fkey` FOREIGN KEY (`orderItemId`) REFERENCES `OrderItem` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ТОКЕНЫ ДЛЯ ВОССТАНОВЛЕНИЯ ПАРОЛЯ И OAuth
-- ============================================

CREATE TABLE IF NOT EXISTS `UserToken` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `token` VARCHAR(500) NOT NULL,
  `type` ENUM('PASSWORD_RESET', 'EMAIL_VERIFICATION', 'PHONE_VERIFICATION', 'OAUTH') NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `used` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `UserToken_userId_idx` (`userId`),
  KEY `UserToken_token_idx` (`token`(191)),
  KEY `UserToken_type_idx` (`type`),
  KEY `UserToken_expiresAt_idx` (`expiresAt`),
  CONSTRAINT `UserToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- УВЕДОМЛЕНИЯ
-- ============================================

CREATE TABLE IF NOT EXISTS `Notification` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `type` ENUM('ORDER', 'SHIPMENT', 'PAYMENT', 'RETURN', 'REVIEW', 'SYSTEM') NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `link` VARCHAR(500) NULL,
  `read` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Notification_userId_idx` (`userId`),
  KEY `Notification_read_idx` (`read`),
  KEY `Notification_type_idx` (`type`),
  KEY `Notification_createdAt_idx` (`createdAt`),
  CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CRM / СЛУЖБА ПОДДЕРЖКИ (ТИКЕТЫ)
-- ============================================

CREATE TABLE IF NOT EXISTS `Ticket` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `orderId` VARCHAR(191) NULL COMMENT 'Связанный заказ (если есть)',
  `subject` VARCHAR(255) NOT NULL,
  `status` ENUM('OPEN', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
  `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM',
  `assignedTo` VARCHAR(191) NULL COMMENT 'ID администратора, назначенного на тикет',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `closedAt` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  KEY `Ticket_userId_idx` (`userId`),
  KEY `Ticket_orderId_idx` (`orderId`),
  KEY `Ticket_status_idx` (`status`),
  KEY `Ticket_priority_idx` (`priority`),
  KEY `Ticket_assignedTo_idx` (`assignedTo`),
  CONSTRAINT `Ticket_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Ticket_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `TicketMessage` (
  `id` VARCHAR(191) NOT NULL,
  `ticketId` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL COMMENT 'ID отправителя (пользователь или админ)',
  `message` TEXT NOT NULL,
  `isInternal` BOOLEAN NOT NULL DEFAULT false COMMENT 'Внутреннее сообщение (видно только админам)',
  `attachments` JSON NULL COMMENT 'JSON массив с путями к файлам',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `TicketMessage_ticketId_idx` (`ticketId`),
  KEY `TicketMessage_userId_idx` (`userId`),
  KEY `TicketMessage_createdAt_idx` (`createdAt`),
  CONSTRAINT `TicketMessage_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `Ticket` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `TicketMessage_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ТЕГИ ДЛЯ ТОВАРОВ
-- ============================================

CREATE TABLE IF NOT EXISTS `Tag` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL UNIQUE,
  `slug` VARCHAR(191) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Tag_name_key` (`name`),
  UNIQUE KEY `Tag_slug_key` (`slug`),
  KEY `Tag_slug_idx` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ProductTag` (
  `id` VARCHAR(191) NOT NULL,
  `productId` VARCHAR(191) NOT NULL,
  `tagId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ProductTag_productId_tagId_key` (`productId`, `tagId`),
  KEY `ProductTag_productId_idx` (`productId`),
  KEY `ProductTag_tagId_idx` (`tagId`),
  CONSTRAINT `ProductTag_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ProductTag_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `Tag` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ВСТАВКА БАЗОВЫХ ДАННЫХ
-- ============================================

-- Базовые способы доставки
INSERT IGNORE INTO `ShippingMethod` (`id`, `name`, `description`, `price`, `freeShippingThreshold`, `estimatedDays`, `isActive`, `order`) VALUES
('shipping_1', 'Стандартная доставка', 'Доставка курьером по городу', 300.00, 5000.00, 3, true, 1),
('shipping_2', 'Экспресс доставка', 'Доставка в течение дня', 800.00, 10000.00, 1, true, 2),
('shipping_3', 'Самовывоз', 'Самовывоз из пункта выдачи', 0.00, NULL, 0, true, 3),
('shipping_4', 'Почта России', 'Доставка почтой', 200.00, 3000.00, 7, true, 4);

-- Базовые теги
INSERT IGNORE INTO `Tag` (`id`, `name`, `slug`, `description`) VALUES
('tag_1', 'Новинка', 'novinka', 'Новые поступления'),
('tag_2', 'Хит продаж', 'hit-prodazh', 'Популярные товары'),
('tag_3', 'Распродажа', 'rasprodazha', 'Товары со скидкой'),
('tag_4', 'Эксклюзив', 'eksklyuziv', 'Эксклюзивные товары');

