DROP DATABASE IF EXISTS employees;
CREATE DATABASE employees;
USE employees;

CREATE TABLE employees.department (
  id INT NOT NULL,
  name VARCHAR(30) NOT NULL,
  PRIMARY KEY (id));

CREATE TABLE employees.role (
  id INT NOT NULL,
  title VARCHAR(30) NOT NULL,
  salary DECIMAL NULL,
  department_id INT NOT NULL,
  PRIMARY KEY (id),
    FOREIGN KEY (department_id) REFERENCES department(id)
  );

CREATE TABLE employees.employee (
  id INT NOT NULL,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NULL,
  role_id INT NOT NULL,
  manager_id INT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (role_id) REFERENCES role(id)
  
  );

INSERT INTO employees.department (id, name) VALUES ('1', 'centralDep');
INSERT INTO employees.department (id, name) VALUES ('2', 'yorkDep');
INSERT INTO employees.department (id, name) VALUES ('3', 'barrieDep');

INSERT INTO employees.role (id,title,salary,department_id) VALUES (1,'intern',30000,2);
INSERT INTO employees.role (id,title,salary,department_id) VALUES (2,'junior engineer',50000,3);
INSERT INTO employees.role (id,title,salary,department_id) VALUES (3,'middle engineer',90000,2);
INSERT INTO employees.role (id,title,salary,department_id) VALUES (4,'senior engineer',120000,1);
INSERT INTO employees.role (id,title,salary,department_id) VALUES (5,'team lead',120000,1);
INSERT INTO employees.role (id,title,salary,department_id) VALUES (6,'project manager',125000,3);
INSERT INTO employees.role (id,title,salary,department_id) VALUES (7,'boss',150000,1);

INSERT INTO employees.employee (id,first_name,last_name,role_id,manager_id) VALUES (1,'John','Doe',1,3);
INSERT INTO employees.employee (id,first_name,last_name,role_id,manager_id) VALUES (2,'Mary','Bloods',2,3);
INSERT INTO employees.employee (id,first_name,last_name,role_id,manager_id) VALUES (3,'Tim','Leaderson',5,4);
INSERT INTO employees.employee (id,first_name,last_name,role_id,manager_id) VALUES (4,'Man','Ager',6,5);
INSERT INTO employees.employee (id,first_name,last_name,role_id,manager_id) VALUES (5,'Joe','Biden',7, NULL);
INSERT INTO employees.employee (id,first_name,last_name,role_id,manager_id) VALUES (6,'Alexis','White',3,3);
INSERT INTO employees.employee (id,first_name,last_name,role_id,manager_id) VALUES (7,'Megatron','Griffin',4,3);

