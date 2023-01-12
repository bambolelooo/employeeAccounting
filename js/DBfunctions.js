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
			"View employees by department",
			"View the total utilized budget of a department",
			"Exit",
		],
	},
];

function main() {
	db.query("SHOW DATABASES LIKE 'employees';", (err, results) => {
		if (err) throw err;
		if (results.length === 0) {
			console.log(
				"Looks like you don't have 'employees' database.\nLet's create one together!"
			);
			DBsetupFunction();
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

			case "View employees by department":
				viewEmployeesByDepartment();
				break;

			case "View employees by manager":
				viewEmployeesByManager();
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
									roles_list[answers.role - 1].title
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

function viewEmployeesByManager() {
	db.query("SELECT * FROM employee", (err, results) => {
		if (err) throw err;
		const employees = results.map((employee) => {
			return {
				name: `${employee.first_name} ${employee.last_name}`,
				value: employee.id,
			};
		});
		inquirer
			.prompt([
				{
					name: "manager",
					type: "list",
					message:
						"Which manager's employees would you like to view?",
					choices: employees,
				},
			])
			.then((answers) => {
				db.query(
					`SELECT employee.id, employee.first_name as 'first name', employee.last_name as 'last name', role.title FROM role, employee WHERE manager_id = ? AND role.id = employee.role_id`,
					[answers.manager],
					(err, results) => {
						if (err) throw err;
						console.log(
							`\n${results.length} employees found under ${
								employees[answers.manager - 1].name
							}\n`
						);
						console.table(results);
						askQuestions();
					}
				);
			});
	});
}

function viewEmployeesByDepartment() {
	db.query("SELECT * FROM department", (err, results) => {
		if (err) throw err;
		const departments_array = results;
		const departments = results.map((department) => {
			return { name: department.name, value: department.id };
		});
		inquirer
			.prompt([
				{
					name: "department",
					type: "list",
					choices: departments,
					message: "Employees from which department you want to see",
				},
			])
			.then((answer) => {
				db.query(
					"SELECT CONCAT_WS(' ', first_name, last_name) as name, role.title, role.salary FROM employee, role WHERE (role.department_id = ? AND employee.role_id = role.id)",
					[answer.department],
					(err, results2) => {
						if (err) throw err;

						console.log(
							`Found ${results2.length} employees in ${
								departments_array[answer.department - 1].name
							}\n`
						);
						console.table(results2);

						askQuestions();
					}
				);
			});
	});
}

function viewBudget() {
	db.query("SELECT * FROM department", (err, results) => {
		if (err) throw err;
		const departments_array = results;
		const departments = results.map((department) => {
			return { name: department.name, value: department.id };
		});
		inquirer
			.prompt([
				{
					name: "department",
					type: "list",
					choices: departments,
					message: "Where would you like to see total budget?",
				},
			])
			.then((answer) => {
				db.query(
					"SELECT COALESCE(SUM(role.salary), 0) as budget FROM employee, role WHERE (role.department_id = ? AND employee.role_id = role.id)",
					[answer.department],
					(err, results) => {
						if (err) throw err;
						console.log(
							`Total budget for ${
								departments_array[answer.department - 1].name
							}`
						);
						console.table(results);
						askQuestions();
					}
				);
			});
	});
}

function DBsetupFunction() {
	function toSqlString(sqlFile) {
		return sqlFile.toString().replace(/(\r\n|\n|\r)/gm, " ");
	}
	function createDatabase(DBtype) {
		db.connect(function (err) {
			if (err) throw err;
			console.log("Connected to MySQL!");
			const sqlFile =
				DBtype === "Populated"
					? "./sql/createPopulatedDB.sql"
					: "./sql/createEmptyDB.sql";
			const sql = toSqlString(fs.readFileSync(sqlFile));
			db.query(toSqlString(sql), function (err) {
				if (err) throw err;
				console.log(
					`${
						DBtype === "Populated" ? "Populated" : "Empty"
					} database created\n`
				);
				db.query(
					"SELECT table_name as 'Created tables' FROM information_schema.tables WHERE table_type='BASE TABLE' AND table_schema = 'employees'; SELECT * FROM department; SELECT * FROM employee; SELECT * FROM role;",
					(err, results) => {
						if (err) throw err;

						results.map((result, i) => {
							if (i !== 0)
								console.log(
									results[0][i - 1]["Created tables"]
								);
							console.table(
								result.length !== 0 ? result : "(empty)\n"
							);
						});
						askQuestions();
					}
				);
			});
		});
	}

	// ask which type of db you need (populated, empty)
	inquirer
		.prompt([
			{
				name: "DBtype",
				type: "list",
				choices: ["Populated", "Empty"],
				message: "What type of DB do you need?",
			},
		])
		.then((answers) => {
			createDatabase(answers.DBtype);
		});
}

module.exports = { main };
