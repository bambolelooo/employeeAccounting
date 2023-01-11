const mysql = require("mysql2");
const inquirer = require("inquirer");
require("console.table");

const db = mysql.createConnection({
	host: process.env.HOST || "localhost",
	user: process.env.MYSQL_USR || "root",
	password: process.env.MYSQL_PWD || "",
	multipleStatements: true,
	database: "employees",
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
		main();
	});
}
function viewRoles() {
	db.query(
		"SELECT role.id, role.title, role.salary, department.name AS department FROM role, department WHERE role.department_id = department.id ORDER BY role.id",
		(err, results) => {
			if (err) throw err;
			console.table(results);
			main();
		}
	);
}

module.exports = { viewDepartments, main };
