# База данных MySQL

## Установка и настройка

### 1. Создание базы данных

```sql
CREATE DATABASE IF NOT EXISTS `internet_magazin` 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
```

### 2. Импорт дампа

```bash
mysql -u root -p internet_magazin < database/dump.sql
```

Или через MySQL Workbench / phpMyAdmin:
1. Откройте файл `database/dump.sql`
2. Выполните SQL скрипт

### 3. Настройка подключения

Добавьте в `.env` файл:

```env
DATABASE_URL="mysql://magazin:Magazin1337@codnix.ru:3306/internet_magazin"
```

**Важно:** 
- Если порт не стандартный (3306), укажите его в URL: `:3306`
- Если используется SSL, добавьте `?sslaccept=strict` или `?sslmode=require` в конце URL
- Для безопасного подключения через SSL: `DATABASE_URL="mysql://magazin:Magazin1337@codnix.ru:3306/internet_magazin?sslmode=require"`

### 4. Применение схемы через Prisma

```bash
npm run db:generate
npx prisma db push
```

### 5. Заполнение тестовыми данными

```bash
npm run db:seed
```

**Важно:** Скрипт `db:seed` создаст пользователей с правильными bcrypt хешами паролей:
- Администратор: `admin@example.com` / `admin123`
- Пользователь: `user@example.com` / `user123`

## Структура базы данных

### Таблицы

1. **User** - Пользователи системы
   - `id` - Уникальный идентификатор (VARCHAR)
   - `email` - Email (уникальный)
   - `name` - Имя пользователя
   - `password` - Хеш пароля (bcrypt)
   - `role` - Роль (USER/ADMIN)

2. **Product** - Товары
   - `id` - Уникальный идентификатор
   - `name` - Название товара
   - `description` - Описание
   - `price` - Цена
   - `image` - URL изображения
   - `category` - Категория
   - `stock` - Количество на складе

3. **CartItem** - Элементы корзины
   - `id` - Уникальный идентификатор
   - `userId` - ID пользователя
   - `productId` - ID товара
   - `quantity` - Количество

4. **Order** - Заказы
   - `id` - Уникальный идентификатор
   - `userId` - ID пользователя
   - `total` - Общая сумма
   - `status` - Статус (PENDING/PROCESSING/SHIPPED/DELIVERED/CANCELLED)
   - `shippingAddress` - Адрес доставки

5. **OrderItem** - Элементы заказа
   - `id` - Уникальный идентификатор
   - `orderId` - ID заказа
   - `productId` - ID товара
   - `quantity` - Количество
   - `price` - Цена на момент заказа

## Индексы

Для оптимизации производительности созданы следующие индексы:

- `User.email` - Поиск по email
- `Product.category` - Фильтрация по категориям
- `Product.name` - Поиск по названию
- `CartItem.userId` - Быстрый доступ к корзине пользователя
- `Order.userId` - История заказов пользователя
- `Order.status` - Фильтрация заказов по статусу
- `Order.createdAt` - Сортировка по дате

## Резервное копирование

### Создание бэкапа

```bash
mysqldump -u root -p internet_magazin > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Восстановление из бэкапа

```bash
mysql -u root -p internet_magazin < backup_20240101_120000.sql
```

## Миграции через Prisma

Для продакшена рекомендуется использовать Prisma Migrations:

```bash
# Создание миграции
npx prisma migrate dev --name init

# Применение миграций в продакшене
npx prisma migrate deploy
```

