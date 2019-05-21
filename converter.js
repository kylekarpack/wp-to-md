const config = require("./config"),
	Utils = require("./utils"),
	fs = require("fs"),
	he = require("he"),
	request = require("request-promise"),
	h2m = require("h2m");

class JsonToMarkdown {

	constructor() {
		this.utils = new Utils();
	}

	async getPages(endpoint, perPage) {
		let pagesResult = await request.get(`${config.wpBaseUrl}/wp-json/wp/v2/${endpoint}?per_page=${perPage}`);
		return JSON.parse(pagesResult);
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

	buildMarkdownFromPage(inputPage) {

		const page = { ...inputPage }; // Make a copy for non-destructive edits

		const markdownContent = h2m(page.content);
		delete page.content;

		// Create frontmatter
		let output = "---\n";

		for (let key in page) {
			output += `${key}: "${page[key]}"\n`;	
		}

		output += "---\n";

		// Add in markdown content
		output += markdownContent;

		return output;

	}

	async run(endpoint = "pages", perPage = 100) {
		const pages = await this.getPages(endpoint, perPage);
		for (let page of pages) {
			page = this.processPage(page);

			let title = this.utils.slugify(he.decode(page.title));

			// Prepend dates to posts
			if (endpoint !== "pages") {
				title = `${this.utils.dateify(page.date)}-${title}`;
			}

			if (title) {
				const content = this.buildMarkdownFromPage(page),
					directory = `./output/${endpoint}/${title}`;

				fs.mkdirSync(directory, { recursive: true });
				fs.writeFileSync(`${directory}/index.md`, content);
			}

		}
		console.info(`Converted ${pages.length} ${endpoint}`);
	}


}

module.exports = JsonToMarkdown;