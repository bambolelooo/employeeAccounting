const mysql = require("mysql2");
const inquirer = require("inquirer");
const fs = require("fs");
require("console.table");

const db = mysql.createConnection({
	host: process.env.HOST || "localhost",
	user: process.env.MYSQL_USR || "root",
	password: process.env.MYSQL_PWD || "",
	multipleStatements: true,
	// database: "employees",
});

const questions = [
	{
		name: "action",
		type: "list",
		message: "What would you like to do?\n",
		choices: [
			"View all departments",
			"View all roles",
			"View all employees",
			"Add a department",
			"Add a role",
			"Add an employee",
			"Update an employee role",
			"Exit",
		],
	},
];

function main() {
	db.query("SHOW DATABASES LIKE 'employees';", (err, results) => {
		if (err) throw err;
		if (results.length === 0) {
			const emptyDBstring = fs
				.readFileSync("./sql/createEmptyDB.sql")
				.toString()
				.replace(/(\r\n|\n|\r)/gm, " ");
			db.query(emptyDBstring, (err) => {
				if (err) throw err;
				console.log(
					"\nEmpty database 'employees' created because couldn't find one.\n"
				);
				askQuestions();
			});
		} else {
			db.query("USE employees", (err) => {
				if (err) throw err;
				console.log("\n'employees' database found\n");
				askQuestions();
			});
		}
	});
}

function askQuestions() {
	inquirer.prompt(questions).then((answers) => {
		switch (answers.action) {
			case "View all departments":
				viewDepartments();
				break;

			case "View all roles":
				viewRoles();
				break;

			case "View all employees":
				viewEmployees();
				break;

			case "Add a department":
				addDepartment();
				break;

			case "Add a role":
				addRole();
				break;

			case "Add an employee":
				addEmployee();
				break;

			case "Update an employee role":
				updateEmployeeRole();
				break;

			case "Update an employee role":
				updateEmployeeRole();
				break;

			case "Exit":
				console.log("Goodbye!");
				process.exit();
		}
	});
}

function viewDepartments() {
	db.query("SELECT * FROM department", (err, results) => {
		if (err) throw err;
		console.table(results);
		askQuestions();
	});
}
function viewRoles() {
	db.query(
		"SELECT role.id, role.title, role.salary, department.name AS department FROM role JOIN department ON role.department_id = department.id ORDER BY role.id",
		(err, results) => {
			if (err) throw err;
			console.table(results);
			askQuestions();
		}
	);
}

function viewEmployees() {
	db.query(
		"SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT_WS(' ', manager.first_name, manager.last_name) AS manager FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id JOIN employee manager ON employee.manager_id = manager.id ORDER BY employee.id;",
		(err, results) => {
			if (err) throw err;
			console.table(results);
			askQuestions();
		}
	);
}

module.exports = { main };
