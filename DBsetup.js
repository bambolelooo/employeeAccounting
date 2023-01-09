const inquirer = require("inquirer");
const mysql = require("mysql2");
const fs = require("fs");
const { exit } = require("process");
require("dotenv").config();

// create connection to mysql
const con = mysql.createConnection({
	host: "127.0.0.1",
	socketPath: process.env.MYSQL_SOCKET || "/var/run/mysqld/mysqld.sock",
	user: process.env.MYSQL_USR || "root",
	password: process.env.MYSQL_PWD || "",
	multipleStatements: true,
});

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
			if (err) {
				console.log(err);
				throw err;
			}
			console.log("Database created");
			exit();
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
