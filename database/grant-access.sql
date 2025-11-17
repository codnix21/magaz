-- Скрипт для разрешения доступа к базе данных
-- Для MySQL 8.0+

-- РЕКОМЕНДУЕМЫЙ ВАРИАНТ: Создать пользователя с конкретного IP
-- Выполните эти команды по очереди:

-- 1. Создать пользователя (если не существует)
CREATE USER IF NOT EXISTS 'Magazin'@'185.23.11.118' IDENTIFIED BY 'Magazin13371';

-- 2. Дать привилегии на базу данных
GRANT ALL PRIVILEGES ON internet_magazin.* TO 'Magazin'@'185.23.11.118';

-- 3. Применить изменения
FLUSH PRIVILEGES;

-- ============================================
-- АЛЬТЕРНАТИВНЫЕ ВАРИАНТЫ:
-- ============================================

-- Вариант 1: Если IF NOT EXISTS не поддерживается, создайте без него:
-- CREATE USER 'Magazin'@'185.23.11.118' IDENTIFIED BY 'Magazin13371';
-- GRANT ALL PRIVILEGES ON internet_magazin.* TO 'Magazin'@'185.23.11.118';
-- FLUSH PRIVILEGES;

-- Вариант 2: Разрешить доступ со всех IP (менее безопасно, но проще):
-- CREATE USER IF NOT EXISTS 'Magazin'@'%' IDENTIFIED BY 'Magazin13371';
-- GRANT ALL PRIVILEGES ON internet_magazin.* TO 'Magazin'@'%';
-- FLUSH PRIVILEGES;

-- Вариант 3: Если пользователь уже существует с другим IP, обновите его:
-- ALTER USER 'Magazin'@'localhost' IDENTIFIED BY 'Magazin13371';
-- CREATE USER 'Magazin'@'185.23.11.118' IDENTIFIED BY 'Magazin13371';
-- GRANT ALL PRIVILEGES ON internet_magazin.* TO 'Magazin'@'185.23.11.118';
-- FLUSH PRIVILEGES;

