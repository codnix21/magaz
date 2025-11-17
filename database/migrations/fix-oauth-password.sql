-- Исправление для поддержки OAuth пользователей (password может быть NULL)
USE `internet_magazin`;

-- Изменяем поле password, чтобы оно могло быть NULL для OAuth пользователей
SET @column_type = (
  SELECT COLUMN_TYPE 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'User' 
    AND COLUMN_NAME = 'password'
);

SET @sql = IF(@column_type LIKE '%NOT NULL%',
  'ALTER TABLE `User` MODIFY COLUMN `password` VARCHAR(191) NULL',
  'SELECT 1 as skip'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

