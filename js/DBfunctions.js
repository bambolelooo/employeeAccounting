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
			"Update employee managers",
			"View employees by manager",
			"Remove a department",
			"Remove a role",
			"Fire an employee",
			"View the total utilized budget of a department",
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
					"\n'employees' database not found creating an empty one\n"
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

			case "Update employee managers":
				updateEmployeeManager();
				break;

			case "View employees by manager":
				viewEmployeesByManager();
				break;

			case "Remove a department":
				removeDepartment();
				break;

			case "Remove a role":
				removeRole();
				break;

			case "Fire an employee":
				fireEmployee();
				break;

			case "View the total utilized budget of a department":
				viewBudget();
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
		"SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT_WS(' ', manager.first_name, manager.last_name) AS manager FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee manager ON employee.manager_id = manager.id ORDER BY employee.id",
		(err, results) => {
			if (err) throw err;
			console.table(results);
			askQuestions();
		}
	);
}

function addDepartment() {
	inquirer
		.prompt([
			{
				name: "name",
				type: "input",
				message: "What is the name of the new department?",
			},
		])
		.then((answers) => {
			db.query(
				"INSERT INTO department (name) VALUES (?)",
				[answers.name],
				(err) => {
					if (err) throw err;
					console.log(`\nAdded ${answers.name} to departments\n`);
					askQuestions();
				}
			);
		});
}

function addRole() {
	db.query("SELECT * FROM department", (err, results) => {
		if (err) throw err;
		const departments = results.map((department) => {
			return {
				name: department.name,
				value: department.id,
			};
		});
		inquirer
			.prompt([
				{
					name: "title",
					type: "input",
					message: "What is the title of the new role?",
				},
				{
					name: "salary",
					type: "input",
					message: "What is the salary of the new role?",
				},
				{
					name: "department",
					type: "list",
					message: "What department does the new role belong to?",
					choices: departments,
				},
			])
			.then((answers) => {
				db.query(
					"INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)",
					[answers.title, answers.salary, answers.department],
					(err) => {
						if (err) throw err;
						console.log(`\nAdded '${answers.title}' to roles\n`);
						askQuestions();
					}
				);
			});
	});
}

function addEmployee() {
	db.query("SELECT * FROM role", (err, results) => {
		if (err) throw err;
		const roles = results.map((role) => {
			return {
				name: role.title,
				value: role.id,
			};
		});
		db.query("SELECT * FROM employee", (err, results) => {
			if (err) throw err;
			const employees = results.map((employee) => {
				return {
					name: `${employee.first_name} ${employee.last_name}`,
					value: employee.id,
				};
			});
			employees.unshift({ name: "None", value: null });
			inquirer
				.prompt([
					{
						name: "first_name",
						type: "input",
						message: "What is the first name of the new employee?",
					},
					{
						name: "last_name",
						type: "input",
						message: "What is the last name of the new employee?",
					},
					{
						name: "role",
						type: "list",
						message: "What is the role of the new employee?",
						choices: roles,
					},
					{
						name: "manager",
						type: "list",
						message: "Who is the manager of the new employee?",
						choices: employees,
					},
				])
				.then((answers) => {
					db.query(
						"INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)",
						[
							answers.first_name,
							answers.last_name,
							answers.role,
							answers.manager,
						],
						(err) => {
							if (err) throw err;
							console.log(
								`\nAdded '${answers.first_name} ${answers.last_name}' to employees\n`
							);
							askQuestions();
						}
					);
				});
		});
	});
}

function updateEmployeeRole() {
	db.query("SELECT * FROM employee", (err, results) => {
		if (err) throw err;
		const employees_list = results;
		const employees = results.map((employee) => {
			return {
				name: `${employee.first_name} ${employee.last_name}`,
				value: employee.id,
			};
		});
		db.query("SELECT * FROM role", (err, results) => {
			if (err) throw err;
			const roles_list = results;

			const roles = results.map((role) => {
				return {
					name: role.title,
					value: role.id,
				};
			});
			inquirer
				.prompt([
					{
						name: "employee",
						type: "list",
						message:
							"Which employee's role would you like to update?",
						choices: employees,
					},
					{
						name: "role",
						type: "list",
						message: "What is the new role of the employee?",
						choices: roles,
					},
				])
				.then((answers) => {
					db.query(
						"UPDATE employee SET role_id = ? WHERE id = ?",
						[answers.role, answers.employee],
						(err) => {
							if (err) throw err;
							console.log(
								`\nUpdated ${
									employees_list[answers.employee - 1]
										.first_name
								} ${
									employees_list[answers.employee - 1]
										.last_name
								}'s role to '${
									roles_list[answers.role].title
								}'\n`
							);
							askQuestions();
						}
					);
				});
		});
	});
}

function updateEmployeeManager() {
	db.query("SELECT * FROM employee", (err, results) => {
		if (err) throw err;
		const employees_list = results;
		const employees = results.map((employee) => {
			return {
				name: `${employee.first_name} ${employee.last_name}`,
				value: employee.id,
			};
		});
		inquirer
			.prompt([
				{
					name: "employee",
					type: "list",
					message:
						"Which employee's manager would you like to update?",
					choices: employees,
				},
			])
			.then((answers) => {
				db.query(
					"SELECT * FROM employee WHERE id != ?",
					[answers.employee],
					(err, results) => {
						if (err) throw err;
						const managers = results.map((manager) => {
							return {
								name: `${manager.first_name} ${manager.last_name}`,
								value: manager.id,
							};
						});
						managers.unshift({ name: "None", value: null });

						inquirer
							.prompt([
								{
									name: "manager",
									type: "list",
									message:
										"Who is the new manager of the employee?",
									choices: managers,
								},
							])
							.then((answers2) => {
								db.query(
									"UPDATE employee SET manager_id = ? WHERE id = ?",
									[answers2.manager, answers.employee],
									(err) => {
										console.log(answers2.manager);
										if (err) throw err;
										if (answers2.manager === null) {
											console.log(
												`${
													employees_list[
														answers.employee - 1
													].first_name
												} ${
													employees_list[
														answers.employee - 1
													].last_name
												} does not have a manager anymore\n`
											);
										} else {
											console.log(
												`\nUpdated ${
													employees_list[
														answers.employee - 1
													].first_name
												} ${
													employees_list[
														answers.employee - 1
													].last_name
												}'s manager to ${
													employees_list[
														answers2.manager - 1
													].first_name
												} ${
													employees_list[
														answers2.manager - 1
													].last_name
												}\n`
											);
										}

										askQuestions();
									}
								);
							});
					}
				);
			});
	});
}

module.exports = { main };
