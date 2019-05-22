const Utils = require("./utils"),
	htmlEntities = require("he"),
	htmlToMarkdown = require("h2m")

class Page {

	constructor(page) {
		// Normalize on instantiation
		this.page = this.processPage(page);
		this.utils = new Utils();
	}

	get title() {
		let title = this.utils.slugify(htmlEntities.decode(this.page.title));
		// Prepend dates to posts
		if (this.page.type !== "page") {
			title = `${this.utils.dateify(this.page.date)}-${title}`;
		}
		return title;
	}

	get directory() {
		return `./output/${this.page.type}/${this.title}`
	}

	renderAsMarkdown() {

		const markdownContent = htmlToMarkdown(this.page.content);

		// Create frontmatter
		let output = "---\n";

		for (let key in this.page) {
			if (key !== "content") {
				output += `${key}: "${this.page[key]}"\n`;	
			}
		}

		output += "---\n";

		// Add in markdown content
		output += markdownContent;

		return output;
	}

	processPage(page) {
		for (let key in page) {
			// Process out rendered content
			page[key] = page[key] && page[key].rendered ? page[key].rendered : page[key];
		}

		// Normalize the content
		page.content = page.content || page.post_content || page.excerpt;
		delete page.excerpt;
		delete page.post_content;

		return page;
	}

}

module.exports = Page;