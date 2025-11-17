-- Добавляем акции к товарам
UPDATE `Product` SET 
  `discountPercent` = 15,
  `originalPrice` = 79990
WHERE `id` = 'prod_1763307751736_07t01e5gj'; -- iPhone 15

UPDATE `Product` SET 
  `discountPercent` = 20,
  `originalPrice` = 199990
WHERE `id` = 'prod_1763307751894_yq36yfblc'; -- MacBook Pro

UPDATE `Product` SET 
  `discountPercent` = 10,
  `originalPrice` = 3990
WHERE `id` = 'prod_1763307751974_gurbtfmj9'; -- Джинсы

UPDATE `Product` SET 
  `discountPercent` = 25,
  `originalPrice` = 12990
WHERE `id` = 'prod_1763307752297_pl5x3xcd4'; -- Наушники

UPDATE `Product` SET 
  `discountPercent` = 30,
  `originalPrice` = 4990
WHERE `id` = 'prod_1763307752380_eyihms79d'; -- Кроссовки

