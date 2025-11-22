-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS preppal;

-- Select the database to run commands against
USE preppal;

-- Create the table structure
DROP TABLE IF EXISTS `recipes`;
CREATE TABLE recipes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    calories INT,
    protein INT,
    carbs INT,
    ingredients TEXT,
    image_path VARCHAR(255)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;

-- Insert the initial data
INSERT INTO `recipes` VALUES (1,'chicken',300,'i dont know','chicken_veg.jpg');

-- 1. Create the Users table to store registration info
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `height` double DEFAULT NULL,
  `weight` double DEFAULT NULL,
  `age` int DEFAULT NULL,
  `goal` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username_UNIQUE` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Update Recipes table to create a relationship
-- This adds a 'user_id' column to recipes so we know who owns the recipe
ALTER TABLE `recipes` 
ADD COLUMN `user_id` INT NULL,
ADD INDEX `fk_recipes_users_idx` (`user_id` ASC);

-- 3. Add the Foreign Key constraint
ALTER TABLE `recipes` 
ADD CONSTRAINT `fk_recipes_users`
  FOREIGN KEY (`user_id`)
  REFERENCES `users` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;
  
  
  SELECT * FROM recipes