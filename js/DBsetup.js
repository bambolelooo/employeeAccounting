const inquirer = require("inquirer");
const mysql = require("mysql2");
const fs = require("fs");
const { exit } = require("process");
require("console.table");
require("dotenv").config();

// create connection to mysql
const con = mysql.createConnection({
	host: "127.0.0.1",
	socketPath: process.env.MYSQL_SOCKET || "/var/run/mysqld/mysqld.sock",
	user: process.env.MYSQL_USR || "root",
	password: process.env.MYSQL_PWD || "",
	multipleStatements: true,
});

function DBsetup() {
	function toSqlString(sqlFile) {
		return sqlFile.toString().replace(/(\r\n|\n|\r)/gm, " ");
	}
	function createDatabase(DBtype) {
		con.connect(function (err) {
			if (err) throw err;
			console.log("Connected to MySQL!");
			const sqlFile =
				DBtype === "Populated"
					? "./sql/createPopulatedDB.sql"
					: "./sql/createEmptyDB.sql";
			const sql = toSqlString(fs.readFileSync(sqlFile));
			con.query(toSqlString(sql), function (err) {
				if (err) throw err;
				console.log(
					`${
						DBtype === "Populated" ? "Populated" : "Empty"
					} database created\n`
				);
				con.query(
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

						exit();
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

DBsetup();
