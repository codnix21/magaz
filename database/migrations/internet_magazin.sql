-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Хост: localhost
-- Время создания: Ноя 17 2025 г., 11:29
-- Версия сервера: 8.0.43-0ubuntu0.22.04.2
-- Версия PHP: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `internet_magazin`
--

-- --------------------------------------------------------

--
-- Структура таблицы `Address`
--

CREATE TABLE `Address` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('SHIPPING','BILLING','BOTH') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SHIPPING',
  `firstName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Россия',
  `region` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Область/Регион',
  `city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `postalCode` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `street` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Улица, дом, квартира',
  `isDefault` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `Address`
--

INSERT INTO `Address` (`id`, `userId`, `type`, `firstName`, `lastName`, `phone`, `country`, `region`, `city`, `postalCode`, `street`, `isDefault`, `createdAt`, `updatedAt`) VALUES
('addr_1763370994399_ijmag1kdl', 'user_1763369403875_d5w6opj5j', 'SHIPPING', 'Вадим', 'Бархатов', '87736693701', 'Россия', 'Иркутская область', 'Иркутск', '664046', '664046, г.Иркутск, ул.литвинова, д. 54 кв 2', 1, '2025-11-17 09:16:35.515', '2025-11-17 09:16:35.515');

-- --------------------------------------------------------

--
-- Структура таблицы `CartItem`
--

CREATE TABLE `CartItem` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `variantId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `CartItem`
--

INSERT INTO `CartItem` (`id`, `userId`, `productId`, `quantity`, `createdAt`, `updatedAt`, `variantId`) VALUES
('cart_1763377845941_lhx1j41bh', 'admin_1763307750606', 'prod_1763307752216_ijcjm0mhf', 1, '2025-11-17 11:10:46.662', '2025-11-17 11:10:46.662', NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `Notification`
--

CREATE TABLE `Notification` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('ORDER','SHIPMENT','PAYMENT','RETURN','REVIEW','SYSTEM') COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `link` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `read` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `Order`
--

CREATE TABLE `Order` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total` double NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `shippingAddress` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `promoCodeId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `discountAmount` double NOT NULL DEFAULT '0',
  `subtotal` double NOT NULL DEFAULT '0',
  `shippingMethodId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shippingCost` double NOT NULL DEFAULT '0',
  `paymentMethod` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CASH',
  `comment` text COLLATE utf8mb4_unicode_ci,
  `addressId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trackingNumber` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deliveryDate` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `Order`
--

INSERT INTO `Order` (`id`, `userId`, `total`, `status`, `shippingAddress`, `createdAt`, `updatedAt`, `promoCodeId`, `discountAmount`, `subtotal`, `shippingMethodId`, `shippingCost`, `paymentMethod`, `comment`, `addressId`, `trackingNumber`, `deliveryDate`) VALUES
('order_1763308251531_wgyd3kq50', 'admin_1763307750606', 12990, 'DELIVERED', 'рр5крк', '2025-11-16 15:50:51.693', '2025-11-17 10:57:01.050', NULL, 0, 0, NULL, 0, 'CASH', NULL, NULL, NULL, NULL),
('order_1763311243185_o0igtswim', 'admin_1763307750606', 12990, 'CANCELLED', 'мромм', '2025-11-16 16:40:43.329', '2025-11-17 10:57:01.043', NULL, 0, 12990, NULL, 0, 'CASH', NULL, NULL, NULL, NULL),
('order_1763312848561_35k504tgg', 'admin_1763307750606', 12990, 'CANCELLED', 'fnfgnfgn', '2025-11-16 17:07:28.707', '2025-11-17 10:57:01.050', NULL, 0, 12990, NULL, 0, 'CASH', NULL, NULL, NULL, NULL),
('order_1763371074837_8rv1itvn5', 'user_1763369403875_d5w6opj5j', 12990, 'CANCELLED', 'Россия, Иркутская область, Иркутск, 664046, 664046, г.Иркутск, ул.литвинова, д. 54 кв 2', '2025-11-17 09:17:56.071', '2025-11-17 10:57:01.049', NULL, 0, 12990, 'shipping_2', 0, 'online', NULL, 'addr_1763370994399_ijmag1kdl', NULL, NULL),
('order_1763371126390_m15no2gkc', 'user_1763369403875_d5w6opj5j', 79990, 'CANCELLED', 'Россия, Иркутская область, Иркутск, 664046, 664046, г.Иркутск, ул.литвинова, д. 54 кв 2', '2025-11-17 09:18:47.230', '2025-11-17 10:57:01.046', NULL, 0, 79990, 'shipping_2', 0, 'cash', NULL, 'addr_1763370994399_ijmag1kdl', NULL, NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `OrderItem`
--

CREATE TABLE `OrderItem` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `orderId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `price` double NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `variantId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `variantName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Название варианта на момент заказа'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `OrderItem`
--

INSERT INTO `OrderItem` (`id`, `orderId`, `productId`, `quantity`, `price`, `createdAt`, `variantId`, `variantName`) VALUES
('orderitem_1763308251686_wbzdia405', 'order_1763308251531_wgyd3kq50', 'prod_1763307752297_pl5x3xcd4', 1, 12990, '2025-11-16 15:50:51.844', NULL, NULL),
('orderitem_1763311243334_u9efkavq8', 'order_1763311243185_o0igtswim', 'prod_1763307752297_pl5x3xcd4', 1, 12990, '2025-11-16 16:40:43.784', NULL, NULL),
('orderitem_1763312848730_jxkxrcxdd', 'order_1763312848561_35k504tgg', 'prod_1763307752297_pl5x3xcd4', 1, 12990, '2025-11-16 17:07:28.870', NULL, NULL),
('orderitem_1763371075437_lpemjgcsb', 'order_1763371074837_8rv1itvn5', 'prod_1763307752297_pl5x3xcd4', 1, 12990, '2025-11-17 09:17:56.271', NULL, NULL),
('orderitem_1763371126589_lpxd4jjzf', 'order_1763371126390_m15no2gkc', 'prod_1763307751736_07t01e5gj', 1, 79990, '2025-11-17 09:18:47.430', NULL, NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `OrderReturn`
--

CREATE TABLE `OrderReturn` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `orderId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Причина возврата',
  `status` enum('PENDING','APPROVED','REJECTED','PROCESSING','COMPLETED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `refundAmount` double NOT NULL DEFAULT '0',
  `refundStatus` enum('PENDING','PROCESSING','COMPLETED','FAILED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `adminComment` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `OrderReturnItem`
--

CREATE TABLE `OrderReturnItem` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `returnId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `orderItemId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `Product`
--

CREATE TABLE `Product` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` double NOT NULL,
  `image` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `discountPercent` int NOT NULL DEFAULT '0',
  `originalPrice` double DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `Product`
--

INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `category`, `stock`, `createdAt`, `updatedAt`, `discountPercent`, `originalPrice`) VALUES
('prod_1763307751736_07t01e5gj', 'Смартфон iPhone 15', 'Новейший смартфон от Apple с революционными возможностями', 79990, 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500', 'Электроника', 15, '2025-11-16 15:42:31.902', '2025-11-16 15:42:31.902', 0, NULL),
('prod_1763307751894_yq36yfblc', 'Ноутбук MacBook Pro', 'Мощный ноутбук для профессионалов с процессором M3', 199990, 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500', 'Электроника', 8, '2025-11-16 15:42:31.982', '2025-11-16 15:42:31.982', 0, NULL),
('prod_1763307751974_gurbtfmj9', 'Джинсы классические', 'Качественные джинсы из премиального денима', 3990, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500', 'Одежда', 25, '2025-11-16 15:42:32.062', '2025-11-16 15:42:32.062', 0, NULL),
('prod_1763307752054_0u9z5s9lb', 'Футболка базовая', 'Удобная хлопковая футболка универсального дизайна', 990, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', 'Одежда', 50, '2025-11-16 15:42:32.142', '2025-11-16 15:42:32.142', 0, NULL),
('prod_1763307752135_50tgkk2mu', 'Кофемашина автоматическая', 'Автоматическая кофемашина для идеального эспрессо', 45990, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500', 'Дом и сад', 12, '2025-11-16 15:42:32.223', '2025-11-16 15:42:32.223', 0, NULL),
('prod_1763307752216_ijcjm0mhf', 'Беговая дорожка', 'Электрическая беговая дорожка для домашних тренировок', 89990, 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=500', 'Спорт', 5, '2025-11-16 15:42:32.304', '2025-11-16 15:42:32.304', 0, NULL),
('prod_1763307752297_pl5x3xcd4', 'Наушники беспроводные', 'Премиальные беспроводные наушники с шумоподавлением', 12990, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', 'Электроника', 20, '2025-11-16 15:42:32.387', '2025-11-16 15:42:32.387', 0, NULL),
('prod_1763307752380_eyihms79d', 'Кроссовки спортивные', 'Удобные спортивные кроссовки для бега и тренировок', 4990, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', 'Спорт', 30, '2025-11-16 15:42:32.468', '2025-11-16 15:42:32.468', 0, NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `ProductAttribute`
--

CREATE TABLE `ProductAttribute` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Название атрибута (например: "Материал", "Вес")',
  `value` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Значение атрибута',
  `order` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `ProductImage`
--

CREATE TABLE `ProductImage` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `alt` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order` int NOT NULL DEFAULT '0' COMMENT 'Порядок отображения',
  `isPrimary` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `ProductReservation`
--

CREATE TABLE `ProductReservation` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `orderId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ID заказа, для которого резервируется товар',
  `productId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `variantId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int NOT NULL,
  `status` enum('PENDING','CONFIRMED','RELEASED','EXPIRED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `expiresAt` datetime(3) NOT NULL COMMENT 'Время истечения резерва',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `ProductReservation`
--

INSERT INTO `ProductReservation` (`id`, `orderId`, `productId`, `variantId`, `quantity`, `status`, `expiresAt`, `createdAt`, `updatedAt`) VALUES
('reserve_1763371076481_tikz3kodz', 'order_1763371074837_8rv1itvn5', 'prod_1763307752297_pl5x3xcd4', NULL, 1, 'PENDING', '2025-11-17 17:47:56.481', '2025-11-17 09:17:57.659', '2025-11-17 09:17:57.659'),
('reserve_1763371127721_id4phw4h3', 'order_1763371126390_m15no2gkc', 'prod_1763307751736_07t01e5gj', NULL, 1, 'PENDING', '2025-11-17 17:48:47.721', '2025-11-17 09:18:48.952', '2025-11-17 09:18:48.952');

-- --------------------------------------------------------

--
-- Структура таблицы `ProductTag`
--

CREATE TABLE `ProductTag` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tagId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `ProductVariant`
--

CREATE TABLE `ProductVariant` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Название варианта (например: "Размер: L", "Цвет: Красный")',
  `value` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Значение варианта (например: "L", "red")',
  `sku` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Артикул варианта',
  `price` double DEFAULT NULL COMMENT 'Цена варианта (если отличается от базовой)',
  `stock` int NOT NULL DEFAULT '0',
  `image` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Изображение варианта',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `PromoCode`
--

CREATE TABLE `PromoCode` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `discountType` enum('PERCENTAGE','FIXED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PERCENTAGE',
  `discountValue` double NOT NULL,
  `minPurchaseAmount` double DEFAULT '0',
  `maxDiscountAmount` double DEFAULT NULL,
  `usageLimit` int DEFAULT NULL,
  `usedCount` int NOT NULL DEFAULT '0',
  `validFrom` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `validUntil` datetime(3) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `Review`
--

CREATE TABLE `Review` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` int NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ;

--
-- Дамп данных таблицы `Review`
--

INSERT INTO `Review` (`id`, `userId`, `productId`, `rating`, `comment`, `createdAt`, `updatedAt`) VALUES
('review_1763312163359_tjeotusub', 'admin_1763307750606', 'prod_1763307752380_eyihms79d', 5, 'отличные', '2025-11-16 16:56:03.495', '2025-11-16 16:56:03.495');

-- --------------------------------------------------------

--
-- Структура таблицы `ShippingMethod`
--

CREATE TABLE `ShippingMethod` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` double NOT NULL DEFAULT '0',
  `freeShippingThreshold` double DEFAULT NULL COMMENT 'Бесплатная доставка при заказе от суммы',
  `estimatedDays` int DEFAULT NULL COMMENT 'Примерное количество дней доставки',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `order` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `ShippingMethod`
--

INSERT INTO `ShippingMethod` (`id`, `name`, `description`, `price`, `freeShippingThreshold`, `estimatedDays`, `isActive`, `order`, `createdAt`, `updatedAt`) VALUES
('shipping_1', 'Стандартная доставка', 'Доставка курьером по городу', 300, 5000, 3, 1, 1, '2025-11-17 03:20:54.318', '2025-11-17 03:20:54.318'),
('shipping_2', 'Экспресс доставка', 'Доставка в течение дня', 800, 10000, 1, 1, 2, '2025-11-17 03:20:54.318', '2025-11-17 03:20:54.318'),
('shipping_3', 'Самовывоз', 'Самовывоз из пункта выдачи', 0, NULL, 0, 1, 3, '2025-11-17 03:20:54.318', '2025-11-17 03:20:54.318'),
('shipping_4', 'Почта России', 'Доставка почтой', 200, 3000, 7, 1, 4, '2025-11-17 03:20:54.318', '2025-11-17 03:20:54.318');

-- --------------------------------------------------------

--
-- Структура таблицы `Tag`
--

CREATE TABLE `Tag` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `Tag`
--

INSERT INTO `Tag` (`id`, `name`, `slug`, `description`, `createdAt`) VALUES
('tag_1', 'Новинка', 'novinka', 'Новые поступления', '2025-11-17 03:20:54.326'),
('tag_2', 'Хит продаж', 'hit-prodazh', 'Популярные товары', '2025-11-17 03:20:54.326'),
('tag_3', 'Распродажа', 'rasprodazha', 'Товары со скидкой', '2025-11-17 03:20:54.326'),
('tag_4', 'Эксклюзив', 'eksklyuziv', 'Эксклюзивные товары', '2025-11-17 03:20:54.326');

-- --------------------------------------------------------

--
-- Структура таблицы `Ticket`
--

CREATE TABLE `Ticket` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `orderId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Связанный заказ (если есть)',
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('OPEN','IN_PROGRESS','WAITING','RESOLVED','CLOSED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OPEN',
  `priority` enum('LOW','MEDIUM','HIGH','URGENT') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MEDIUM',
  `assignedTo` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ID администратора, назначенного на тикет',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `closedAt` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `TicketMessage`
--

CREATE TABLE `TicketMessage` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ticketId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ID отправителя (пользователь или админ)',
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `isInternal` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Внутреннее сообщение (видно только админам)',
  `attachments` json DEFAULT NULL COMMENT 'JSON массив с путями к файлам',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `User`
--

CREATE TABLE `User` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USER',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emailVerified` tinyint(1) NOT NULL DEFAULT '0',
  `phoneVerified` tinyint(1) NOT NULL DEFAULT '0',
  `oauthProvider` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `oauthId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `User`
--

INSERT INTO `User` (`id`, `email`, `name`, `password`, `role`, `createdAt`, `updatedAt`, `phone`, `emailVerified`, `phoneVerified`, `oauthProvider`, `oauthId`, `avatar`) VALUES
('admin_1763307750606', 'admin@example.com', 'Администратор', '$2a$10$K5cTQYTdFLnNzD.oEkHZrOVnZ/fhbZRKex7Hw8ytS9DlMksVIkiza', 'ADMIN', '2025-11-16 15:42:31.264', '2025-11-16 15:42:31.264', NULL, 0, 0, NULL, NULL, NULL),
('user_1763307751415', 'user@example.com', 'Тестовый пользователь', '$2a$10$BqzBgz/jkAbzeaFSS2SKXu7w.P037/Lg5bA.Yk4dH1TEVsWd4PyFi', 'USER', '2025-11-16 15:42:31.583', '2025-11-16 15:42:31.583', NULL, 0, 0, NULL, NULL, NULL),
('user_1763369403875_d5w6opj5j', 'deatheyes420@gmail.com', 'Alexander', '', 'USER', '2025-11-17 08:50:04.775', '2025-11-17 08:50:04.775', NULL, 1, 0, 'google', '113290119213347872623', NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `UserToken`
--

CREATE TABLE `UserToken` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('PASSWORD_RESET','EMAIL_VERIFICATION','PHONE_VERIFICATION','OAUTH') COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiresAt` datetime(3) NOT NULL,
  `used` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `Wishlist`
--

CREATE TABLE `Wishlist` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `Wishlist`
--

INSERT INTO `Wishlist` (`id`, `userId`, `productId`, `createdAt`) VALUES
('wish_1763311214738_2zhggpetb', 'admin_1763307750606', 'prod_1763307752297_pl5x3xcd4', '2025-11-16 16:40:14.882'),
('wish_1763312792342_hv2iyxjki', 'admin_1763307750606', 'prod_1763307752380_eyihms79d', '2025-11-16 17:06:32.486');

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `Address`
--
ALTER TABLE `Address`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Address_userId_idx` (`userId`),
  ADD KEY `idx_address_userid` (`userId`);

--
-- Индексы таблицы `CartItem`
--
ALTER TABLE `CartItem`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `CartItem_userId_productId_key` (`userId`,`productId`),
  ADD KEY `CartItem_userId_idx` (`userId`),
  ADD KEY `CartItem_productId_idx` (`productId`),
  ADD KEY `CartItem_variantId_idx` (`variantId`),
  ADD KEY `idx_cartitem_userid` (`userId`),
  ADD KEY `idx_cartitem_productid` (`productId`),
  ADD KEY `idx_cartitem_user_product_variant` (`userId`,`productId`,`variantId`);

--
-- Индексы таблицы `Notification`
--
ALTER TABLE `Notification`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Notification_userId_idx` (`userId`),
  ADD KEY `Notification_read_idx` (`read`),
  ADD KEY `Notification_type_idx` (`type`),
  ADD KEY `Notification_createdAt_idx` (`createdAt`),
  ADD KEY `idx_notification_userid` (`userId`),
  ADD KEY `idx_notification_read` (`userId`,`read`);

--
-- Индексы таблицы `Order`
--
ALTER TABLE `Order`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Order_userId_idx` (`userId`),
  ADD KEY `Order_status_idx` (`status`),
  ADD KEY `Order_createdAt_idx` (`createdAt`),
  ADD KEY `Order_promoCodeId_idx` (`promoCodeId`),
  ADD KEY `Order_shippingMethodId_idx` (`shippingMethodId`),
  ADD KEY `idx_order_userid` (`userId`),
  ADD KEY `idx_order_status` (`status`),
  ADD KEY `idx_order_createdat` (`createdAt`);

--
-- Индексы таблицы `OrderItem`
--
ALTER TABLE `OrderItem`
  ADD PRIMARY KEY (`id`),
  ADD KEY `OrderItem_orderId_idx` (`orderId`),
  ADD KEY `OrderItem_productId_idx` (`productId`),
  ADD KEY `idx_orderitem_orderid` (`orderId`),
  ADD KEY `idx_orderitem_productid` (`productId`);

--
-- Индексы таблицы `OrderReturn`
--
ALTER TABLE `OrderReturn`
  ADD PRIMARY KEY (`id`),
  ADD KEY `OrderReturn_orderId_idx` (`orderId`),
  ADD KEY `OrderReturn_userId_idx` (`userId`),
  ADD KEY `OrderReturn_status_idx` (`status`),
  ADD KEY `idx_orderreturn_orderid` (`orderId`),
  ADD KEY `idx_orderreturn_userid` (`userId`),
  ADD KEY `idx_orderreturn_status` (`status`);

--
-- Индексы таблицы `OrderReturnItem`
--
ALTER TABLE `OrderReturnItem`
  ADD PRIMARY KEY (`id`),
  ADD KEY `OrderReturnItem_returnId_idx` (`returnId`),
  ADD KEY `OrderReturnItem_orderItemId_idx` (`orderItemId`);

--
-- Индексы таблицы `Product`
--
ALTER TABLE `Product`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Product_category_idx` (`category`),
  ADD KEY `Product_name_idx` (`name`),
  ADD KEY `idx_product_category` (`category`),
  ADD KEY `idx_product_created` (`createdAt`),
  ADD KEY `idx_product_name` (`name`);
ALTER TABLE `Product` ADD FULLTEXT KEY `idx_product_search` (`name`,`description`);

--
-- Индексы таблицы `ProductAttribute`
--
ALTER TABLE `ProductAttribute`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ProductAttribute_productId_idx` (`productId`);

--
-- Индексы таблицы `ProductImage`
--
ALTER TABLE `ProductImage`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ProductImage_productId_idx` (`productId`),
  ADD KEY `ProductImage_order_idx` (`order`);

--
-- Индексы таблицы `ProductReservation`
--
ALTER TABLE `ProductReservation`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ProductReservation_orderId_idx` (`orderId`),
  ADD KEY `ProductReservation_productId_idx` (`productId`),
  ADD KEY `ProductReservation_status_idx` (`status`),
  ADD KEY `ProductReservation_expiresAt_idx` (`expiresAt`);

--
-- Индексы таблицы `ProductTag`
--
ALTER TABLE `ProductTag`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ProductTag_productId_tagId_key` (`productId`,`tagId`),
  ADD KEY `ProductTag_productId_idx` (`productId`),
  ADD KEY `ProductTag_tagId_idx` (`tagId`);

--
-- Индексы таблицы `ProductVariant`
--
ALTER TABLE `ProductVariant`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ProductVariant_productId_idx` (`productId`),
  ADD KEY `ProductVariant_sku_idx` (`sku`),
  ADD KEY `idx_productvariant_productid` (`productId`);

--
-- Индексы таблицы `PromoCode`
--
ALTER TABLE `PromoCode`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD UNIQUE KEY `PromoCode_code_key` (`code`),
  ADD KEY `PromoCode_code_idx` (`code`),
  ADD KEY `PromoCode_isActive_idx` (`isActive`);

--
-- Индексы таблицы `Review`
--
ALTER TABLE `Review`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Review_userId_productId_key` (`userId`,`productId`),
  ADD KEY `Review_productId_idx` (`productId`),
  ADD KEY `Review_rating_idx` (`rating`),
  ADD KEY `idx_review_productid` (`productId`),
  ADD KEY `idx_review_userid` (`userId`);

--
-- Индексы таблицы `ShippingMethod`
--
ALTER TABLE `ShippingMethod`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ShippingMethod_isActive_idx` (`isActive`);

--
-- Индексы таблицы `Tag`
--
ALTER TABLE `Tag`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD UNIQUE KEY `Tag_name_key` (`name`),
  ADD UNIQUE KEY `Tag_slug_key` (`slug`),
  ADD KEY `Tag_slug_idx` (`slug`);

--
-- Индексы таблицы `Ticket`
--
ALTER TABLE `Ticket`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Ticket_userId_idx` (`userId`),
  ADD KEY `Ticket_orderId_idx` (`orderId`),
  ADD KEY `Ticket_status_idx` (`status`),
  ADD KEY `Ticket_priority_idx` (`priority`),
  ADD KEY `Ticket_assignedTo_idx` (`assignedTo`);

--
-- Индексы таблицы `TicketMessage`
--
ALTER TABLE `TicketMessage`
  ADD PRIMARY KEY (`id`),
  ADD KEY `TicketMessage_ticketId_idx` (`ticketId`),
  ADD KEY `TicketMessage_userId_idx` (`userId`),
  ADD KEY `TicketMessage_createdAt_idx` (`createdAt`);

--
-- Индексы таблицы `User`
--
ALTER TABLE `User`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_email_key` (`email`),
  ADD KEY `User_email_idx` (`email`),
  ADD KEY `User_phone_idx` (`phone`),
  ADD KEY `idx_user_email` (`email`);

--
-- Индексы таблицы `UserToken`
--
ALTER TABLE `UserToken`
  ADD PRIMARY KEY (`id`),
  ADD KEY `UserToken_userId_idx` (`userId`),
  ADD KEY `UserToken_token_idx` (`token`(191)),
  ADD KEY `UserToken_type_idx` (`type`),
  ADD KEY `UserToken_expiresAt_idx` (`expiresAt`);

--
-- Индексы таблицы `Wishlist`
--
ALTER TABLE `Wishlist`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Wishlist_userId_productId_key` (`userId`,`productId`),
  ADD KEY `Wishlist_userId_idx` (`userId`),
  ADD KEY `Wishlist_productId_idx` (`productId`);

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `Address`
--
ALTER TABLE `Address`
  ADD CONSTRAINT `Address_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `CartItem`
--
ALTER TABLE `CartItem`
  ADD CONSTRAINT `CartItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `CartItem_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `Notification`
--
ALTER TABLE `Notification`
  ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `Order`
--
ALTER TABLE `Order`
  ADD CONSTRAINT `Order_shippingMethodId_fkey` FOREIGN KEY (`shippingMethodId`) REFERENCES `ShippingMethod` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `OrderItem`
--
ALTER TABLE `OrderItem`
  ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `OrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `OrderReturn`
--
ALTER TABLE `OrderReturn`
  ADD CONSTRAINT `OrderReturn_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `OrderReturn_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `OrderReturnItem`
--
ALTER TABLE `OrderReturnItem`
  ADD CONSTRAINT `OrderReturnItem_orderItemId_fkey` FOREIGN KEY (`orderItemId`) REFERENCES `OrderItem` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `OrderReturnItem_returnId_fkey` FOREIGN KEY (`returnId`) REFERENCES `OrderReturn` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `ProductAttribute`
--
ALTER TABLE `ProductAttribute`
  ADD CONSTRAINT `ProductAttribute_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `ProductImage`
--
ALTER TABLE `ProductImage`
  ADD CONSTRAINT `ProductImage_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `ProductReservation`
--
ALTER TABLE `ProductReservation`
  ADD CONSTRAINT `ProductReservation_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ProductReservation_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `ProductTag`
--
ALTER TABLE `ProductTag`
  ADD CONSTRAINT `ProductTag_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ProductTag_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `Tag` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `ProductVariant`
--
ALTER TABLE `ProductVariant`
  ADD CONSTRAINT `ProductVariant_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `Review`
--
ALTER TABLE `Review`
  ADD CONSTRAINT `Review_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `Review_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `Ticket`
--
ALTER TABLE `Ticket`
  ADD CONSTRAINT `Ticket_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Ticket_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `TicketMessage`
--
ALTER TABLE `TicketMessage`
  ADD CONSTRAINT `TicketMessage_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `Ticket` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `TicketMessage_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `UserToken`
--
ALTER TABLE `UserToken`
  ADD CONSTRAINT `UserToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `Wishlist`
--
ALTER TABLE `Wishlist`
  ADD CONSTRAINT `Wishlist_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `Wishlist_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
