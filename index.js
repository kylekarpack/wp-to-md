const JsonToMarkdown = require("./converter.js"),
	program = require("commander"),
	package = require("./package.json")

// Use Commander.js to implement a command line interface
program
	.version(package.version)
	.description(package.description)
	.option("-u, --url <type>", "WordPress API URL Base")
	.option("-o, --output <type>", "Output directory", "./output")
	.option("-t, --type <type>", "Post type to process", "pages")
	.option("-n, --number <type>", "Maximum number of entries to process", 100);

program.parse(process.argv); 

const converter = new JsonToMarkdown(program);
converter.run();