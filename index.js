const JsonToMarkdown = require("./converter.js"),
	program = require("commander");

// Use Commander.js to implement a command line interface
program
	.version("1.0.0")
	.description("Convert WordPress content to markdown using the WordPress API")
	.option("-u, --url <type>", "WordPress API URL Base")
	.option("-t, --type <type>", "Post type to process", "pages")
	.option("-n, --number <type>", "Maximum number of entries to process", 100);

program.parse(process.argv); 

const converter = new JsonToMarkdown(program);
converter.run();