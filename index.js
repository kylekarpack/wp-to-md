const JsonToMarkdown = require("./converter.js"),
	postTypes = require("./config").postTypes,
	perPage = require("./config").perPage;

const converter = new JsonToMarkdown();

// For my site
for (let postType of postTypes) {
	converter.run(postType, perPage);
}