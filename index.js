const inquirer = require("inquirer");
const fs = require("fs");
const mysql = require("mysql2");
const figlet = require("figlet");
require("dotenv").config();

const { main } = require("./js/DBfunctions");

console.log(
	figlet.textSync("Employee accounting", {
		font: "Graceful",
		horizontalLayout: "default",
		verticalLayout: "default",
		whitespaceBreak: true,
		width: process.stdout.columns,
	})
);

main();
