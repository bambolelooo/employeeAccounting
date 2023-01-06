DROP SCHEMA IF EXISTS `employees` ;
CREATE SCHEMA IF NOT EXISTS `employees` ;
USE `employees` ;

CREATE TABLE `employees`.`department` (
  `id` INT NOT NULL,
  `name` VARCHAR(30) NOT NULL,
  PRIMARY KEY (`id`));

CREATE TABLE `employees`.`role` (
  `id` INT NOT NULL,
  `title` VARCHAR(30) NOT NULL,
  `salary` DECIMAL NULL,
  `department_id` INT NOT NULL,
  PRIMARY KEY (`id`),
    FOREIGN KEY (department_id) REFERENCES department(id)
  );

CREATE TABLE `employees`.`employee` (
  `id` INT NOT NULL,
  `first_name` VARCHAR(30) NOT NULL,
  `last_name` VARCHAR(30) NULL,
  `role_id` INT NOT NULL,
  `manager_id` INT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (role_id) REFERENCES role(id)
  
  );


